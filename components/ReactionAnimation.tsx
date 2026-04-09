import React from 'react';
import { ElementData } from '../types';
import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from '../constants';

interface ReactionAnimationProps {
    elements: ElementData[];
    formula: string;
}

const ReactionAnimation: React.FC<ReactionAnimationProps> = ({ elements, formula }) => {
    return (
        <div className="flex justify-center items-center gap-2 sm:gap-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-md">
            <div className="flex items-center gap-2">
                {elements.map((el, i) => (
                    <React.Fragment key={el.symbol}>
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold ${CATEGORY_COLORS[el.category]} ${CATEGORY_TEXT_COLORS[el.category]}`}>
                            {el.symbol}
                        </div>
                        {i < elements.length - 1 && <span className="text-gray-400 text-xl font-light">+</span>}
                    </React.Fragment>
                ))}
            </div>

            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>

            <div className="text-2xl sm:text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                {formula}
            </div>
        </div>
    );
};

export default ReactionAnimation;
