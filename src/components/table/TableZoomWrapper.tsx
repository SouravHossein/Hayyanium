import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { TableDetailLevel, TableZoomMode } from './zoomTypes';
import { Fullscreen, Maximize2, Minus, Plus } from 'lucide-react';

interface TableZoomWrapperProps {
  children: (scale: number, detailLevel: TableDetailLevel) => React.ReactNode;
  mode?: TableZoomMode;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  mobileBottomOffset?: number;
}

export interface TableZoomRef {
  zoomToElement: (elementId: string | number) => void;
  resetTransform: () => void;
}

const ABS_MIN_SCALE = 0.35;
const SPREADSHEET_MAX_SCALE = 3;

const BASE_CELL_SIZE = 56;
const BASE_GAP_SIZE = 4;
const BASE_LABEL_SIZE = 34;
const PHONE_MEDIA_QUERY = '(max-width: 640px)';

const lerp = (from: number, to: number, alpha: number) => from + (to - from) * alpha;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const softenGrowth = (scale: number, factor: number) => (scale <= 1 ? scale : 1 + (scale - 1) * factor);

const getDetailLevelWithHysteresis = (
  current: TableDetailLevel,
  scale: number,
): TableDetailLevel => {
  if (current === 'small') {
    return scale >= 0.95 ? 'medium' : 'small';
  }
  if (current === 'medium') {
    if (scale < 0.85) return 'small';
    if (scale >= 1.35) return 'large';
    return 'medium';
  }
  return scale < 1.2 ? 'medium' : 'large';
};

const detailLevelFromScale = (scale: number): TableDetailLevel => {
  if (scale < 0.9) return 'small';
  if (scale < 1.3) return 'medium';
  return 'large';
};

const isInteractiveTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(
      'a,button,input,textarea,select,label,[role="button"],[data-no-pan="true"],[draggable="true"]',
    ),
  );
};

// Zoom preset steps for the mobile stepper
const ZOOM_STEPS = [
  { key: 'fit', label: 'Fit', Icon: Fullscreen },
  { key: 'med', label: 'Med', Icon: Maximize2 },
] as const;

type ZoomStepKey = typeof ZOOM_STEPS[number]['key'];

