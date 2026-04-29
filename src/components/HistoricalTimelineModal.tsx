"use client";

import React, { useMemo, useRef, useState } from 'react';
import { ElementData } from '../types';
import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from '../constants';

interface HistoricalTimelineProps {
    elements: ElementData[];
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

const HistoricalTimelineModal: React.FC<HistoricalTimelineProps> = ({ elements }) => {
    const [openId, setOpenId] = useState<number | null>(null);

    const { ancient, dated } = useMemo(() => {
        const ancient = elements.filter(el => el.discoveryYear === 'Ancient');
        const dated = elements
            .filter((el): el is ElementData & { discoveryYear: number } => typeof el.discoveryYear === 'number')
            .sort((a, b) => a.discoveryYear - b.discoveryYear);
        return { ancient, dated };
    }, [elements]);

    const toggle = (id: number) => {
        setOpenId(prev => prev === id ? null : id);
    };

    return (
        <div className="space-y-8">
            {ancient.length > 0 && (
                <section className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 sm:p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500">Ancient discoveries</p>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{ancient.length} elements</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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

            {dated.length > 0 && (
                <section className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 sm:p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <p className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500">Dated discoveries</p>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{dated.length} entries</span>
                    </div>
                    <div className="relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-slate-200 dark:bg-slate-800" />

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
    );
};

export default HistoricalTimelineModal;
