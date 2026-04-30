import React, { Suspense, lazy } from 'react';
import type { GoogleGenAI } from '@google/genai';
import { ElementData } from '../types';
import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from '../constants';
import ElectronConfigurationViewer from './ElectronConfigurationViewer';
import IsotopesViewer from './IsotopesViewer';
import CrystalStructureSection from './CrystalStructureSection';
import SkeletonLoader from './ui/SkeletonLoader';
import { ArrowRight, Copy, Flame, Plus, Rocket, Star, X } from '@/components/icons';

const RealLifeApplications = lazy(() => import('./RealLifeApplications'));

interface ElementPanelProps {
  element: ElementData | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (atomicNumber: number) => void;
  comparisonList: ElementData[];
  onAddToCompare: (element: ElementData) => void;
  ai: GoogleGenAI | null;
  onAddToBuilder: (element: ElementData) => void;
  builderElements: ElementData[];
}

const KtoC = (k: number | null) => (k ? (k - 273.15).toFixed(2) : 'N/A');

const InfoRow: React.FC<{ label: string; value: React.ReactNode; tooltip?: string }> = ({ label, value, tooltip }) => (
  <div className="py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm">
    <dt className="font-semibold text-gray-600 dark:text-gray-300" title={tooltip}>{label}</dt>
    <dd className="text-right text-gray-900 dark:text-white break-all ml-2">{value || 'N/A'}</dd>
  </div>
);

