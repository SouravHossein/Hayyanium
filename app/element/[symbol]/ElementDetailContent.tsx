"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ElementData } from '@/types';
import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from '@/constants';
import { allElementsData } from '@/data/elements';
import ElectronConfigurationViewer from '@/components/ElectronConfigurationViewer';
import IsotopesViewer from '@/components/IsotopesViewer';
import CrystalStructureSection from '@/components/CrystalStructureSection';
import { useFavorites } from '@/hooks/useFavorites';

interface Props {
  element: ElementData;
}

const KtoC = (k: number | null) => (k ? (k - 273.15).toFixed(2) : 'N/A');

const InfoRow: React.FC<{ label: string; value: React.ReactNode; tooltip?: string }> = ({ label, value, tooltip }) => (
  <div className="py-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center text-sm sm:text-base">
    <dt className="font-semibold text-gray-600 dark:text-gray-400" title={tooltip}>{label}</dt>
    <dd className="text-right text-gray-900 dark:text-white font-medium ml-4">{value || 'N/A'}</dd>
  </div>
);

const ElementDetailContent: React.FC<Props> = ({ element }) => {
  const router = useRouter();
  const [favorites, toggleFavorite] = useFavorites();
  const isFavorite = favorites.includes(element.atomicNumber);

  const prevElement = allElementsData.find(e => e.atomicNumber === element.atomicNumber - 1);
  const nextElement = allElementsData.find(e => e.atomicNumber === element.atomicNumber + 1);

  const colorClass = CATEGORY_COLORS[element.category] || 'bg-gray-700';
  const textColorClass = CATEGORY_TEXT_COLORS[element.category] || 'text-white';
  const atomicMass = typeof element.atomicMass === 'string' ? element.atomicMass : element.atomicMass.toFixed(5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Navigation */}
      <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
        <Link 
          href="/"
          className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span>Back to Table</span>
        </Link>

        <div className="flex items-center space-x-4">
          {prevElement && (
            <Link href={`/element/${prevElement.symbol}`} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500" title={`Previous: ${prevElement.name}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          {nextElement && (
            <Link href={`/element/${nextElement.symbol}`} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500" title={`Next: ${nextElement.name}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className={`${colorClass} ${textColorClass} p-8 sm:p-12 relative overflow-hidden`}>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-2">{element.name}</h1>
            <p className="text-xl sm:text-2xl opacity-90 font-medium capitalize">{element.category} • Block {element.block.toUpperCase()}</p>
          </div>
          <div className="mt-6 sm:mt-0 bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center min-w-[120px]">
            <span className="block text-5xl font-black mb-1">{element.symbol}</span>
            <span className="block text-sm font-bold uppercase tracking-widest opacity-80">{element.atomicNumber}</span>
          </div>
        </div>
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl shadow-inner"></div>
      </div>

      <div className="p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Core Info */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-cyan-500 pl-4">Overview</h2>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed italic">
              {element.summary}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-cyan-500 pl-4">Physical & Chemical Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <InfoRow label="Atomic Mass" value={`${atomicMass} u`} />
              <InfoRow label="Standard State" value={<span className="capitalize">{element.stateAtSTP}</span>} />
              <InfoRow label="Density" value={element.density_g_cm3 ? `${element.density_g_cm3} g/cm³` : 'N/A'} />
              <InfoRow label="Melting Point" value={`${KtoC(element.meltingPointK)} °C / ${element.meltingPointK || 'N/A'} K`} />
              <InfoRow label="Boiling Point" value={`${KtoC(element.boilingPointK)} °C / ${element.boilingPointK || 'N/A'} K`} />
              <InfoRow label="Electronegativity" value={element.electronegativity} tooltip="Pauling scale" />
              <InfoRow label="Oxidation States" value={element.oxidationStates?.join(', ')} />
              <InfoRow label="First Ionization Energy" value={element.firstIonizationEnergy_kJ_mol ? `${element.firstIonizationEnergy_kJ_mol} kJ/mol` : 'N/A'} />
            </div>
          </section>

          <section>
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-cyan-500 pl-4">The Story of Discovery</h2>
             <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  {element.discovery_story}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center text-sm font-medium text-gray-500">
                  <span className="bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 px-3 py-1 rounded-full mr-3">
                    Discovered/Known: {element.discoveryYear}
                  </span>
                </div>
             </div>
          </section>

          <CrystalStructureSection element={element} />
        </div>

        {/* Right Column: Visualization & Extras */}
        <div className="space-y-10">
          <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Electron Shells</h3>
            <ElectronConfigurationViewer configuration={element.electronConfiguration} symbol={element.symbol} />
          </section>

          {element.isotopes && element.isotopes.length > 0 && (
            <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <IsotopesViewer isotopes={element.isotopes} />
            </section>
          )}

          <section className="bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl p-6 border border-cyan-100 dark:border-cyan-900/40">
            <h3 className="text-xl font-bold text-cyan-800 dark:text-cyan-300 mb-4 items-center flex space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Quick Fact</span>
            </h3>
            <p className="text-cyan-900 dark:text-cyan-100 italic leading-relaxed">
              "{element.everydayExample}"
            </p>
          </section>

          {element.safetyNotes && (
             <section className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/40">
                <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Safety Information</span>
                </h3>
                <p className="text-amber-900 dark:text-amber-100 text-sm leading-relaxed">
                  {element.safetyNotes}
                </p>
             </section>
          )}

          <div className="flex flex-col space-y-3 pt-6">
            <button 
              onClick={() => toggleFavorite(element.atomicNumber)}
              className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 shadow-sm ${
                isFavorite 
                ? 'bg-yellow-400 dark:bg-yellow-500 text-gray-900 ring-4 ring-yellow-200 dark:ring-yellow-900/50' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isFavorite ? 'fill-current' : 'fill-none stroke-current'}`} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span>{isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}</span>
            </button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Favorited elements sync across devices using local storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElementDetailContent;
