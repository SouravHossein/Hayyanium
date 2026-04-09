import React, { useEffect, useRef, useState } from 'react';
import { CompoundResult, ElementData } from '../types';
import ReactionAnimation from './ReactionAnimation';
import EnergyChart from './EnergyChart';

interface CompoundResultModalProps {
    isLoading: boolean;
    result: CompoundResult | null;
    elements: ElementData[];
    onClose: () => void;
    onSaveCompound: (compound: { formula: string; name: string; elements: ElementData[] }) => void;
}

const CompoundResultModal: React.FC<CompoundResultModalProps> = ({ isLoading, result, elements, onClose, onSaveCompound }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isExplanationOpen, setIsExplanationOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        if(!isLoading && result) {
            modalRef.current?.focus();
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose, isLoading, result]);

    const handleSave = () => {
        if(result?.compoundFormed && result.formula && result.name) {
            onSaveCompound({
                formula: result.formula,
                name: result.name,
                elements: elements,
            });
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
             role="dialog" aria-modal="true" aria-labelledby="compound-result-title">
            <div
                ref={modalRef}
                tabIndex={-1}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col outline-none text-gray-900 dark:text-white max-h-[90vh]">
                
                <header className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    <h2 id="compound-result-title" className="text-2xl font-bold text-cyan-600 dark:text-cyan-300">Compound Analysis</h2>
                    <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto p-6">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-48">
                            <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-4 text-lg">Analyzing combination...</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6">
                            {result.compoundFormed && result.formula ? (
                                <>
                                    <div className="text-center bg-green-100 dark:bg-green-900/50 p-4 rounded-lg">
                                        <p className="text-sm text-green-800 dark:text-green-200">Compound Formed!</p>
                                        <p className="text-4xl font-bold text-green-900 dark:text-green-100">{result.formula}</p>
                                        <p className="text-xl text-green-700 dark:text-green-300">{result.name}</p>
                                    </div>
                                    <ReactionAnimation elements={elements} formula={result.formula} />

                                    <dl className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                        <div className="py-2 grid grid-cols-3 gap-4"><dt className="font-semibold col-span-1">Bond Type</dt><dd className="col-span-2">{result.bondType}</dd></div>
                                        <div className="py-2 grid grid-cols-3 gap-4"><dt className="font-semibold col-span-1">Description</dt><dd className="col-span-2">{result.description}</dd></div>
                                        {result.lewisStructure && <div className="py-2 grid grid-cols-3 gap-4"><dt className="font-semibold col-span-1">Lewis Structure</dt><dd className="col-span-2 font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded whitespace-pre-wrap text-xs">{result.lewisStructure}</dd></div>}
                                    </dl>
                                    
                                    {result.energyChange && <EnergyChart energyChange={result.energyChange} />}

                                </>
                            ) : (
                                <div className="text-center bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
                                    <p className="font-bold text-red-800 dark:text-red-200 mb-2">No Common Compound</p>
                                    <p className="text-sm text-red-700 dark:text-red-300">{result.error}</p>
                                </div>
                            )}

                            {result.reactionExplanation && (
                                <div>
                                    <button onClick={() => setIsExplanationOpen(!isExplanationOpen)} className="w-full flex justify-between items-center text-left font-bold text-cyan-600 dark:text-cyan-300 text-lg focus:outline-none">
                                        <span>🔬 Explain the Chemistry</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${isExplanationOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    {isExplanationOpen && (
                                        <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded-md text-sm text-gray-700 dark:text-gray-300">
                                            {result.reactionExplanation}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                 {result && (
                    <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                        {result.compoundFormed && (
                             <button onClick={handleSave} className="px-4 py-2 rounded-md font-semibold text-white bg-green-500 hover:bg-green-600 transition-colors text-sm">
                                Save to Gallery
                            </button>
                        )}
                        <button onClick={onClose} className="px-4 py-2 rounded-md font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm">
                            Close
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default CompoundResultModal;