/** Floating percentage toast — appears on zoom change, fades out after delay */
const ZoomToast = ({ scale, visible }: { scale: number; visible: boolean }) => (
  <div
    aria-live="polite"
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      pointerEvents: 'none',
      zIndex: 60,
      transition: 'opacity 0.35s ease, transform 0.35s ease',
      opacity: visible ? 1 : 0,
      transform: visible
        ? 'translate(-50%, -50%) scale(1)'
        : 'translate(-50%, -50%) scale(0.85)',
    }}
  >
    <div
      style={{
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        color: '#fff',
        fontVariantNumeric: 'tabular-nums',
        fontSize: '1.5rem',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        padding: '0.35em 0.7em',
        borderRadius: '0.6em',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {Math.round(scale * 100)}%
    </div>
  </div>
);

/** Mobile zoom toggle — single button that cycles  Med / Fit */
const MobileZoomToggle = ({
  activeStep,
  opacity,
  onToggle,
  isVisible,
}: {
  activeStep: ZoomStepKey;
  opacity: number;
  onToggle: () => void;
  isVisible: boolean;
}) => {
  const nextStep = activeStep === 'fit' ? 'med' : 'fit';
  const nextConfig = ZOOM_STEPS.find((step) => step.key === nextStep) ?? ZOOM_STEPS[0];
  const NextIcon = nextConfig.Icon;

  return (
    <button
      onClick={onToggle}
      aria-label={`Zoom to ${nextConfig.label}`}
      title={`Zoom to ${nextConfig.label}`}
      data-no-pan="true"
      style={{
        height: 44,
        width: 44,
        borderRadius: '9999px',
        border: '1px solid rgba(148,163,184,0.28)',
        background: 'rgba(15,23,42,0.88)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 6px 18px rgba(15,23,42,0.18)',
        color: '#e2e8f0',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isVisible ? opacity : 0.6,
        transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
        cursor: 'pointer',
        pointerEvents: isVisible ? 'auto' : 'none',
        zIndex: 100,
      }}
    >
      <NextIcon size={20} strokeWidth={2.3} />
    </button>
  );
};

const DesktopZoomControls = ({
  isSpreadsheetMode,
  currentStep,
  scale,
  onZoomIn,
  onZoomOut,
  onSetFit,
  onSetMedium,
  showModeToggle = false,
}: {
  isSpreadsheetMode: boolean;
  currentStep: ZoomStepKey;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSetFit: () => void;
  onSetMedium: () => void;
  showModeToggle?: boolean;
}) => {
  const toggleLabel = currentStep === 'fit' ? 'Zoom to medium' : 'Zoom to fit';
  const ToggleIcon = currentStep === 'fit' ? Maximize2 : Fullscreen;

  return (
    <div className="fixed bottom-4 right-4 z-50 hidden sm:flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/92 p-1 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-950/90">
      <button
        onClick={onZoomOut}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        title="Zoom out"
        aria-label="Zoom out"
      >
        <Minus size={16} strokeWidth={2.4} />
      </button>
      {showModeToggle ? (
        <button
          onClick={currentStep === 'fit' ? onSetMedium : onSetFit}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-cyan-700 transition-colors hover:bg-cyan-50 hover:text-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-cyan-300 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-200"
          title={toggleLabel}
          aria-label={toggleLabel}
        >
          <ToggleIcon size={16} strokeWidth={2.4} />
        </button>
      ) : null}
      {isSpreadsheetMode ? (
        <button
          onClick={onZoomIn}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus size={16} strokeWidth={2.4} />
        </button>
      ) : (
        <button
          onClick={onZoomIn}
          className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          title="Zoom in"
          aria-label="Zoom in"
        >
          +
        </button>
      )}
      <span className="hidden lg:inline-flex min-w-14 justify-center rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {Math.round(scale * 100)}%
      </span>
    </div>
  );
};

const TableZoomWrapper = forwardRef<TableZoomRef, TableZoomWrapperProps>(
  (
    {
      children,
      mode = 'spreadsheet',
      minScale = 0.4,
      maxScale = 4,
      initialScale = 1,
      mobileBottomOffset = 100,
    },
    ref,
  ) => {
    const transformComponentRef = useRef<ReactZoomPanPinchRef>(null);

    const spreadsheetViewportRef = useRef<HTMLDivElement>(null);
    const spreadsheetContentRef = useRef<HTMLDivElement>(null);

    const [currentScale, setCurrentScale] = useState(initialScale);
    const [targetScale, setTargetScale] = useState(initialScale);
    const [dynamicMinScale, setDynamicMinScale] = useState(minScale);
    const [detailLevel, setDetailLevel] = useState<TableDetailLevel>(detailLevelFromScale(initialScale));
    const [isDragging, setIsDragging] = useState(false);
    const [isPhoneViewport, setIsPhoneViewport] = useState(false);

    // Toast visibility
    const [toastVisible, setToastVisible] = useState(false);
    const [mobileControlOpacity, setMobileControlOpacity] = useState(0.6);
    const [mobileControlVisible, setMobileControlVisible] = useState(true);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mobileControlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const targetScaleRef = useRef(initialScale);
    const currentScaleRef = useRef(initialScale);
    const animationFrameRef = useRef<number | null>(null);
    const dragStateRef = useRef({
      active: false,
      startX: 0,
      startY: 0,
      scrollLeft: 0,
      scrollTop: 0,
    });

    const effectiveMaxScale =
      mode === 'spreadsheet'
        ? Math.min(maxScale, SPREADSHEET_MAX_SCALE)
        : maxScale;

    const effectiveMinScale =
      mode === 'spreadsheet'
        ? Math.max(minScale, dynamicMinScale)
        : minScale;

    const clampScale = useCallback(
      (value: number) => clamp(value, effectiveMinScale, effectiveMaxScale),
      [effectiveMaxScale, effectiveMinScale],
    );

    const fitScale = effectiveMinScale;
    const mediumScale = clampScale(1);

    /** Show the zoom toast and auto-hide after 1.2 s */
    const flashToast = useCallback(() => {
      setToastVisible(true);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setToastVisible(false);
      }, 1200);
    }, []);

    const flashMobileControls = useCallback((opacity = 1) => {
      setMobileControlVisible(true);
      setMobileControlOpacity(opacity);

      if (mobileControlTimerRef.current) clearTimeout(mobileControlTimerRef.current);
      mobileControlTimerRef.current = setTimeout(() => {
        setMobileControlOpacity(0.6);
      }, 2000);
    }, []);

    const updateTargetScale = useCallback(
      (value: number) => {
        const clamped = clampScale(value);
        targetScaleRef.current = clamped;
        setTargetScale(clamped);
        flashToast();
      },
      [clampScale, flashToast],
    );

    // Derive active mobile step from current scale
    const activeMobileStep: ZoomStepKey = useMemo(() => {
      const distFit = Math.abs(currentScale - fitScale);
      const distMed = Math.abs(currentScale - mediumScale);
      const min = Math.min(distFit, distMed);
      if (min === distFit) return 'fit';
      return 'med';
    }, [currentScale, fitScale, mediumScale]);

    const handleMobileStep = useCallback(() => {
      if (activeMobileStep === 'fit') {
        updateTargetScale(mediumScale);
      } else {
        updateTargetScale(fitScale);
      }
    }, [activeMobileStep, fitScale, mediumScale, updateTargetScale]);

    const recalcDynamicMinScale = useCallback(() => {
      if (mode !== 'spreadsheet') return;

      const viewport = spreadsheetViewportRef.current;
      const content = spreadsheetContentRef.current;
      if (!viewport || !content) return;

      const measuredWidth = content.scrollWidth;
      if (measuredWidth <= 0 || viewport.clientWidth <= 0) return;

      const baseWidth = measuredWidth / Math.max(currentScaleRef.current, 0.001);
      const fitScale = viewport.clientWidth / baseWidth;
      const nextDynamicMin = clamp(fitScale, ABS_MIN_SCALE, 1);

      setDynamicMinScale((prev) => (Math.abs(prev - nextDynamicMin) < 0.0001 ? prev : nextDynamicMin));
    }, [mode]);

    useEffect(() => {
      targetScaleRef.current = targetScale;
    }, [targetScale]);

    useEffect(() => {
      currentScaleRef.current = currentScale;
    }, [currentScale]);

    useEffect(() => {
      if (mode !== 'spreadsheet') return;

      const viewport = spreadsheetViewportRef.current;
      const content = spreadsheetContentRef.current;
      if (!viewport || !content) return;

      recalcDynamicMinScale();

      const observer = new ResizeObserver(() => recalcDynamicMinScale());
      observer.observe(viewport);
      observer.observe(content);

      return () => observer.disconnect();
    }, [mode, recalcDynamicMinScale]);

    useEffect(() => {
      if (typeof window === 'undefined') return;

      const mediaQuery = window.matchMedia(PHONE_MEDIA_QUERY);
      const syncViewport = () => setIsPhoneViewport(mediaQuery.matches);

      syncViewport();
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', syncViewport);
        return () => mediaQuery.removeEventListener('change', syncViewport);
      }

      mediaQuery.addListener(syncViewport);
      return () => mediaQuery.removeListener(syncViewport);
    }, []);

    useEffect(() => {
      if (mode !== 'spreadsheet') return;

      setCurrentScale((prev) => clamp(prev, effectiveMinScale, effectiveMaxScale));
      updateTargetScale(targetScaleRef.current);
    }, [effectiveMinScale, effectiveMaxScale, mode, updateTargetScale]);

    const animateZoom = useCallback(() => {
      setCurrentScale((prev) => {
        const next = lerp(prev, targetScaleRef.current, 0.1);
        if (Math.abs(next - targetScaleRef.current) < 0.001) {
          animationFrameRef.current = null;
          return targetScaleRef.current;
        }
        animationFrameRef.current = requestAnimationFrame(animateZoom);
        return next;
      });
    }, []);

    useEffect(() => {
      if (mode !== 'spreadsheet') return;
      if (animationFrameRef.current !== null) return;
      if (Math.abs(currentScale - targetScale) < 0.001) return;

      animationFrameRef.current = requestAnimationFrame(animateZoom);
    }, [animateZoom, currentScale, mode, targetScale]);

    useEffect(() => {
      return () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        if (mobileControlTimerRef.current) clearTimeout(mobileControlTimerRef.current);
      };
    }, []);

    useEffect(() => {
      if (mode !== 'spreadsheet') return;
      setDetailLevel((prev) => getDetailLevelWithHysteresis(prev, currentScale));
    }, [currentScale, mode]);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      if (mode !== 'spreadsheet') return;
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      if (isInteractiveTarget(e.target)) return;

      const viewport = spreadsheetViewportRef.current;
      if (!viewport) return;

      dragStateRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        scrollLeft: viewport.scrollLeft,
        scrollTop: viewport.scrollTop,
      };

      setIsDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }, [mode]);

    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStateRef.current.active) return;
      const viewport = spreadsheetViewportRef.current;
      if (!viewport) return;

      e.preventDefault();
      const dx = e.clientX - dragStateRef.current.startX;
      const dy = e.clientY - dragStateRef.current.startY;
      viewport.scrollLeft = dragStateRef.current.scrollLeft - dx;
      viewport.scrollTop = dragStateRef.current.scrollTop - dy;
    }, []);

    const stopDragging = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStateRef.current.active) return;
      dragStateRef.current.active = false;
      setIsDragging(false);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }, []);

    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
      if (mode !== 'spreadsheet') return;
      if (e.touches.length >= 2) {
        flashMobileControls(1);
        return;
      }

      flashMobileControls(0.6);
    }, [flashMobileControls, mode]);

    const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
      if (mode !== 'spreadsheet') return;
      if (e.touches.length >= 2) {
        flashMobileControls(1);
      }
    }, [flashMobileControls, mode]);

    const handleTouchEnd = useCallback(() => {
      if (mode !== 'spreadsheet') return;
      flashMobileControls(0.6);
    }, [flashMobileControls, mode]);

    useEffect(() => {
      if (mode !== 'spreadsheet') return;

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        if (e.key === '+' || e.key === '=') {
          updateTargetScale(targetScaleRef.current * 1.12);
        } else if (e.key === '-' || e.key === '_') {
          updateTargetScale(targetScaleRef.current / 1.12);
        } else if (e.key === '0') {
          updateTargetScale(initialScale);
        }
      };

      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, [initialScale, mode, updateTargetScale]);

    useImperativeHandle(ref, () => ({
      zoomToElement: (elementId: string | number) => {
        const element = document.getElementById(`element-${elementId}`);
        if (!element) return;

        if (mode === 'spreadsheet') {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          return;
        }

        if (transformComponentRef.current) {
          transformComponentRef.current.zoomToElement(element, 2.5, 600, 'easeOutQuart');
        }
      },
      resetTransform: () => {
        if (mode === 'spreadsheet') {
          updateTargetScale(initialScale);
          return;
        }

        transformComponentRef.current?.resetTransform(600, 'easeOutQuart');
      },
    }), [initialScale, mode, updateTargetScale]);

    const spreadsheetStyle = useMemo(
      () =>
        ({
          '--table-zoom': `${currentScale}`,
          '--table-cell-size': `${BASE_CELL_SIZE * softenGrowth(currentScale, 0.72)}px`,
          '--table-gap-size': `${Math.max(1, BASE_GAP_SIZE * softenGrowth(currentScale, 0.5))}px`,
          '--table-label-size': `${Math.max(18, BASE_LABEL_SIZE * softenGrowth(currentScale, 0.68))}px`,
        }) as React.CSSProperties,
      [currentScale],
    );

    if (mode === 'spreadsheet') {
      return (
        <div className="relative w-full h-full overflow-hidden rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50">

          {/* ── Zoom percentage toast (center, both mobile & desktop) ── */}
          <ZoomToast scale={currentScale} visible={toastVisible} />

          <DesktopZoomControls
            isSpreadsheetMode
            currentStep={activeMobileStep}
            scale={currentScale}
            onZoomIn={() => updateTargetScale(targetScaleRef.current * 1.12)}
            onZoomOut={() => updateTargetScale(targetScaleRef.current / 1.12)}
            onSetFit={() => updateTargetScale(fitScale)}
            onSetMedium={() => updateTargetScale(mediumScale)}
            showModeToggle
          />

          {/* ── Scrollable viewport ── */}
          <div
            ref={spreadsheetViewportRef}
            className={`h-full w-full overflow-auto custom-scrollbar ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onScroll={() => flashMobileControls(1)}
          >
            <div
              ref={spreadsheetContentRef}
              className=" inline-block align-top"
              style={spreadsheetStyle}
            >
              {children(currentScale, detailLevel)}
            </div>
          </div>

          {/* ── Mobile fixed toggle ── */}
          <div
            className="fixed right-4 z-[100] sm:hidden"
            style={{ bottom: mobileBottomOffset }}
          >
            <MobileZoomToggle
              activeStep={activeMobileStep}
              opacity={mobileControlOpacity}
              onToggle={handleMobileStep}
              isVisible={mobileControlVisible}
            />
          </div>
        </div>
      );
    }

    // ── Non-spreadsheet mode (pan/pinch) ──
    return (
      <div className="relative w-full h-full overflow-hidden rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50">
        <ZoomToast scale={currentScale} visible={toastVisible} />

        <TransformWrapper
          ref={transformComponentRef}
          initialScale={initialScale}
          minScale={minScale}
          maxScale={maxScale}
          centerOnInit
          limitToBounds
          panning={{
            disabled: !isPhoneViewport,
            velocityDisabled: false,
            lockAxisX: false,
            lockAxisY: false,
            allowLeftClickPan: false,
            allowMiddleClickPan: false,
            allowRightClickPan: false,
          }}
          pinch={{
            disabled: !isPhoneViewport,
            allowPanning: isPhoneViewport,
          }}
          onZoom={(api) => {
            setCurrentScale(api.state.scale);
            setDetailLevel(detailLevelFromScale(api.state.scale));
            flashToast();
            flashMobileControls(1);
          }}
          onPanning={(api) => {
            setCurrentScale(api.state.scale);
            setDetailLevel(detailLevelFromScale(api.state.scale));
            flashMobileControls(1);
          }}
          wheel={{
            step: 0.05,
            activationKeys: ['Control'],
          }}
          doubleClick={{ disabled: false, mode: 'toggle' }}
          zoomAnimation={{
            disabled: false,
            size: 50,
            animationTime: 300,
            animationType: 'easeOutQuart',
          }}
          autoAlignment={{
            disabled: false,
            sizeX: 0,
            sizeY: 0,
            animationTime: 300,
            animationType: 'easeOutQuart',
          }}
          velocityAnimation={{
            disabled: false,
            sensitivityMouse: 10,
            maxStrengthMouse: 50,
            animationTime: 800,
            maxAnimationTime: 1500,
            animationType: 'easeOutQuart',
          }}
        >
          {({ zoomIn, zoomOut, resetTransform, state: { scale } }) => (
            <>
              <DesktopZoomControls
                isSpreadsheetMode={false}
                currentStep={activeMobileStep}
                scale={scale}
                onZoomIn={() => { zoomIn(0.2); flashToast(); }}
                onZoomOut={() => { zoomOut(0.2); flashToast(); }}
                onSetFit={() => { resetTransform(); flashToast(); }}
                onSetMedium={() => { resetTransform(); flashToast(); }}
              />

              {/* Mobile fixed toggle */}
              <div
                className="fixed right-4 z-[100] sm:hidden"
                style={{ bottom: mobileBottomOffset }}
              >
                <MobileZoomToggle
                  activeStep={activeMobileStep}
                  opacity={mobileControlOpacity}
                  onToggle={handleMobileStep}
                  isVisible={mobileControlVisible}
                />
              </div>

              <TransformComponent
                wrapperStyle={{ width: '100%', height: '100%' }}
                contentStyle={{ width: 'max-content', height: 'max-content', padding: '96px 72px' }}
              >
                {children(scale, detailLevelFromScale(scale))}
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    );
  },
);

TableZoomWrapper.displayName = 'TableZoomWrapper';

export default TableZoomWrapper;
