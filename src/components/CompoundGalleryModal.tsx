import React, { useEffect, useRef } from 'react';
import { SavedCompound } from '../types';
import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from '../constants';

interface CompoundGalleryModalProps {
    isOpen: boolean;
    compounds: SavedCompound[];
    onClose: () => void;
    onLoad: (compound: SavedCompound) => void;
    onDelete: (compoundId: string) => void;
}

const CompoundGalleryModal: React.FC<CompoundGalleryModalProps> = ({ isOpen, compounds, onClose, onLoad, onDelete }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            modalRef.current?.focus();
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
            role="dialog" aria-modal="true" aria-labelledby="gallery-title"
        >
            <div
                ref={modalRef}
                tabIndex={-1}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col outline-none"
            >
                <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 id="gallery-title" className="text-2xl font-bold text-cyan-600 dark:text-cyan-300">My Compound Gallery</h2>
                    <button onClick={onClose} aria-label="Close gallery" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto p-4">
                    {compounds.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <p>Your saved compounds will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {compounds.map(c => (
                                <div key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-2xl font-bold">{c.formula}</p>
                                                <p className="text-md text-gray-600 dark:text-gray-300">{c.name}</p>
                                            </div>
                                            <div className="flex -space-x-2">
                                                {c.elements.map(el => (
                                                    <div key={el.symbol} title={el.name} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white dark:border-gray-800 ${CATEGORY_COLORS[el.category]} ${CATEGORY_TEXT_COLORS[el.category]}`}>
                                                        {el.symbol}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button onClick={() => onLoad(c)} className="px-3 py-1 text-xs font-semibold rounded-md bg-cyan-500 hover:bg-cyan-600 text-white transition">Load to Builder</button>
                                        <button onClick={() => onDelete(c.id)} className="px-3 py-1 text-xs font-semibold rounded-md bg-red-500 hover:bg-red-600 text-white transition">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompoundGalleryModal;
