import React, { useEffect, useRef, useState } from 'react';
import { ElementData } from '../types';

interface FlashcardsProps {
  elements: ElementData[];
}

const Flashcards: React.FC<FlashcardsProps> = ({ elements }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (elements.length === 0) return;
      if (event.key === 'ArrowRight') {
        setIndex(prev => (prev + 1) % elements.length);
        setFlipped(false);
      } else if (event.key === 'ArrowLeft') {
        setIndex(prev => (prev - 1 + elements.length) % elements.length);
        setFlipped(false);
      } else if (event.key === ' ') {
        event.preventDefault();
        setFlipped(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [elements.length]);

  if (elements.length === 0) {
    return <div className="text-sm text-gray-600 dark:text-gray-300">No elements available.</div>;
  }

  const element = elements[index];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
        <span>Card {index + 1} / {elements.length}</span>
        <span>Press space to flip</span>
      </div>
      <div
        className="relative h-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-center cursor-pointer transition-transform"
        onClick={() => setFlipped(prev => !prev)}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (elements.length === 0) return;
          if (touchStartX.current === null) return;
          const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
          if (Math.abs(delta) > 40) {
            if (delta < 0) {
              setIndex(prev => (prev + 1) % elements.length);
            } else {
              setIndex(prev => (prev - 1 + elements.length) % elements.length);
            }
            setFlipped(false);
          }
          touchStartX.current = null;
        }}
        role="button"
        aria-label="Flip flashcard"
      >
        {!flipped ? (
          <div>
            <div className="text-6xl font-bold text-cyan-600 dark:text-cyan-300">{element.symbol}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Atomic #{element.atomicNumber}</div>
          </div>
        ) : (
          <div className="px-4">
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{element.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">{element.summary}</div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setIndex(prev => (prev - 1 + elements.length) % elements.length);
            setFlipped(false);
          }}
          className="px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        >
          Previous
        </button>
        <button
          onClick={() => {
            setIndex(prev => (prev + 1) % elements.length);
            setFlipped(false);
          }}
          className="px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Flashcards;
