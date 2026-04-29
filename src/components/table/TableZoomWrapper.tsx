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
import { Fullscreen, Maximize, Maximize2 } from 'lucide-react';

interface TableZoomWrapperProps {
  children: (scale: number, detailLevel: TableDetailLevel) => React.ReactNode;
  mode?: TableZoomMode;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
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

const lerp = (from: number, to: number, alpha: number) => from + (to - from) * alpha;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

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
  onToggle,
}: {
  activeStep: ZoomStepKey;
  onToggle: () => void;
}) => {
  const label = activeStep.toUpperCase();
  return (
    <button
      onClick={onToggle}
      aria-label={`Zoom level: ${label}. Tap to switch.`}
      aria-pressed="true"
      style={{
        minWidth: 104,
        height: 44,
        padding: '0 14px',
        borderRadius: '999px',
        border: '1px solid rgba(255,255,255,0.18)',
        background: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
        color: 'rgba(255,255,255,0.95)',
        fontWeight: 800,
        userSelect: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: '12px', letterSpacing: '0.14em', lineHeight: 1 }}>
        {label}
      </span>
    </button>
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

    // Toast visibility
    const [toastVisible, setToastVisible] = useState(false);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      };
    }, []);

    useEffect(() => {
      if (mode !== 'spreadsheet') return;
      setDetailLevel((prev) => getDetailLevelWithHysteresis(prev, currentScale));
    }, [currentScale, mode]);

    const handleSpreadsheetWheel = useCallback(
      (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const factor = Math.exp(-e.deltaY * 0.0015);
        updateTargetScale(targetScaleRef.current * factor);
      },
      [updateTargetScale],
    );

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
          '--table-cell-size': `${BASE_CELL_SIZE * currentScale}px`,
          '--table-gap-size': `${Math.max(1, BASE_GAP_SIZE * currentScale)}px`,
          '--table-label-size': `${Math.max(18, BASE_LABEL_SIZE * currentScale)}px`,
        }) as React.CSSProperties,
      [currentScale],
    );

    if (mode === 'spreadsheet') {
      return (
        <div className="relative w-full h-full overflow-hidden rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50">

          {/* ── Zoom percentage toast (center, both mobile & desktop) ── */}
          <ZoomToast scale={currentScale} visible={toastVisible} />

          {/* ── Desktop controls (hidden on mobile) ── */}
          <div className="hidden sm:flex absolute bottom-6 right-6 border-none z-50 flex-col gap-2 items-end">
            <div className=" flex flex-col  gap-1">
              <button
                onClick={() => updateTargetScale(targetScaleRef.current * 1.12)}
                className="retro-btn px-2 text-xl font-bold"
                title="Zoom In (+)"
              >
                +
              </button>
              <button
                onClick={() => updateTargetScale(targetScaleRef.current / 1.12)}
                className="retro-btn px-2 text-xl font-bold"
                title="Zoom Out (-)"
              >
                -
              </button>
            </div>            <div className="card flex items-center gap-1 p-1">
              <button
                onClick={() => updateTargetScale(fitScale)}
                className="retro-btn px-2 py-1 text-[10px] font-bold"
                title="Fit Width"
              >
                <Fullscreen />
              </button>
              <button
                onClick={() => updateTargetScale(mediumScale)}
                className="retro-btn px-2 py-1 text-[10px] font-bold"
                title="Medium"
              >
                <Maximize2 />
              </button>
            </div>
          </div>

          {/* ── Scrollable viewport ── */}
          <div
            ref={spreadsheetViewportRef}
            className={`h-full w-full overflow-auto custom-scrollbar ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
            onWheel={handleSpreadsheetWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
          >
            <div
              ref={spreadsheetContentRef}
              className=" inline-block align-top"
              style={spreadsheetStyle}
            >
              <div className="sm:hidden absolute top-8 right-3 z-50">
                <MobileZoomToggle
                  activeStep={activeMobileStep}
                  onToggle={handleMobileStep}
                />
              </div>
              {children(currentScale, detailLevel)}
            </div>
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
          onZoom={(api) => {
            setCurrentScale(api.state.scale);
            setDetailLevel(detailLevelFromScale(api.state.scale));
            flashToast();
          }}
          onPanning={(api) => {
            setCurrentScale(api.state.scale);
            setDetailLevel(detailLevelFromScale(api.state.scale));
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
              {/* Desktop controls */}
              <div className="hidden sm:flex absolute bottom-6 right-6 z-50 flex-col gap-2 items-end">
                <div className="card flex flex-col p-1 gap-1">
                  <button
                    onClick={() => { zoomIn(0.2); flashToast(); }}
                    className="retro-btn px-4 py-2 font-bold"
                    title="Zoom In"
                  >
                    {/* <ZoomInIcon /> */}+
                  </button>
                  <button
                    onClick={() => { zoomOut(0.2); flashToast(); }}
                    className="retro-btn px-4 py-2 font-bold"
                    title="Zoom Out"
                  >
                    {/* <ZoomOutIcon /> */}-
                  </button>
                </div>
                <button
                  onClick={() => resetTransform()}
                  className="retro-btn px-4 py-2 text-xs font-bold w-full"
                  title="Reset View"
                >
                  {Math.round(scale * 100)}%
                </button>
              </div>

              <TransformComponent
                wrapperStyle={{ width: '100%', height: '100%' }}
                contentStyle={{ width: 'max-content', height: 'max-content', padding: '100px' }}
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
