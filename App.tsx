import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ElementData } from './types/index';
import PeriodicTable from './components/PeriodicTable';
import ElementPanel from './components/ElementPanel';
import Legend from './components/Legend';
import SearchBarAndFilters from './components/SearchBarAndFilters';
import { useFavorites } from './hooks/useFavorites';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggleButton from './components/ThemeToggleButton';
import allElementsData from './data/elements';

export type Trend = 'atomicRadius_pm' | 'electronegativity' | 'firstIonizationEnergy_kJ_mol';

const AppContent = () => {
  const [allElements, setAllElements] = useState<ElementData[]>([]);
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [hoveredElement, setHoveredElement] = useState<ElementData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ category: '', state: '' });
  const [favorites, toggleFavorite] = useFavorites();
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  
  const [yearRange, setYearRange] = useState({ min: 1600, max: new Date().getFullYear() });
  const [dateFilter, setDateFilter] = useState({ min: 1600, max: new Date().getFullYear() });

  useEffect(() => {
    try {
        const data = allElementsData as ElementData[];
        setAllElements(data);
        if (data.length > 0) {
            const years = data
                .map((el: ElementData) => el.discoveryYear)
                .filter((y: any): y is number => typeof y === 'number');
            const minYear = Math.min(...years);
            const maxYear = Math.max(...years);
            setYearRange({ min: minYear, max: maxYear });
            setDateFilter({ min: minYear, max: maxYear });
        }
    } catch (error) {
        console.error("Failed to load element data:", error);
    }
  }, []);

  const handleFilterChange = (filterType: 'category' | 'state', value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = useCallback(() => {
      setSearchTerm('');
      setFilters({ category: '', state: '' });
      setDateFilter(yearRange);
      setSelectedTrend(null);
  }, [yearRange]);

  const filteredElements = useMemo(() => {
    return allElements.filter(el => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        el.name.toLowerCase().includes(searchLower) ||
        el.symbol.toLowerCase().includes(searchLower) ||
        el.atomicNumber.toString() === searchTerm;
      
      const matchesCategory = filters.category ? el.category === filters.category : true;
      const matchesState = filters.state ? el.stateAtSTP.toLowerCase() === filters.state.toLowerCase() : true;

      const discoveryYear = typeof el.discoveryYear === 'number' ? el.discoveryYear : null;
      const matchesDate = discoveryYear 
        ? (discoveryYear >= dateFilter.min && discoveryYear <= dateFilter.max)
        : true; // Always show elements with non-numeric discovery years (e.g., "Ancient")

      return matchesSearch && matchesCategory && matchesState && matchesDate;
    });
  }, [allElements, searchTerm, filters, dateFilter]);

  const handleSelectElement = useCallback((element: ElementData) => {
    if (selectedElement?.atomicNumber === element.atomicNumber) {
        setSelectedElement(null); // Deselect if clicking the same element
    } else {
        setSelectedElement(element);
    }
  }, [selectedElement]);

  const handleClosePanel = useCallback(() => {
    setSelectedElement(null);
  }, []);

  const trendNames: Record<Trend, string> = {
    atomicRadius_pm: 'Atomic Radius',
    electronegativity: 'Electronegativity',
    firstIonizationEnergy_kJ_mol: 'First Ionization Energy',
  };

  const trendUnits: Record<Trend, string> = {
    atomicRadius_pm: 'pm',
    electronegativity: '',
    firstIonizationEnergy_kJ_mol: 'kJ/mol',
  };

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

        <div className="flex flex-row gap-6">
          <main className={`flex-grow transition-all duration-500 ease-in-out ${selectedElement ? 'w-full lg:w-[calc(100%-28rem)]' : 'w-full'}`}>
            <SearchBarAndFilters
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              filters={filters}
              onFilterChange={handleFilterChange}
              dateFilter={dateFilter}
              yearRange={yearRange}
              onDateFilterChange={setDateFilter}
              selectedTrend={selectedTrend}
              onTrendChange={setSelectedTrend}
              onClear={clearFilters}
            />
            
            <div className="relative">
              <PeriodicTable
                elements={filteredElements}
                selectedElement={selectedElement}
                favorites={favorites}
                onSelectElement={handleSelectElement}
                onHoverElement={setHoveredElement}
                selectedTrend={selectedTrend}
              />
              {hoveredElement && !selectedElement && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-12 bg-white dark:bg-gray-800 border border-cyan-500 dark:border-cyan-400 p-2 rounded-md shadow-lg text-sm z-20 pointer-events-none">
                      <h4 className="font-bold">{hoveredElement.name} ({hoveredElement.symbol})</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {selectedTrend
                            ? `${trendNames[selectedTrend]}: ${hoveredElement[selectedTrend] ?? 'N/A'} ${trendUnits[selectedTrend]}`.trim()
                            : hoveredElement.everydayExample
                        }
                      </p>
                  </div>
              )}
            </div>
            
            <Legend />
          </main>

          <aside className={`transition-all duration-500 ease-in-out ${selectedElement ? 'w-full max-w-md' : 'w-0'}`} >
            <div className="w-full max-w-md overflow-hidden">
                {selectedElement && (
                    <ElementPanel
                        key={selectedElement.atomicNumber}
                        element={selectedElement}
                        isFavorite={favorites.includes(selectedElement.atomicNumber)}
                        onClose={handleClosePanel}
                        onToggleFavorite={toggleFavorite}
                    />
                )}
            </div>
          </aside>
        </div>
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