import React from 'react';
import { ElementData } from '../types';
import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from '../constants';

interface ComparisonTrayProps {
    elements: ElementData[];
    onRemove: (atomicNumber: number) => void;
    onClear: () => void;
    onCompare: () => void;
}

const ComparisonTray: React.FC<ComparisonTrayProps> = ({ elements, onRemove, onClear, onCompare }) => {
    if (elements.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 dark:bg-gray-900 text-white shadow-lg z-30 p-3 transform transition-transform duration-300 ease-in-out translate-y-0"
             role="toolbar" aria-label="Element Comparison Tray">
            <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold mr-4 hidden sm:block">Compare Elements ({elements.length}/3)</h3>
                    <div className="flex items-center gap-2">
                        {elements.map(el => (
                            <div key={el.atomicNumber} className={`relative flex items-center p-2 rounded-md ${CATEGORY_COLORS[el.category]} ${CATEGORY_TEXT_COLORS[el.category]}`}>
                                <span className="font-bold">{el.symbol}</span>
                                <span className="text-sm ml-2 hidden md:inline">{el.name}</span>
                                <button 
                                    onClick={() => onRemove(el.atomicNumber)} 
                                    aria-label={`Remove ${el.name} from comparison`}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400">
                                    &times;
                                </button>
                            </div>
                        ))}
                         {Array.from({ length: 3 - elements.length }).map((_, i) => (
                             <div key={`placeholder-${i}`} className="w-20 h-10 border-2 border-dashed border-gray-600 rounded-md hidden md:flex items-center justify-center text-gray-500">
                                 +
                             </div>
                         ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onCompare}
                        disabled={elements.length < 2}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-md font-semibold text-sm transition-colors">
                        Compare
                    </button>
                    <button onClick={onClear} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md font-semibold text-sm transition-colors">Clear</button>
                </div>
            </div>
        </div>
    );
};

export default ComparisonTray;
