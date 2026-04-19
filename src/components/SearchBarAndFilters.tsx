"use client";
// Force rebuild after zoom removal

import React, { useState, useRef, useEffect } from 'react';
import { ElementCategory, ElementData, Trend } from '../types';
import { CATEGORY_EMOJIS } from '../constants';

const categories: ElementCategory[] = [
  'alkali metal', 'alkaline earth metal', 'lanthanide', 'actinide',
  'transition metal', 'post-transition metal', 'metalloid',
  'nonmetal', 'halogen', 'noble gas', 'unknown'
];

const states = ['gas', 'liquid', 'solid'];

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
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

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
}) => {
  const [suggestions, setSuggestions] = useState<ElementData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    onSearchTermChange(term);

    if (term.trim()) {
      const lowerTerm = term.toLowerCase();
      const filtered = allElements.filter(el =>
        el.name.toLowerCase().includes(lowerTerm) ||
        el.symbol.toLowerCase().includes(lowerTerm) ||
        el.atomicNumber.toString().includes(lowerTerm)
      ).slice(0, 8); // Limit suggestions to 8
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (element: ElementData) => {
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleMinDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value) || yearRange.min;
    onDateFilterChange((df: { min: number; max: number }) => ({ ...df, min: Math.min(newMin, df.max) }));
  };

  const handleMaxDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value) || yearRange.max;
    onDateFilterChange((df: { min: number; max: number }) => ({ ...df, max: Math.max(newMax, df.min) }));
  };
  
  const commonSelectClasses = "p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs capitalize transition-all hover:border-cyan-400";
  const commonInputClasses = "p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs transition-all hover:border-cyan-400";

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
      {/* Primary Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 p-3">
        {/* Search */}
        <div className="relative flex-grow min-w-[200px]" ref={searchWrapperRef}>
          <input
            id="search-input"
            type="text"
            placeholder="Search elements..."
            value={searchTerm}
            onChange={handleSearchChange}
            autoComplete="off"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute top-full mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-2xl z-50 max-h-60 overflow-y-auto">
              {suggestions.map(el => (
                <li key={el.atomicNumber}>
                  <button onClick={() => handleSuggestionClick(el)} className="w-full text-left px-3 py-2 hover:bg-cyan-50 dark:hover:bg-cyan-900/40 flex items-center gap-3">
                    <span className="text-lg">{CATEGORY_EMOJIS[el.category]}</span>
                    <div className="flex-grow">
                      <span className="font-bold text-sm">{el.symbol} - {el.name}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Compact Filter Groups */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Chemical Properties */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
             <span className="text-[9px] uppercase font-bold text-gray-400 px-2 select-none">Prop</span>
             <select value={filters.category} onChange={(e) => onFilterChange('category', e.target.value)} className={commonSelectClasses}>
                <option value="">Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
             </select>
             <select value={filters.state} onChange={(e) => onFilterChange('state', e.target.value)} className={`${commonSelectClasses} ml-1`}>
                <option value="">State</option>
                {states.map(st => <option key={st} value={st}>{st}</option>)}
             </select>
          </div>

          {/* Era / Discovery */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
             <span className="text-[9px] uppercase font-bold text-gray-400 px-2 select-none">Era</span>
             <input type="number" value={dateFilter.min} onChange={handleMinDateChange} className="w-16 p-1.5 rounded-md bg-transparent text-xs focus:outline-none" placeholder="From" />
             <span className="text-gray-400 mx-1">→</span>
             <input type="number" value={dateFilter.max} onChange={handleMaxDateChange} className="w-16 p-1.5 rounded-md bg-transparent text-xs focus:outline-none" placeholder="To" />
          </div>

          {/* Trend & Lab */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
             <span className="text-[9px] uppercase font-bold text-gray-400 px-2 select-none">Lab</span>
             <select value={selectedTrend || ''} onChange={(e) => onTrendChange(e.target.value === '' ? null : e.target.value as Trend)} className={commonSelectClasses}>
                 <option value="">Default Trend</option>
                 <option value="atomicRadius_pm">Atomic Radius</option>
                 <option value="electronegativity">Electronegativity</option>
                 <option value="firstIonizationEnergy_kJ_mol">First Ionization</option>
             </select>
          </div>

          {/* Actions */}
          <div className="flex gap-1 items-center ml-auto">
             <div className="flex bg-gray-200 dark:bg-gray-700 rounded-md p-1">
                <button onClick={() => onViewModeChange('grid')} className={`p-1.5 rounded-sm transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow text-cyan-600 dark:text-cyan-400' : 'text-gray-500'}`} aria-label="Grid View">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </button>
                <button onClick={() => onViewModeChange('list')} className={`p-1.5 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-cyan-600 dark:text-cyan-400' : 'text-gray-500'}`} aria-label="List View">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                </button>
             </div>
             <button onClick={onClear} className="p-2 text-gray-500 hover:text-red-500 transition-colors" title="Clear Filters">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBarAndFilters;
