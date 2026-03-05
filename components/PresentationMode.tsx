import React, { useState } from 'react';
import { ElementData } from '../types';
import ElementImage from './ElementImage';

interface PresentationModeProps {
  elements: ElementData[];
  title?: string;
}

const PresentationMode: React.FC<PresentationModeProps> = ({ elements, title }) => {
  const [index, setIndex] = useState(0);

  const element = elements[index];

  const handleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => null);
    } else {
      await document.exitFullscreen().catch(() => null);
    }
  };

  if (!element) {
    return <div className="text-sm text-gray-600 dark:text-gray-300">Select a study set to begin.</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title || 'Presentation Mode'}</h3>
        <button onClick={handleFullscreen} className="px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-sm font-semibold">
          Toggle Fullscreen
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] items-center">
        <div className="space-y-3">
          <div className="text-6xl font-black text-cyan-600 dark:text-cyan-300">{element.symbol}</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{element.name}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Atomic Number: {element.atomicNumber}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">Category: {element.category}</div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{element.summary}</p>
        </div>
        <ElementImage elementName={element.name} />
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIndex(prev => (prev - 1 + elements.length) % elements.length)}
          className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700"
        >
          Previous
        </button>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Slide {index + 1} / {elements.length}
        </div>
        <button
          onClick={() => setIndex(prev => (prev + 1) % elements.length)}
          className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PresentationMode;
