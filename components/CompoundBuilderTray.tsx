import React from 'react';
import { ElementData } from '../types';
import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from '../constants';

interface CompoundBuilderTrayProps {
    elements: ElementData[];
    isDragging: boolean;
    onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    onRemove: (atomicNumber: number) => void;
    onClear: () => void;
    onCombine: () => void;
    isAiAvailable?: boolean;
}

const CompoundBuilderTray: React.FC<CompoundBuilderTrayProps> = ({ elements, isDragging, onDrop, onRemove, onClear, onCombine, isAiAvailable = true }) => {
    
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg z-30 p-3 transform transition-all duration-300 ease-in-out"
             role="toolbar" aria-label="Compound Builder Tray">
            <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div 
                    onDrop={onDrop}
                    onDragOver={handleDragOver}
                    className={`flex-grow w-full sm:w-auto flex items-center gap-2 p-2 rounded-lg border-2 border-dashed transition-colors ${isDragging ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/50' : 'border-gray-300 dark:border-gray-700'}`}
                >
                    <h3 className="text-lg font-bold mr-4 hidden md:block text-gray-700 dark:text-gray-300">Workbench</h3>
                    {elements.map(el => (
                        <div key={el.atomicNumber} className={`relative flex items-center p-2 rounded-md ${CATEGORY_COLORS[el.category]} ${CATEGORY_TEXT_COLORS[el.category]}`}>
                            <span className="font-bold">{el.symbol}</span>
                            <button 
                                onClick={() => onRemove(el.atomicNumber)} 
                                aria-label={`Remove ${el.name} from builder`}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400">
                                &times;
                            </button>
                        </div>
                    ))}
                    {elements.length === 0 && (
                        <div className="flex-1 text-center text-gray-500 dark:text-gray-400 p-2">
                            Drag elements here to combine
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onCombine}
                        disabled={elements.length < 2 || !isAiAvailable}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md font-semibold text-sm transition-colors">
                        Combine
                    </button>
                    <button onClick={onClear} disabled={elements.length === 0} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white rounded-md font-semibold text-sm transition-colors">Clear</button>
                </div>
            </div>
            {!isAiAvailable && (
                <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                    AI features are disabled {navigator.onLine ? 'because the API key is missing.' : 'in offline mode.'}
                </div>
            )}
        </div>
    );
};

export default CompoundBuilderTray;
