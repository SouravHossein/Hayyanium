import React, { useState } from 'react';
import { ElementData } from '../types';
import { crystalStructures } from '../data/crystal_structures';
import CrystalStructureViewer from './CrystalStructureViewer';

interface CrystalStructureSectionProps {
    element: ElementData;
}

const CrystalStructureSection: React.FC<CrystalStructureSectionProps> = ({ element }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (element.stateAtSTP.toLowerCase() !== 'solid') {
        return (
             <div>
                <h4 className="font-bold text-cyan-600 dark:text-cyan-300 text-lg mb-2">Crystal Structure</h4>
                <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-md text-center text-gray-500 italic text-sm">
                    No crystal structure (not a solid at STP).
                </div>
            </div>
        );
    }
    
    const structureData = crystalStructures[element.symbol];

    if (!structureData) {
        return (
             <div>
                <h4 className="font-bold text-cyan-600 dark:text-cyan-300 text-lg mb-2">Crystal Structure</h4>
                <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-md text-center text-gray-500 italic text-sm">
                    Crystal structure data not available for this element.
                </div>
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left font-bold text-cyan-600 dark:text-cyan-300 text-lg mb-2 focus:outline-none"
                aria-expanded={isOpen}
                aria-controls="crystal-structure-viewer"
            >
                <span>Crystal Structure ({structureData.lattice})</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            {isOpen && (
                <div id="crystal-structure-viewer">
                    <CrystalStructureViewer key={element.atomicNumber} element={element} structureData={structureData} />
                </div>
            )}
        </div>
    );
};

export default CrystalStructureSection;
