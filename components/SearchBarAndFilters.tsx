import React from 'react';
import { ElementCategory } from '../types/index';
import { Trend } from '../App';

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
  onClear
}) => {

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-end">
        <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-2">
            <label htmlFor="search-input" className="sr-only">Search</label>
            <input
              id="search-input"
              type="text"
              placeholder="Search by name, symbol, or number..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className={commonInputClasses}
            />
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
      <div className="mt-4 flex justify-end">
          <button onClick={onClear} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md text-sm font-semibold">Clear All Filters</button>
      </div>
    </div>
  );
};

export default SearchBarAndFilters;