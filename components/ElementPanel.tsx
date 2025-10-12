
import React, { useEffect, useRef } from 'react';
import { ElementData } from '../types/index';
import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from '../constants';

interface ElementPanelProps {
  element: ElementData | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (atomicNumber: number) => void;
}

const KtoC = (k: number | null) => (k ? (k - 273.15).toFixed(2) : 'N/A');

const InfoRow: React.FC<{ label: string; value: React.ReactNode; tooltip?: string }> = ({ label, value, tooltip }) => (
  <div className="py-2 border-b border-gray-700 flex justify-between items-center text-sm">
    <dt className="font-semibold text-gray-300" title={tooltip}>{label}</dt>
    <dd className="text-right text-white">{value || 'N/A'}</dd>
  </div>
);

const ElementPanel: React.FC<ElementPanelProps> = ({ element, isFavorite, onClose, onToggleFavorite }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

   useEffect(() => {
    if (element && panelRef.current) {
      panelRef.current.focus();
    }
  }, [element]);

  const handleCopySummary = () => {
      if(element) {
          navigator.clipboard.writeText(element.summary)
            .then(() => alert('Summary copied to clipboard!'))
            .catch(err => console.error('Failed to copy summary: ', err));
      }
  }

  if (!element) return null;

  const colorClass = CATEGORY_COLORS[element.category] || 'bg-gray-700';
  const textColorClass = CATEGORY_TEXT_COLORS[element.category] || 'text-white';
  const atomicMass = typeof element.atomicMass === 'string' ? element.atomicMass : element.atomicMass.toFixed(5);
  
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="element-panel-title"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white relative outline-none"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className={`${colorClass} ${textColorClass} p-6 rounded-t-lg`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 id="element-panel-title" className="text-4xl font-extrabold">{element.name} ({element.symbol})</h2>
              <p className="text-xl capitalize">{element.category}</p>
            </div>
            <div className="text-6xl font-black opacity-80">{element.atomicNumber}</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
            <p className="mb-4 text-gray-300 italic">{element.summary}</p>
            
            <div className="flex space-x-2 mb-6">
                 <button onClick={() => onToggleFavorite(element.atomicNumber)} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center space-x-2 ${isFavorite ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
                </button>
                <button onClick={handleCopySummary} className="px-4 py-2 rounded-md text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 transition-colors">Copy Summary</button>
            </div>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                <dl>
                    <InfoRow label="Atomic Mass" value={`${atomicMass} u`} />
                    <InfoRow label="Electron Config." value={element.electronConfiguration} />
                    <InfoRow label="Electronegativity" value={element.electronegativity} tooltip="Pauling scale" />
                    <InfoRow label="Oxidation States" value={element.oxidationStates?.join(', ')} />
                    <InfoRow label="Phase at STP" value={<span className="capitalize">{element.stateAtSTP}</span>} />
                </dl>
                <dl>
                    <InfoRow label="Density" value={element.density_g_cm3 ? `${element.density_g_cm3} g/cm³` : 'N/A'} />
                    <InfoRow label="Melting Point" value={`${KtoC(element.meltingPointK)} °C / ${element.meltingPointK || 'N/A'} K`} />
                    <InfoRow label="Boiling Point" value={`${KtoC(element.boilingPointK)} °C / ${element.boilingPointK || 'N/A'} K`} />
                    <InfoRow label="Discovered" value={`${element.discoverer} (${element.discoveryYear || 'Ancient'})`} />
                </dl>
            </div>

            <div className="mt-6">
                <h4 className="font-bold text-cyan-300 text-lg mb-2">Uses & Fun Fact</h4>
                {element.commonUses && element.commonUses.length > 0 &&
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                        {element.commonUses.map((use, index) => <li key={index}>{use}</li>)}
                    </ul>
                }
                <p className="mt-2 text-sm italic bg-gray-700 p-3 rounded-md">"{element.everydayExample}"</p>
            </div>
            {element.safetyNotes &&
                 <div className="mt-6">
                    <h4 className="font-bold text-yellow-400 text-lg mb-2">Safety Notes</h4>
                    <p className="text-sm text-yellow-200">{element.safetyNotes}</p>
                </div>
            }

        </div>
      </div>
    </div>
  );
};

export default ElementPanel;
