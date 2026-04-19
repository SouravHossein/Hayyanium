"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ElementData } from '../types';
import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from '../constants';

interface HistoricalTimelineModalProps {
    elements: ElementData[];
    onClose: () => void;
}

// ── Expandable ancient card (2-up grid) ───────────────────────────────────────

interface AncientCardProps {
    element: ElementData;
    isOpen: boolean;
    onToggle: () => void;
}

const AncientCard: React.FC<AncientCardProps> = ({ element, isOpen, onToggle }) => {
    const expandRef = useRef<HTMLDivElement>(null);

    return (
        <div
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            onClick={onToggle}
            onKeyDown={(e) => e.key === 'Enter' && onToggle()}
            className={`
                bg-white dark:bg-gray-900
                border rounded-xl p-3 cursor-pointer select-none
                transition-colors duration-150
                ${isOpen
                    ? 'border-gray-400 dark:border-gray-500'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}
            `}
        >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono text-sm font-medium mb-2 ${CATEGORY_COLORS[element.category]} ${CATEGORY_TEXT_COLORS[element.category]}`}>
                {element.symbol}
            </div>
            <p className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">{element.name}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-600 font-mono mt-0.5">Antiquity · #{element.atomicNumber}</p>

            {/* Expand panel */}
            <div
                ref={expandRef}
                style={{
                    maxHeight: isOpen ? `${expandRef.current?.scrollHeight ?? 400}px` : '0px',
                    opacity: isOpen ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease',
                }}
            >
                <div className="pt-2.5 mt-2.5 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap gap-1 mb-2">
                        {element.category && (
                            <span className="text-[15px] font-mono px-1.5 py-0.5 rounded  text-gray-500 dark:text-gray-400">
                                {element.category}
                            </span>
                        )}
                        {element.stateAtSTP && (
                            <span className="text-[15px] font-mono px-1.5 py-0.5 rounded  text-gray-500 dark:text-gray-400">
                                {element.stateAtSTP}
                            </span>
                        )}
                        <span className="text-[15px] font-mono px-1.5 py-0.5 rounded  text-gray-500 dark:text-gray-400">
                            {element.category}
                        </span>
                    </div>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        {element.discovery_story}
                    </p>
                </div>
            </div>
        </div>
    );
};

// ── Expandable spine card (alternating left / right) ──────────────────────────

interface SpineCardProps {
    element: ElementData & { discoveryYear: number };
    side: 'left' | 'right';
    isOpen: boolean;
    onToggle: () => void;
}

const SpineCard: React.FC<SpineCardProps> = ({ element, side, isOpen, onToggle }) => {
    const expandRef = useRef<HTMLDivElement>(null);

    return (
        <div className={`relative flex items-start mb-2.5 ${side === 'left' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Spine dot + year */}
            <div className="absolute left-1/2 top-[18px] -translate-x-1/2 z-10 flex flex-col items-center gap-0.5 pointer-events-none select-none">
                <div className={`
                    w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-950
                    transition-all duration-200
                    ${isOpen ? 'bg-teal-600 dark:bg-teal-400 scale-125' : 'bg-teal-500 dark:bg-teal-500'}
                `} />
                <span className="text-[15px] font-mono font-medium text-teal-600 dark:text-teal-400 whitespace-nowrap">
                    {element.discoveryYear}
                </span>
            </div>

            {/* Card */}
            <div
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onClick={onToggle}
                onKeyDown={(e) => e.key === 'Enter' && onToggle()}
                className={`
                    w-[calc(50%-18px)] flex-shrink-0 cursor-pointer overflow-hidden select-none
                    bg-white dark:bg-gray-900
                    border rounded-xl
                    transition-colors duration-150
                    ${side === 'left' ? 'mr-auto' : 'ml-auto'}
                    ${isOpen
                        ? 'border-gray-400 dark:border-gray-500'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}
                `}
            >
                {/* Symbol + name */}
                <div className="flex items-center gap-2 p-2.5">
                    <div className={`w-[30px] h-[30px] rounded-md flex items-center justify-center font-mono text-[11px] font-medium flex-shrink-0 ${CATEGORY_COLORS[element.category]} ${CATEGORY_TEXT_COLORS[element.category]}`}>
                        {element.symbol}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[12px] font-medium text-gray-900 dark:text-white leading-tight truncate">{element.name}</p>
                        <p className="text-[15px] text-gray-400 font-mono">#{element.atomicNumber}</p>
                    </div>
                </div>

                {/* Always-visible info strip */}
                <div className="flex flex-col gap-1 px-2.5 pb-2.5">
                    {element.stateAtSTP && (
                        <span className="text-[15px] font-mono px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 truncate">
                            {element.stateAtSTP}
                        </span>
                    )}
                    {element.category && (
                        <span className="text-[15px] font-mono px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 truncate">
                            {element.category}
                        </span>
                    )}
                </div>

                {/* Expandable discovery story */}
                <div
                    ref={expandRef}
                    style={{
                        maxHeight: isOpen ? `${expandRef.current?.scrollHeight ?? 500}px` : '0px',
                        opacity: isOpen ? 1 : 0,
                        overflow: 'hidden',
                        transition: 'max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease',
                    }}
                >
                    <div className="border-t border-gray-100 dark:border-gray-800 p-2.5">
                        <div className="flex flex-wrap gap-1 mb-2">
                            <span className="text-[15px] font-mono px-1.5 py-0.5 rounded  text-gray-400 dark:text-gray-500">
                                {element.category}
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                            {element.discovery_story}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Main modal ─────────────────────────────────────────────────────────────────

const HistoricalTimelineModal: React.FC<HistoricalTimelineModalProps> = ({ elements, onClose }) => {
    const [openId, setOpenId] = useState<number | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const { ancient, dated } = useMemo(() => {
        const ancient = elements.filter(el => el.discoveryYear === 'Ancient');
        const dated = elements
            .filter((el): el is ElementData & { discoveryYear: number } => typeof el.discoveryYear === 'number')
            .sort((a, b) => a.discoveryYear - b.discoveryYear);
        return { ancient, dated };
    }, [elements]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKeyDown);
        modalRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const toggle = useCallback((id: number) => {
        setOpenId(prev => prev === id ? null : id);
    }, []);

    const handleBackdrop = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center sm:justify-center sm:p-6"
            onClick={handleBackdrop}
            role="dialog"
            aria-modal="true"
            aria-labelledby="timeline-title"
        >
            <div
                ref={modalRef}
                tabIndex={-1}
                className="
                    bg-gray-50 dark:bg-gray-950
                    w-full
                    h-[92dvh]
                    rounded-t-2xl
                    sm:rounded-2xl sm:h-[88vh] sm:max-w-2xl
                    flex flex-col
                    outline-none
                    border border-white/10
                    overflow-hidden
                "
            >
                {/* Header */}
                <header className="relative flex-shrink-0 px-5 pt-5 pb-4 flex items-start justify-between border-b border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gray-300 dark:bg-gray-700 sm:hidden" />
                    <div>
                        <p className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-0.5">Discovery timeline</p>
                        <h2 id="timeline-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                            Building blocks of matter
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-white flex-shrink-0 mt-0.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                {/* Scrollable content */}
                <div className="flex-grow overflow-y-auto overscroll-contain">
                    <div className="px-4 pt-5 pb-8">

                        {/* Ancient */}
                        {ancient.length > 0 && (
                            <section className="mb-7">
                                <p className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-3">Ancient discoveries</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {ancient.map(el => (
                                        <AncientCard
                                            key={el.atomicNumber}
                                            element={el}
                                            isOpen={openId === el.atomicNumber}
                                            onToggle={() => toggle(el.atomicNumber)}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Dated spine */}
                        {dated.length > 0 && (
                            <section>
                                <p className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-4">Dated discoveries</p>
                                <div className="relative">
                                    {/* Axis */}
                                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800 -translate-x-1/2" />

                                    {dated.map((el, i) => (
                                        <SpineCard
                                            key={el.atomicNumber}
                                            element={el}
                                            side={i % 2 === 0 ? 'left' : 'right'}
                                            isOpen={openId === el.atomicNumber}
                                            onToggle={() => toggle(el.atomicNumber)}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoricalTimelineModal;