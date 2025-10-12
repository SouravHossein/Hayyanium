import React from 'react';
import { ElementCategory } from '../types/index';

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
  onClear: () => void;
}

const SearchBarAndFilters: React.FC<SearchBarAndFiltersProps> = ({
  searchTerm,
  onSearchTermChange,
  filters,
  onFilterChange,
  onClear
}) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search by name, symbol, or number..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="md:col-span-2 p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
        />
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 capitalize"
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat} className="capitalize">{cat}</option>)}
        </select>
        <select
          value={filters.state}
          onChange={(e) => onFilterChange('state', e.target.value)}
          className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 capitalize"
        >
          <option value="">All States</option>
          {states.map(st => <option key={st} value={st} className="capitalize">{st}</option>)}
        </select>
      </div>
      <div className="mt-4 flex justify-end">
          <button onClick={onClear} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md text-sm font-semibold">Clear Filters</button>
      </div>
    </div>
  );
};

export default SearchBarAndFilters;
