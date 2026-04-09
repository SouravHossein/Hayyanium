import React, { useState, useRef, useEffect } from 'react';
import { ElementCategory, ElementData } from '../types/index';
import { Trend } from '../App';
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
  onViewModeChange
}) => {
  const [suggestions, setSuggestions] = useState<ElementData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
    onDateFilterChange(df => ({ ...df, min: Math.min(newMin, df.max) }));
  };

  const handleMaxDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value) || yearRange.max;
    onDateFilterChange(df => ({ ...df, max: Math.max(newMax, df.min) }));
  };
  
  const commonSelectClasses = "w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 capitalize";
  const commonInputClasses = "w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400";

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4 items-end">
        <div className="relative sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-2" ref={searchWrapperRef}>
            <label htmlFor="search-input" className="sr-only">Search</label>
            <input
              id="search-input"
              type="text"
              placeholder="Search by name, symbol, or number..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => searchTerm.trim() && suggestions.length > 0 && setShowSuggestions(true)}
              autoComplete="off"
              className={commonInputClasses}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute top-full mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                {suggestions.map(el => (
                  <li key={el.atomicNumber}>
                    <button
                      onClick={() => handleSuggestionClick(el)}
                      className="w-full text-left px-3 py-2 hover:bg-cyan-50 dark:hover:bg-cyan-900/50 flex items-center gap-3"
                    >
                      <span className="text-xl">{CATEGORY_EMOJIS[el.category]}</span>
                      <div className="flex-grow">
                        <span className="font-bold">{el.symbol} - {el.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block capitalize">{el.category}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
        </div>
        <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
            <select
              id="category-filter"
              value={filters.category}
              onChange={(e) => onFilterChange('category', e.target.value)}
              className={commonSelectClasses}
            >
              <option value="">All</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
        </div>
        <div>
            <label htmlFor="state-filter" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">State</label>
            <select
              id="state-filter"
              value={filters.state}
              onChange={(e) => onFilterChange('state', e.target.value)}
              className={commonSelectClasses}
            >
              <option value="">All</option>
              {states.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
        </div>
         <div>
            <label htmlFor="min-year" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">From Year</label>
            <input
                type="number"
                id="min-year"
                value={dateFilter.min}
                min={yearRange.min}
                max={dateFilter.max}
                onChange={handleMinDateChange}
                className={commonInputClasses}
                placeholder={`e.g. ${yearRange.min}`}
            />
        </div>
        <div>
            <label htmlFor="max-year" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">To Year</label>
            <input
                type="number"
                id="max-year"
                value={dateFilter.max}
                min={dateFilter.min}
                max={yearRange.max}
                onChange={handleMaxDateChange}
                className={commonInputClasses}
                placeholder={`e.g. ${yearRange.max}`}
            />
        </div>
        <div>
            <label htmlFor="trend-filter" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Periodic Trend</label>
            <select
                id="trend-filter"
                value={selectedTrend || ''}
                onChange={(e) => onTrendChange(e.target.value === '' ? null : e.target.value as Trend)}
                className={commonSelectClasses}
            >
                <option value="">Default View</option>
                <option value="atomicRadius_pm">Atomic Radius</option>
                <option value="electronegativity">Electronegativity</option>
                <option value="firstIonizationEnergy_kJ_mol">First Ionization Energy</option>
            </select>
        </div>

      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="flex bg-gray-200 dark:bg-gray-700 rounded-md p-1 w-32">
            <button 
                onClick={() => onViewModeChange('grid')}
                className={`flex-1 flex items-center justify-center p-1.5 rounded-sm text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow text-cyan-600 dark:text-cyan-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                aria-label="Grid View"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            </button>
            <button 
                onClick={() => onViewModeChange('list')}
                className={`flex-1 flex items-center justify-center p-1.5 rounded-sm text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-cyan-600 dark:text-cyan-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                aria-label="List View"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
        <button onClick={onClear} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md text-sm font-semibold">Clear All Filters</button>
      </div>
    </div>
  );
};

export default SearchBarAndFilters;
