import React, { useEffect, useRef } from 'react';
import { ElementData } from '../types';
import { Trend } from '../App';
import { useTheme } from '../contexts/ThemeContext';

declare global {
    interface Window {
        Chart: any;
    }
}

interface TrendPlotModalProps {
    isOpen: boolean;
    onClose: () => void;
    elementsToPlot: ElementData[];
    trend: Trend;
    trendLabel: string;
    trendUnit: string;
    title: string;
}

const TrendPlotModal: React.FC<TrendPlotModalProps> = ({ isOpen, onClose, elementsToPlot, trend, trendLabel, trendUnit, title }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);
    const { theme } = useTheme();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            setTimeout(() => modalRef.current?.focus(), 0);
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen || !chartRef.current || !window.Chart) {
            return;
        }

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        const plotData = elementsToPlot
            .filter(el => el[trend] !== null && typeof el[trend] === 'number')
            .sort((a, b) => a.atomicNumber - b.atomicNumber);
        
        const isDark = theme === 'dark';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDark ? '#cbd5e1' : '#4b5563';
        const pointColor = '#22d3ee'; // cyan-400
        const lineColor = '#06b6d4'; // cyan-500

        chartInstanceRef.current = new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: plotData.map(el => el.symbol),
                datasets: [{
                    label: `${trendLabel} (${trendUnit})`,
                    data: plotData.map(el => el[trend]),
                    borderColor: lineColor,
                    backgroundColor: pointColor,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    tension: 0.1,
                    fill: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: (tooltipItems: any) => {
                                const index = tooltipItems[0].dataIndex;
                                const element = plotData[index];
                                return `${element.name} (${element.symbol}) - #${element.atomicNumber}`;
                            },
                            label: (context: any) => {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y;
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Element (by Atomic Number)',
                            color: textColor,
                        },
                        ticks: {
                            color: textColor,
                        },
                        grid: {
                            color: gridColor,
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: `${trendLabel}${trendUnit ? ` (${trendUnit})` : ''}`,
                            color: textColor,
                        },
                        ticks: {
                            color: textColor,
                        },
                        grid: {
                            color: gridColor,
                        }
                    }
                }
            }
        });
        
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };

    }, [isOpen, elementsToPlot, trend, trendLabel, trendUnit, title, theme]);
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 p-4"
             role="dialog" aria-modal="true" aria-labelledby="trend-plot-title" onClick={onClose}>
            <div
                ref={modalRef}
                tabIndex={-1}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl h-full max-h-[60vh] flex flex-col outline-none">
                <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 id="trend-plot-title" className="text-xl font-bold text-cyan-600 dark:text-cyan-300">{title} - {trendLabel}</h2>
                    <button onClick={onClose} aria-label="Close trend plot" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <div className="flex-grow p-4 relative">
                    <canvas ref={chartRef}></canvas>
                </div>
            </div>
        </div>
    );
};

export default TrendPlotModal;