const ElementPanel: React.FC<ElementPanelProps> = ({ element, isFavorite, onClose, onToggleFavorite, comparisonList, onAddToCompare, ai, onAddToBuilder, builderElements }) => {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [aiMessage, setAiMessage] = React.useState<string | null>(null);
  const [isGeneratingMessage, setIsGeneratingMessage] = React.useState(false);
  const [messageType, setMessageType] = React.useState<'roast' | 'hype' | null>(null);

  React.useEffect(() => {
    setAiMessage(null);
    setMessageType(null);
  }, [element]);

  const generateAiMessage = async (type: 'roast' | 'hype') => {
    if (!element || !ai) return;
    setIsGeneratingMessage(true);
    setMessageType(type);
    setAiMessage(null);

    const prompt = type === 'roast'
      ? `Write a scientifically accurate but hilarious and brutal roast of the chemical element ${element.name}. Keep it to 2-3 short sentences. Example for Argon: "Argon: The ultimate third wheel of the atmosphere. You make up 1% of the air and literally do nothing. You're so lazy we put you in lightbulbs just to stop other elements from doing actual work."`
      : `Write a scientifically accurate, overly enthusiastic, and hype-filled promotion of the chemical element ${element.name}. Make it sound like the greatest thing in the universe. Keep it to 2-3 short sentences.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      const responseText = await response.text;
      setAiMessage(responseText || "Failed to generate message.");
    } catch (error) {
      console.error("Error generating AI message:", error);
      setAiMessage("Whoops, the AI is taking a break. Try again later!");
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  React.useEffect(() => {
    if (element && panelRef.current) {
      panelRef.current.focus();
      panelRef.current.scrollTop = 0; // Scroll to top when element changes
    }
  }, [element]);

  const handleCopySummary = () => {
    if (element) {
      navigator.clipboard.writeText(element.summary)
        .then(() => alert('Summary copied to clipboard!'))
        .catch(err => console.error('Failed to copy summary: ', err));
    }
  }

  if (!element) return null;

  const colorClass = CATEGORY_COLORS[element.category] || 'bg-gray-700';
  const textColorClass = CATEGORY_TEXT_COLORS[element.category] || 'text-white';
  const atomicMass = typeof element.atomicMass === 'string' ? element.atomicMass : element.atomicMass.toFixed(5);
  const isInCompare = comparisonList.some(el => el.atomicNumber === element.atomicNumber);
  const isCompareFull = comparisonList.length >= 3;
  const isInBuilder = builderElements.some(el => el.atomicNumber === element.atomicNumber);
  const isBuilderFull = builderElements.length >= 4;

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      className="bg-white dark:bg-gray-800 rounded-t-3xl lg:rounded-lg shadow-2xl w-full h-full lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto text-gray-900 dark:text-white relative outline-none"
      role="region"
      aria-labelledby="element-panel-title"
    >
      {/* Mobile drag handle indicator */}
      {/* <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-3 mb-1 lg:hidden"></div> */}

      <button onClick={onClose} aria-label="Close element details" className="sticky top-4 right-4 float-right text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors z-10 mr-4">
        <X className="h-8 w-8" />
      </button>

      {/* Header */}
      <div className={`${colorClass} ${textColorClass} p-6 rounded-t-3xl lg:rounded-t-lg mt-2 lg:mt-0`}>
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
        <p className="mb-4 text-gray-600 dark:text-gray-300 italic">{element.summary}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => onToggleFavorite(element.atomicNumber)} className={`flex-1 sm:flex-none justify-center px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center space-x-2 ${isFavorite ? 'bg-yellow-400 dark:bg-yellow-500 text-gray-900' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
            <Star className="h-4 w-4" />
            <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
          </button>
          <button onClick={handleCopySummary} className="flex-1 sm:flex-none justify-center px-4 py-2 rounded-md text-sm font-semibold bg-cyan-500 hover:bg-cyan-600 text-white dark:bg-cyan-600 dark:hover:bg-cyan-500 transition-colors inline-flex items-center gap-2">
            <Copy className="h-4 w-4" /> Copy Summary
          </button>
          <button
            onClick={() => onAddToCompare(element)}
            disabled={isInCompare || isCompareFull}
            className={`flex-1 sm:flex-none justify-center px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${isInCompare
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            <Plus className="h-4 w-4" />
            <span>{isInCompare ? 'In Compare' : (isCompareFull ? 'Compare Full' : 'Compare')}</span>
          </button>
          <button
            onClick={() => onAddToBuilder(element)}
            disabled={isInBuilder || isBuilderFull}
            className={`flex-1 sm:flex-none justify-center px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${isInBuilder
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            <Flame className="h-4 w-4" />
            <span>{isInBuilder ? 'In Builder' : (isBuilderFull ? 'Builder Full' : 'Add to Builder')}</span>
          </button>
          <button
            onClick={() => generateAiMessage('roast')}
            disabled={!ai || isGeneratingMessage}
            className="flex-1 sm:flex-none justify-center px-4 py-2 rounded-md text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2"><Flame className="h-4 w-4" /> Roast</span>
          </button>
          <button
            onClick={() => generateAiMessage('hype')}
            disabled={!ai || isGeneratingMessage}
            className="flex-1 sm:flex-none justify-center px-4 py-2 rounded-md text-sm font-semibold bg-purple-500 hover:bg-purple-600 text-white transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2"><Rocket className="h-4 w-4" /> Hype</span>
          </button>
        </div>

        {!ai && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/80 dark:bg-amber-950/40 dark:text-amber-200">
            Add <code>NEXT_PUBLIC_GEMINI_API_KEY</code> in <code>.env.local</code> to enable AI roast, hype, and compound analysis features.
          </div>
        )}

        {/* AI Message Area */}
        {(aiMessage || isGeneratingMessage) && (
          <div className={`mb-6 p-4 rounded-lg border ${messageType === 'roast' ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' : 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'}`}>
            <div className="flex items-center space-x-2 mb-2">
              {messageType === 'roast' ? <Flame className="h-5 w-5" /> : <Rocket className="h-5 w-5" />}
              <h4 className={`font-bold ${messageType === 'roast' ? 'text-orange-700 dark:text-orange-400' : 'text-purple-700 dark:text-purple-400'}`}>
                {messageType === 'roast' ? 'AI Roast' : 'AI Hype'}
              </h4>
            </div>
            {isGeneratingMessage ? (
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span className="text-sm italic">Gemini is thinking...</span>
              </div>
            ) : (
              <p className="text-gray-800 dark:text-gray-200 text-sm italic leading-relaxed">"{aiMessage}"</p>
            )}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-cyan-600 dark:text-cyan-300 text-lg mb-2">Properties</h4>
            <dl>
              <InfoRow label="Atomic Mass" value={`${atomicMass} u`} />
              <InfoRow label="Phase at STP" value={<span className="capitalize">{element.stateAtSTP}</span>} />
              <InfoRow label="Density" value={element.density_g_cm3 ? `${element.density_g_cm3} g/cm³` : 'N/A'} />
              <InfoRow label="Melting Point" value={`${KtoC(element.meltingPointK)} °C / ${element.meltingPointK || 'N/A'} K`} />
              <InfoRow label="Boiling Point" value={`${KtoC(element.boilingPointK)} °C / ${element.boilingPointK || 'N/A'} K`} />
              <InfoRow label="Electronegativity" value={element.electronegativity} tooltip="Pauling scale" />
              <InfoRow label="Oxidation States" value={element.oxidationStates?.join(', ')} />
            </dl>
          </div>

          <div>
            <h4 className="font-bold text-cyan-600 dark:text-cyan-300 text-lg mb-2">Discovery</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{element.discovery_story}</p>
          </div>

          <CrystalStructureSection element={element} />

          <ElectronConfigurationViewer configuration={element.electronConfiguration} symbol={element.symbol} />

          {element.isotopes && element.isotopes.length > 0 && (
            <IsotopesViewer isotopes={element.isotopes} />
          )}

          <Suspense fallback={
            <div className="space-y-4">
              <div className="grid gap-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
                    <SkeletonLoader width="100%" height="200px" radius="xl" className="mb-3" />
                    <div className="space-y-2">
                      <SkeletonLoader width="70%" height="1.5rem" radius="md" />
                      <SkeletonLoader width="50%" height="1rem" radius="sm" />
                      <SkeletonLoader width="80%" height="1rem" radius="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }>
            <RealLifeApplications element={element} />
          </Suspense>

          <div>
            <h4 className="font-bold text-cyan-600 dark:text-cyan-300 text-lg mb-2">Uses & Fun Fact</h4>
            {element.commonUses && element.commonUses.length > 0 &&
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                {element.commonUses.map((use, index) => <li key={index}>{use}</li>)}
              </ul>
            }
            <p className="mt-2 text-sm italic bg-gray-100 dark:bg-gray-700 p-3 rounded-md">"{element.everydayExample}"</p>
          </div>
          {element.safetyNotes &&
            <div>
              <h4 className="font-bold text-yellow-600 dark:text-yellow-400 text-lg mb-2">Safety Notes</h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{element.safetyNotes}</p>
            </div>
          }
        </div>

      </div>
    </div>
  );
};

export default ElementPanel;
