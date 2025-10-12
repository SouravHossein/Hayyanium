import React, { useEffect, useRef } from 'react';
import { ElementData } from '../types';
import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from '../constants';

interface ComparisonModalProps {
    elements: ElementData[];
    onClose: () => void;
}

const propertiesToCompare: { key: keyof ElementData; label: string; unit?: string; higherIsBetter?: boolean }[] = [
    { key: 'atomicMass', label: 'Atomic Mass', unit: 'u' },
    { key: 'atomicRadius_pm', label: 'Atomic Radius', unit: 'pm', higherIsBetter: true },
    { key: 'firstIonizationEnergy_kJ_mol', label: '1st Ionization Energy', unit: 'kJ/mol', higherIsBetter: true },
    { key: 'electronegativity', label: 'Electronegativity', higherIsBetter: true },
    { key: 'density_g_cm3', label: 'Density', unit: 'g/cm³', higherIsBetter: true },
    { key: 'meltingPointK', label: 'Melting Point', unit: 'K' },
    { key: 'boilingPointK', label: 'Boiling Point', unit: 'K' },
    { key: 'oxidationStates', label: 'Oxidation States' },
    { key: 'electronConfiguration', label: 'Electron Config' },
    { key: 'stateAtSTP', label: 'Phase at STP' },
];


const ComparisonModal: React.FC<ComparisonModalProps> = ({ elements, onClose }) => {
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

    const getComparisonStyle = (prop: typeof propertiesToCompare[0], currentValue: number | null) => {
        if (currentValue === null || typeof currentValue !== 'number' || prop.higherIsBetter === undefined) return '';

        const allValues = elements
            .map(el => el[prop.key])
            .filter((v): v is number => v !== null && typeof v === 'number');
        
        if (allValues.length < 2) return '';

        const maxVal = Math.max(...allValues);
        const minVal = Math.min(...allValues);
        
        if (maxVal === minVal) return '';

        if (prop.higherIsBetter && currentValue === maxVal) {
            return 'bg-green-100 dark:bg-green-900 font-bold';
        }
        if (!prop.higherIsBetter && currentValue === minVal) {
            return 'bg-green-100 dark:bg-green-900 font-bold';
        }
        return 'opacity-70';
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 p-4"
             role="dialog" aria-modal="true" aria-labelledby="comparison-title">
            <div
                ref={modalRef}
                tabIndex={-1}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col outline-none">
                
                <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 id="comparison-title" className="text-2xl font-bold text-cyan-600 dark:text-cyan-300">Element Comparison</h2>
                    <button onClick={onClose} aria-label="Close comparison" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto">
                    <table className="w-full text-sm sm:text-base text-left">
                        <thead>
                            <tr className="sticky top-0 bg-white dark:bg-gray-800">
                                <th className="p-3 font-semibold w-1/4">Property</th>
                                {elements.map(el => (
                                    <th key={el.atomicNumber} className={`p-3 text-center rounded-t-md ${CATEGORY_COLORS[el.category]} ${CATEGORY_TEXT_COLORS[el.category]}`}>
                                        <div className="text-2xl font-bold">{el.symbol}</div>
                                        <div className="text-sm">{el.name}</div>
                                        <div className="text-xs">({el.atomicNumber})</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                           {propertiesToCompare.map(prop => (
                               <tr key={prop.key}>
                                   <td className="p-3 font-semibold text-gray-600 dark:text-gray-300">{prop.label}</td>
                                   {elements.map(el => {
                                       const value = el[prop.key];
                                       let displayValue: React.ReactNode = 'N/A';
                                       if(value !== null && value !== undefined) {
                                           if(Array.isArray(value)) {
                                               displayValue = value.join(', ');
                                           } else if (typeof value === 'number') {
                                               displayValue = `${value.toLocaleString()}${prop.unit ? ` ${prop.unit}`: ''}`;
                                           } else {
                                               displayValue = value.toString();
                                           }
                                       }
                                       
                                       const style = getComparisonStyle(prop, typeof value === 'number' ? value : null);
                                       return (
                                           <td key={`${el.atomicNumber}-${prop.key}`} className={`p-3 text-center tabular-nums transition-colors ${style}`}>
                                               {displayValue}
                                           </td>
                                       );
                                   })}
                               </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComparisonModal;
