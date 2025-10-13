import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { ElementData, CompoundResult } from './types/index';
import PeriodicTable from './components/PeriodicTable';
import ElementPanel from './components/ElementPanel';
import Legend from './components/Legend';
import SearchBarAndFilters from './components/SearchBarAndFilters';
import { useFavorites } from './hooks/useFavorites';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggleButton from './components/ThemeToggleButton';
import allElementsData from './data/elements';
import ComparisonTray from './components/ComparisonTray';
import ComparisonModal from './components/ComparisonModal';
import CompoundBuilderTray from './components/CompoundBuilderTray';
import CompoundResultModal from './components/CompoundResultModal';
import TrendPlotModal from './components/TrendPlotModal';

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

  // Comparison State
  const [comparisonList, setComparisonList] = useState<ElementData[]>([]);
  const [isComparisonModalOpen, setComparisonModalOpen] = useState(false);

  // Compound Builder State
  const [isBuilderActive, setIsBuilderActive] = useState(false);
  const [builderElements, setBuilderElements] = useState<ElementData[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [compoundResult, setCompoundResult] = useState<CompoundResult | null>(null);
  const [isCombining, setIsCombining] = useState(false);

  // Trend Plot State
  const [plotModalInfo, setPlotModalInfo] = useState<{
      isOpen: boolean;
      elements: ElementData[];
      title: string;
  }>({ isOpen: false, elements: [], title: '' });

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY! }), []);

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

  // Comparison handlers
  const handleAddToCompare = useCallback((element: ElementData) => {
    setComparisonList(prev => {
        if (prev.length < 3 && !prev.some(el => el.atomicNumber === element.atomicNumber)) {
            return [...prev, element];
        }
        return prev;
    });
  }, []);

  const handleRemoveFromCompare = useCallback((atomicNumber: number) => {
      setComparisonList(prev => prev.filter(el => el.atomicNumber !== atomicNumber));
  }, []);

  const handleClearCompare = useCallback(() => {
      setComparisonList([]);
  }, []);
  
  // Compound Builder handlers
  const handleDragStart = useCallback((event: React.DragEvent<HTMLButtonElement>, element: ElementData) => {
      event.dataTransfer.setData('atomicNumber', element.atomicNumber.toString());
      setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => setIsDragging(false), []);
  
  const handleDropOnBuilder = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const atomicNumber = parseInt(event.dataTransfer.getData('atomicNumber'), 10);
      setIsDragging(false);
      if (!atomicNumber) return;
      
      const elementToAdd = allElements.find(el => el.atomicNumber === atomicNumber);
      if (elementToAdd) {
          setBuilderElements(prev => {
              if (prev.length < 4 && !prev.some(el => el.atomicNumber === elementToAdd.atomicNumber)) {
                  return [...prev, elementToAdd];
              }
              return prev;
          });
      }
  }, [allElements]);

  const handleRemoveFromBuilder = useCallback((atomicNumber: number) => {
      setBuilderElements(prev => prev.filter(el => el.atomicNumber !== atomicNumber));
  }, []);

  const handleClearBuilder = useCallback(() => setBuilderElements([]), []);

  const handleCombine = async () => {
    if (builderElements.length < 2) return;
    setIsCombining(true);
    setCompoundResult(null);

    const elementSymbols = builderElements.map(el => el.symbol);
    const prompt = `Given the elements [${elementSymbols.join(', ')}], determine if they form a common, simple, and stable chemical compound. Prioritize common binary compounds. If they form a compound, provide its details. If they do not typically form a common compound, explain why. Respond ONLY with a JSON object. For the lewisStructure, use element symbols, dots (.), and colons (:) for shared pairs.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        compoundFormed: { type: Type.BOOLEAN, description: "True if a common compound is formed, otherwise false." },
                        formula: { type: Type.STRING, description: "The chemical formula of the compound (e.g., 'H2O'). Null if not formed." },
                        name: { type: Type.STRING, description: "The common name of the compound (e.g., 'Water'). Null if not formed." },
                        bondType: { type: Type.STRING, description: "The primary type of bond (e.g., 'Covalent', 'Ionic'). Null if not formed." },
                        description: { type: Type.STRING, description: "A brief, simple description of the compound. Null if not formed." },
                        lewisStructure: { type: Type.STRING, description: "A text-based representation of the Lewis structure. Null if not formed." },
                        error: { type: Type.STRING, description: "An explanation of why a compound is not formed. Null if a compound is formed." },
                    },
                },
            },
        });

        const resultJson = JSON.parse(response.text);
        setCompoundResult(resultJson as CompoundResult);

    } catch (error) {
        console.error("Gemini API call failed:", error);
        setCompoundResult({ compoundFormed: false, error: "An error occurred while analyzing the elements. Please try again." });
    } finally {
        setIsCombining(false);
    }
  };

  const trendNames: Record<Trend, string> = { atomicRadius_pm: 'Atomic Radius', electronegativity: 'Electronegativity', firstIonizationEnergy_kJ_mol: 'First Ionization Energy' };
  const trendUnits: Record<Trend, string> = { atomicRadius_pm: 'pm', electronegativity: '', firstIonizationEnergy_kJ_mol: 'kJ/mol' };

  // Trend Plot Handlers
  const handleGroupClick = useCallback((groupNumber: number) => {
    if (!selectedTrend) {
        alert("Please select a periodic trend from the filters to plot.");
        return;
    }
    
    const groupElements = allElements.filter(el => el.group === groupNumber);

    setPlotModalInfo({
        isOpen: true,
        elements: groupElements,
        title: `Trend for Group ${groupNumber}`
    });

  }, [selectedTrend, allElements]);

  const handlePeriodClick = useCallback((periodNumber: number) => {
      if (!selectedTrend) {
          alert("Please select a periodic trend from the filters to plot.");
          return;
      }
      
      const periodElements = allElements.filter(el => el.period === periodNumber);
      
      setPlotModalInfo({
          isOpen: true,
          elements: periodElements,
          title: `Trend for Period ${periodNumber}`
      });

  }, [selectedTrend, allElements]);

  return (
    <div className={`min-h-screen text-gray-900 dark:text-gray-100 font-sans p-4 sm:p-6 lg:p-8 transition-all duration-300 ${isBuilderActive ? 'pb-32' : ''}`}>
      <div className="max-w-screen-2xl mx-auto">
        <header className="relative text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500">
            Interactive Periodic Table
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Explore the building blocks of the universe.</p>
          <div className="absolute top-0 right-0 flex items-center gap-2">
            <button 
              onClick={() => setIsBuilderActive(!isBuilderActive)}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 ${isBuilderActive ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              <span>Compound Builder</span>
            </button>
            <ThemeToggleButton />
          </div>
        </header>

        <div className="flex flex-row gap-6">
          <main className={`flex-grow transition-all duration-500 ease-in-out ${selectedElement ? 'w-full lg:w-[calc(100%-28rem)]' : 'w-full'}`}>
            <SearchBarAndFilters
              searchTerm={searchTerm} onSearchTermChange={setSearchTerm}
              filters={filters} onFilterChange={handleFilterChange}
              dateFilter={dateFilter} yearRange={yearRange} onDateFilterChange={setDateFilter}
              selectedTrend={selectedTrend} onTrendChange={setSelectedTrend}
              onClear={clearFilters}
            />
            
            <div className="relative">
              <PeriodicTable
                elements={filteredElements} selectedElement={selectedElement}
                favorites={favorites} onSelectElement={handleSelectElement} onHoverElement={setHoveredElement}
                selectedTrend={selectedTrend} isDraggable={isBuilderActive}
                onElementDragStart={handleDragStart} onElementDragEnd={handleDragEnd}
                onGroupClick={handleGroupClick} onPeriodClick={handlePeriodClick}
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
                        key={selectedElement.atomicNumber} element={selectedElement}
                        isFavorite={favorites.includes(selectedElement.atomicNumber)}
                        onClose={handleClosePanel} onToggleFavorite={toggleFavorite}
                        comparisonList={comparisonList} onAddToCompare={handleAddToCompare}
                    />
                )}
            </div>
          </aside>
        </div>
      </div>
      
      {isBuilderActive && (
          <CompoundBuilderTray 
              elements={builderElements} isDragging={isDragging}
              onDrop={handleDropOnBuilder} onRemove={handleRemoveFromBuilder}
              onClear={handleClearBuilder} onCombine={handleCombine}
          />
      )}

      {(isCombining || compoundResult) && (
          <CompoundResultModal 
              isLoading={isCombining}
              result={compoundResult}
              onClose={() => setCompoundResult(null)}
          />
      )}

      <ComparisonTray 
          elements={comparisonList} onRemove={handleRemoveFromCompare} onClear={handleClearCompare} 
          onCompare={() => setComparisonModalOpen(true)}
      />
      {isComparisonModalOpen && (
            <ComparisonModal 
              elements={comparisonList} onClose={() => setComparisonModalOpen(false)}
            />
      )}
       {plotModalInfo.isOpen && selectedTrend && (
            <TrendPlotModal 
                isOpen={plotModalInfo.isOpen}
                onClose={() => setPlotModalInfo({ isOpen: false, elements: [], title: '' })}
                elementsToPlot={plotModalInfo.elements}
                title={plotModalInfo.title}
                trend={selectedTrend}
                trendLabel={trendNames[selectedTrend]}
                trendUnit={trendUnits[selectedTrend]}
            />
      )}
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