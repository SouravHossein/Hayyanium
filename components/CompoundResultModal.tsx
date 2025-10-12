import React, { useEffect, useRef } from 'react';
import { CompoundResult } from '../types';

interface CompoundResultModalProps {
    isLoading: boolean;
    result: CompoundResult | null;
    onClose: () => void;
}

const CompoundResultModal: React.FC<CompoundResultModalProps> = ({ isLoading, result, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        modalRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 p-4"
             role="dialog" aria-modal="true" aria-labelledby="compound-result-title">
            <div
                ref={modalRef}
                tabIndex={-1}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg flex flex-col outline-none p-6 text-gray-900 dark:text-white">
                
                <header className="flex justify-between items-center mb-4">
                    <h2 id="compound-result-title" className="text-2xl font-bold text-cyan-600 dark:text-cyan-300">Compound Analysis</h2>
                    <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div className="flex-grow">
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
                        <div className="space-y-4">
                            {result.compoundFormed ? (
                                <>
                                    <div className="text-center bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                                        <p className="text-sm text-green-800 dark:text-green-200">Compound Formed!</p>
                                        <p className="text-4xl font-bold text-green-900 dark:text-green-100">{result.formula}</p>
                                        <p className="text-xl text-green-700 dark:text-green-300">{result.name}</p>
                                    </div>
                                    <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                                        <div className="py-2 grid grid-cols-3 gap-4"><dt className="font-semibold col-span-1">Bond Type</dt><dd className="col-span-2">{result.bondType}</dd></div>
                                        <div className="py-2 grid grid-cols-3 gap-4"><dt className="font-semibold col-span-1">Description</dt><dd className="col-span-2 text-sm">{result.description}</dd></div>
                                        <div className="py-2 grid grid-cols-3 gap-4"><dt className="font-semibold col-span-1">Lewis Structure</dt><dd className="col-span-2 font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded whitespace-pre-wrap text-sm">{result.lewisStructure}</dd></div>
                                    </dl>
                                </>
                            ) : (
                                <div className="text-center bg-red-100 dark:bg-red-900 p-4 rounded-lg">
                                    <p className="font-bold text-red-800 dark:text-red-200 mb-2">No Common Compound</p>
                                    <p className="text-sm text-red-700 dark:text-red-300">{result.error}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompoundResultModal;
