import React, { useState } from 'react';
import { Isotope } from '../types';

interface IsotopesViewerProps {
    isotopes: Isotope[];
}

const IsotopesViewer: React.FC<IsotopesViewerProps> = ({ isotopes }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div>
            <button 
                onClick={toggleOpen} 
                className="w-full flex justify-between items-center text-left font-bold text-cyan-600 dark:text-cyan-300 text-lg mb-2 focus:outline-none"
                aria-expanded={isOpen}
                aria-controls="isotopes-table"
            >
                <span>Isotopes</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            
            {isOpen && (
                 <div id="isotopes-table" className="overflow-x-auto mt-2 text-sm">
                    <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mass (amu)</th>
                                <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Abundance</th>
                                <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Half-life</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {isotopes.map((isotope, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 whitespace-nowrap">{isotope.mass.toFixed(4)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{isotope.abundance || 'Trace'}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{isotope.half_life}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default IsotopesViewer;