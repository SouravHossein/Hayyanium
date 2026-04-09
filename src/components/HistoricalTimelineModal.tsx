import React, { useEffect, useMemo, useRef } from 'react';
import { ElementData } from '../types';
import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from '../constants';

interface HistoricalTimelineModalProps {
    elements: ElementData[];
    onClose: () => void;
}

const TimelineCard: React.FC<{ element: ElementData }> = ({ element }) => {
    return (
        <div className="relative w-72 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex-shrink-0">
             <div className={`absolute top-2 right-2 text-2xl font-black opacity-20 ${CATEGORY_TEXT_COLORS[element.category]}`}>{element.atomicNumber}</div>
            <div className={`w-16 h-16 rounded-md flex flex-col items-center justify-center ${CATEGORY_COLORS[element.category]} ${CATEGORY_TEXT_COLORS[element.category]} mb-3`}>
                <div className="text-3xl font-bold">{element.symbol}</div>
                <div className="text-xs">{element.name}</div>
            </div>
            <h3 className="font-bold text-lg">{element.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{typeof element.discoveryYear === 'number' ? `Discovered: ${element.discoveryYear}` : 'Known since antiquity'}</p>
            <p className="text-xs text-gray-600 dark:text-gray-300 h-24 overflow-y-auto pr-1">
                {element.discovery_story}
            </p>
        </div>
    );
};

const HistoricalTimelineModal: React.FC<HistoricalTimelineModalProps> = ({ elements, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const { ancient, dated } = useMemo(() => {
        const ancient = elements.filter(el => el.discoveryYear === 'Ancient');
        const dated = elements
            .filter((el): el is ElementData & { discoveryYear: number } => typeof el.discoveryYear === 'number')
            .sort((a, b) => a.discoveryYear - b.discoveryYear);
        return { ancient, dated };
    }, [elements]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        modalRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
            role="dialog" aria-modal="true" aria-labelledby="timeline-title"
        >
            <div
                ref={modalRef}
                tabIndex={-1}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col outline-none"
            >
                <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 id="timeline-title" className="text-2xl font-bold text-cyan-600 dark:text-cyan-300">Historical Discovery Timeline</h2>
                    <button onClick={onClose} aria-label="Close timeline" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div className="flex-grow overflow-x-auto p-8">
                    <div className="relative flex items-center h-full w-max">
                        {/* Timeline Axis */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-300 dark:bg-gray-700 -translate-y-1/2"></div>
                        
                        {/* Ancient Elements */}
                        <div className="flex flex-col items-center mr-8 pr-8 border-r-2 border-gray-400 dark:border-gray-600 border-dashed">
                            <h3 className="text-xl font-bold mb-4">Ancient Times</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {ancient.map(el => <TimelineCard key={el.atomicNumber} element={el} />)}
                            </div>
                        </div>

                        {/* Dated Elements */}
                        <div className="flex items-start gap-8">
                            {dated.map((element, index) => (
                                <div key={element.atomicNumber} className={`relative flex flex-col items-center pt-8 ${index % 2 === 0 ? 'self-end -translate-y-8' : 'self-start translate-y-8'}`}>
                                    <div className="absolute top-1/2 w-0.5 h-8 bg-gray-400 dark:bg-gray-600" style={{ transform: index % 2 === 0 ? 'translateY(-100%)' : 'translateY(0)' }}></div>
                                    <div className="absolute top-1/2 w-4 h-4 bg-cyan-500 rounded-full border-4 border-gray-50 dark:border-gray-900 -translate-y-1/2"></div>
                                    <div className="absolute top-1/2 font-bold" style={{ transform: index % 2 === 0 ? 'translateY(-3.5rem)' : 'translateY(2.5rem)' }}>{element.discoveryYear}</div>
                                    <TimelineCard element={element} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoricalTimelineModal;
