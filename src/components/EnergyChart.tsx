import React from 'react';

interface EnergyChartProps {
    energyChange: {
        type: 'exothermic' | 'endothermic';
        value: number;
    };
}

const EnergyChart: React.FC<EnergyChartProps> = ({ energyChange }) => {
    const isExothermic = energyChange.type === 'exothermic';
    
    // Height of the product bar relative to the reactant bar
    const productHeight = isExothermic ? 'h-6' : 'h-20';
    const arrowRotation = isExothermic ? 'rotate-0' : 'rotate-180';
    const arrowColor = isExothermic ? 'text-green-500' : 'text-red-500';

    return (
        <div>
            <h4 className="font-semibold text-center text-sm text-gray-600 dark:text-gray-300 mb-2">Relative Energy Level</h4>
            <div className="flex items-end justify-center h-28 gap-4 p-2 bg-gray-100 dark:bg-gray-900 rounded-md">
                <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Reactants</span>
                    <div className="w-16 h-12 bg-gray-400 dark:bg-gray-600 rounded-t-sm"></div>
                </div>
                <div className={`flex flex-col items-center transition-all duration-500 ${arrowColor}`}>
                    <span className="text-xs font-mono">{energyChange.type}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform ${arrowRotation}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Products</span>
                    <div className={`w-16 ${productHeight} bg-cyan-500 dark:bg-cyan-600 rounded-t-sm transition-all duration-500`}></div>
                </div>
            </div>
        </div>
    );
};

export default EnergyChart;
