"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ElementCategory, ElementData, Trend } from '../types';
import { CATEGORY_EMOJIS } from '../constants';
import { Cross, Trash, Trash2Icon } from 'lucide-react';

interface SearchBarAndFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  filters: { category: string; state: string; };
  onFilterChange: (filterType: 'category' | 'state', value: string) => void;
  dateFilter: { min: number; max: number };
  yearRange: { min: number; max: number };
  onDateFilterChange: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>;
  selectedTrend: Trend | null;
  onTrendChange: (trend: Trend | null) => void;
  onClear: () => void;
  allElements: ElementData[];
  viewMode: 'grid' | 'list' | '3d';
  onViewModeChange: (mode: 'grid' | 'list' | '3d') => void;
  controlsDisabled?: boolean;
  disabledMessage?: string;
}

const categories: ElementCategory[] = [
  'alkali metal', 'alkaline earth metal', 'lanthanide', 'actinide',
  'transition metal', 'post-transition metal', 'metalloid',
  'nonmetal', 'halogen', 'noble gas', 'unknown'
];

const states = ['gas', 'liquid', 'solid'];

const SearchBarAndFilters: React.FC<SearchBarAndFiltersProps> = ({
  searchTerm,
  onSearchTermChange,
  filters,
  onFilterChange,
  dateFilter,
  yearRange,
  onDateFilterChange,
  selectedTrend,
  onTrendChange,
  onClear,
  allElements,
  viewMode,
  onViewModeChange,
  controlsDisabled = false,
  disabledMessage,
}) => {
  const [suggestions, setSuggestions] = useState<ElementData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (controlsDisabled) return;

    const term = e.target.value;
    onSearchTermChange(term);

    if (term.trim()) {
      const lowerTerm = term.toLowerCase();
      const filtered = allElements.filter(el =>
        el.name.toLowerCase().includes(lowerTerm) ||
        el.symbol.toLowerCase().includes(lowerTerm) ||
        el.atomicNumber.toString().includes(lowerTerm)
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (element: ElementData) => {
    if (controlsDisabled) return;
    onSearchTermChange(element.name);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMinDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (controlsDisabled) return;
    const newMin = Number(e.target.value) || yearRange.min;
    onDateFilterChange((df) => ({ ...df, min: Math.min(newMin, df.max) }));
  };

  const handleMaxDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (controlsDisabled) return;
    const newMax = Number(e.target.value) || yearRange.max;
    onDateFilterChange((df) => ({ ...df, max: Math.max(newMax, df.min) }));
  };

  const commonSelectClasses = "w-full sm:w-auto px-3 py-2 font-bold capitalize transition-all";
  const labelClasses = "text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1 block";
  const disabledClasses = controlsDisabled ? "opacity-60 cursor-not-allowed" : "";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="card overflow-hidden transition-all duration-300">

        {/* Main Header Area */}
        <div className="p-4 lg:p-6 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">

          {/* Search Section */}
          <div className="relative flex-grow group" ref={searchWrapperRef}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, symbol, or atomic number..."
              value={searchTerm}
              onChange={handleSearchChange}
              disabled={controlsDisabled}
              className={`w-full pl-11 pr-4 py-3 font-bold placeholder:text-gray-400 ${disabledClasses}`}
            />

            {/* Suggestions Dropdown */}
            {!controlsDisabled && showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {suggestions.map(el => (
                  <button
                    key={el.atomicNumber}
                    onClick={() => handleSuggestionClick(el)}
                    className="w-full text-left px-4 py-3 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 flex items-center gap-4 transition-colors border-b last:border-0 border-gray-100 dark:border-gray-700"
                  >
                    <span className="text-2xl filter drop-shadow-sm">{CATEGORY_EMOJIS[el.category]}</span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 dark:text-white">{el.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{el.symbol} • Atomic No. {el.atomicNumber}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Controls Group */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggles */}
            <div className="flex gap-2">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 transition-all ${viewMode === 'grid' ? '!bg-[var(--color-alkali-metal)]' : ''}`}
                title="Grid View"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 transition-all ${viewMode === 'list' ? '!bg-[var(--color-alkali-metal)]' : ''}`}
                title="List View"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
              </button>
              <button
                onClick={() => onViewModeChange('3d')}
                className={`p-2 transition-all ${viewMode === '3d' ? '!bg-[var(--color-actinide)]' : ''}`}
                title="3D View"
              >
                {/* <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> */}
                3D
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2.5 transition-all ${isMobileMenuOpen ? '!bg-[var(--color-alkali-metal)]' : ''}`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>
        </div>

        {controlsDisabled && (
          <div className="px-4 lg:px-6 pb-3">
            <div className="rounded-xl border border-amber-300/60 dark:border-amber-700/60 bg-amber-50/80 dark:bg-amber-900/20 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
              {disabledMessage || 'Historical mode locked: filters and search are disabled to preserve canonical layout.'}
            </div>
          </div>
        )}

        {/* Filters Section - Desktop: Always visible, Mobile: Collapsible */}
        <div className={`${isMobileMenuOpen ? 'max-h-[1000px] opacity-100 border-t' : 'max-h-0 lg:max-h-none opacity-0 lg:opacity-100 lg:border-t'} overflow-hidden transition-all duration-500 ease-in-out border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20`}>
          <div className="p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Category Filter */}
            <div>
              <label className={labelClasses}>Chemical Category</label>
              <select
                value={filters.category}
                onChange={(e) => onFilterChange('category', e.target.value)}
                disabled={controlsDisabled}
                className={`${commonSelectClasses} ${disabledClasses}`}
              >
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className={labelClasses}>Standard State</label>
              <select
                value={filters.state}
                onChange={(e) => onFilterChange('state', e.target.value)}
                disabled={controlsDisabled}
                className={`${commonSelectClasses} ${disabledClasses}`}
              >
                <option value="">All States</option>
                {states.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            {/* Discovery Era Filter */}
            <div>
              <label className={labelClasses}>Discovery Era</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <input
                    type="number"
                    value={dateFilter.min}
                    onChange={handleMinDateChange}
                    disabled={controlsDisabled}
                    className={`w-full px-3 py-2 font-bold outline-none ${disabledClasses}`}
                    placeholder="From"
                  />
                </div>
                <span className="text-gray-400 font-medium">→</span>
                <div className="relative flex-grow">
                  <input
                    type="number"
                    value={dateFilter.max}
                    onChange={handleMaxDateChange}
                    disabled={controlsDisabled}
                    className={`w-full px-3 py-2 font-bold outline-none ${disabledClasses}`}
                    placeholder="To"
                  />
                </div>
              </div>
            </div>

            {/* Property Trend Filter */}
            <div className='flex gap-1 items-end'>
              <div className='flex flex-col w-full flex-1' >

              <label className={labelClasses}>Property Visualization</label>
              <select
                value={selectedTrend || ''}
                onChange={(e) => onTrendChange(e.target.value === '' ? null : e.target.value as Trend)}
                disabled={controlsDisabled}
                className={`${commonSelectClasses} ${disabledClasses}`}
              >
                <option value="">None (Default)</option>
                <option value="atomicRadius_pm">Atomic Radius</option>
                <option value="electronegativity">Electronegativity</option>
                <option value="firstIonizationEnergy_kJ_mol">First Ionization Energy</option>
              </select>
              </div>
            <button
              onClick={onClear}
              disabled={controlsDisabled}
              className="p-2 transition-all !text-[var(--color-nonmetal)] hover:!bg-[var(--color-nonmetal)] hover:!text-white"
              title="Clear all filters"
            >
              < Trash2Icon className="h-6 w-6" />
            </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBarAndFilters;
