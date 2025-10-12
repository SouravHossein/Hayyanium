import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ElementData } from './types/index';
import PeriodicTable from './components/PeriodicTable';
import ElementPanel from './components/ElementPanel';
import Legend from './components/Legend';
import SearchBarAndFilters from './components/SearchBarAndFilters';
import { useFavorites } from './hooks/useFavorites';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggleButton from './components/ThemeToggleButton';

const AppContent = () => {
  const [allElements, setAllElements] = useState<ElementData[]>([]);
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [hoveredElement, setHoveredElement] = useState<ElementData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ category: '', state: '' });
  const [favorites, toggleFavorite] = useFavorites();

  useEffect(() => {
    fetch('/data/elements.json')
      .then(res => res.json())
      .then(data => setAllElements(data))
      .catch(error => console.error("Failed to load element data:", error));
  }, []);

  const handleFilterChange = (filterType: 'category' | 'state', value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
      setSearchTerm('');
      setFilters({ category: '', state: '' });
  };

  const filteredElements = useMemo(() => {
    return allElements.filter(el => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        el.name.toLowerCase().includes(searchLower) ||
        el.symbol.toLowerCase().includes(searchLower) ||
        el.atomicNumber.toString() === searchTerm;
      
      const matchesCategory = filters.category ? el.category === filters.category : true;
      const matchesState = filters.state ? el.stateAtSTP.toLowerCase() === filters.state.toLowerCase() : true;

      return matchesSearch && matchesCategory && matchesState;
    });
  }, [allElements, searchTerm, filters]);

  const handleSelectElement = useCallback((element: ElementData) => {
    setSelectedElement(element);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedElement(null);
  }, []);

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <header className="relative text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500">
            Interactive Periodic Table
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Explore the building blocks of the universe.</p>
          <div className="absolute top-0 right-0">
            <ThemeToggleButton />
          </div>
        </header>

        <main>
          <SearchBarAndFilters
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={clearFilters}
          />
          
          <div className="relative">
            <PeriodicTable
              elements={filteredElements}
              selectedElement={selectedElement}
              favorites={favorites}
              onSelectElement={handleSelectElement}
              onHoverElement={setHoveredElement}
            />
            {hoveredElement && !selectedElement && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-12 bg-white dark:bg-gray-800 border border-cyan-500 dark:border-cyan-400 p-2 rounded-md shadow-lg text-sm z-20 pointer-events-none">
                    <h4 className="font-bold">{hoveredElement.name} ({hoveredElement.symbol})</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{hoveredElement.everydayExample}</p>
                </div>
            )}
          </div>
          
          <Legend />

          <ElementPanel
            element={selectedElement}
            isFavorite={selectedElement ? favorites.includes(selectedElement.atomicNumber) : false}
            onClose={handleClosePanel}
            onToggleFavorite={toggleFavorite}
          />
        </main>
      </div>
    </div>
  );
};

const App = () => {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
};

export default App;
