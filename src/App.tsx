import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Type } from '@google/genai';
import PeriodicTable from './components/PeriodicTable';
import Legend from './components/Legend';
import SearchBarAndFilters from './components/SearchBarAndFilters';
import { useFavorites } from './hooks/useFavorites';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggleButton from './components/ThemeToggleButton';
import ComparisonTray from './components/ComparisonTray';
import CompoundBuilderTray from './components/CompoundBuilderTray';
import { useCompoundGallery } from './hooks/useCompoundGallery';
import ElementList from './components/ElementList';
import { createGeminiClient } from './lib/gemini';
import { CompoundResult, ElementData, SavedCompound } from './types';

export type Trend =
  | 'atomicRadius_pm'
  | 'electronegativity'
  | 'firstIonizationEnergy_kJ_mol';

const ElementPanel = lazy(() => import('./components/ElementPanel'));
const ComparisonModal = lazy(() => import('./components/ComparisonModal'));
const CompoundResultModal = lazy(() => import('./components/CompoundResultModal'));
const TrendPlotModal = lazy(() => import('./components/TrendPlotModal'));
const HistoricalTimelineModal = lazy(() => import('./components/HistoricalTimelineModal'));
const CompoundGalleryModal = lazy(() => import('./components/CompoundGalleryModal'));

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [comparisonList, setComparisonList] = useState<ElementData[]>([]);
  const [isComparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [isBuilderActive, setIsBuilderActive] = useState(false);
  const [builderElements, setBuilderElements] = useState<ElementData[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [compoundResult, setCompoundResult] = useState<CompoundResult | null>(null);
  const [isCombining, setIsCombining] = useState(false);
  const { savedCompounds, saveCompound, deleteCompound } = useCompoundGallery();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [plotModalInfo, setPlotModalInfo] = useState<{
    isOpen: boolean;
    elements: ElementData[];
    title: string;
  }>({ isOpen: false, elements: [], title: '' });
  const [isTimelineModalOpen, setTimelineModalOpen] = useState(false);

  const ai = useMemo(() => createGeminiClient(), []);

  useEffect(() => {
    let isMounted = true;

    const loadElements = async () => {
      try {
        const { default: allElementsData } = await import('./data/elements');
        const data = allElementsData as ElementData[];

        if (!isMounted) {
          return;
        }

        setAllElements(data);

        if (data.length > 0) {
          const years = data
            .map((element: ElementData) => element.discoveryYear)
            .filter((year): year is number => typeof year === 'number');

          const minYear = Math.min(...years);
          const maxYear = Math.max(...years);

          setYearRange({ min: minYear, max: maxYear });
          setDateFilter({ min: minYear, max: maxYear });
        }
      } catch (error) {
        console.error('Failed to load element data:', error);
      }
    };

    loadElements();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFilterChange = (filterType: 'category' | 'state', value: string) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({ category: '', state: '' });
    setDateFilter(yearRange);
    setSelectedTrend(null);
  }, [yearRange]);

  const filteredElements = useMemo(() => {
    return allElements.filter((element) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        element.name.toLowerCase().includes(searchLower) ||
        element.symbol.toLowerCase().includes(searchLower) ||
        element.atomicNumber.toString() === searchTerm;

      const matchesCategory = filters.category ? element.category === filters.category : true;
      const matchesState = filters.state
        ? element.stateAtSTP.toLowerCase() === filters.state.toLowerCase()
        : true;

      const discoveryYear =
        typeof element.discoveryYear === 'number' ? element.discoveryYear : null;
      const matchesDate = discoveryYear
        ? discoveryYear >= dateFilter.min && discoveryYear <= dateFilter.max
        : true;

      return matchesSearch && matchesCategory && matchesState && matchesDate;
    });
  }, [allElements, searchTerm, filters, dateFilter]);

  const handleSelectElement = useCallback(
    (element: ElementData) => {
      if (selectedElement?.atomicNumber === element.atomicNumber) {
        setSelectedElement(null);
      } else {
        setSelectedElement(element);
      }
    },
    [selectedElement],
  );

  const handleClosePanel = useCallback(() => {
    setSelectedElement(null);
  }, []);

  const handleAddToCompare = useCallback((element: ElementData) => {
    setComparisonList((prev) => {
      if (prev.length < 3 && !prev.some((item) => item.atomicNumber === element.atomicNumber)) {
        return [...prev, element];
      }

      return prev;
    });
  }, []);

  const handleRemoveFromCompare = useCallback((atomicNumber: number) => {
    setComparisonList((prev) => prev.filter((element) => element.atomicNumber !== atomicNumber));
  }, []);

  const handleClearCompare = useCallback(() => {
    setComparisonList([]);
  }, []);

  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLButtonElement>, element: ElementData) => {
      event.dataTransfer.setData('atomicNumber', element.atomicNumber.toString());
      setIsDragging(true);
    },
    [],
  );

  const handleDragEnd = useCallback(() => setIsDragging(false), []);

  const handleDropOnBuilder = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const atomicNumber = parseInt(event.dataTransfer.getData('atomicNumber'), 10);
      setIsDragging(false);

      if (!atomicNumber) {
        return;
      }

      const elementToAdd = allElements.find((element) => element.atomicNumber === atomicNumber);
      if (elementToAdd) {
        setBuilderElements((prev) => {
          if (
            prev.length < 4 &&
            !prev.some((element) => element.atomicNumber === elementToAdd.atomicNumber)
          ) {
            return [...prev, elementToAdd];
          }

          return prev;
        });
      }
    },
    [allElements],
  );

  const handleRemoveFromBuilder = useCallback((atomicNumber: number) => {
    setBuilderElements((prev) => prev.filter((element) => element.atomicNumber !== atomicNumber));
  }, []);

  const handleClearBuilder = useCallback(() => setBuilderElements([]), []);

  const handleAddToBuilder = useCallback((element: ElementData) => {
    setBuilderElements((prev) => {
      if (prev.length < 4 && !prev.some((item) => item.atomicNumber === element.atomicNumber)) {
        return [...prev, element];
      }

      return prev;
    });
    setIsBuilderActive(true);
  }, []);

  const handleCombine = async () => {
    if (builderElements.length < 2) {
      return;
    }

    if (!ai) {
      setCompoundResult({
        compoundFormed: false,
        error: 'Add VITE_GEMINI_API_KEY to enable AI-powered compound analysis.',
      });
      return;
    }

    setIsCombining(true);
    setCompoundResult(null);

    const elementSymbols = builderElements.map((element) => element.symbol);
    const prompt = `Analyze the chemical reaction between [${elementSymbols.join(', ')}].
1. Determine if they form a common, simple, and stable chemical compound. Prioritize common binary compounds.
2. If a compound forms, provide its details.
3. If no common compound forms, explain why.
4. Provide a simple, one-sentence explanation for the reaction's outcome, referencing electron configurations or reactivity.
5. Describe the energy change as 'exothermic' or 'endothermic' and provide a qualitative energy value from -10 (very exothermic) to 10 (very endothermic).
Respond ONLY with a JSON object. For the lewisStructure, use element symbols, dots (.), and colons (:) for shared pairs.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              compoundFormed: { type: Type.BOOLEAN },
              formula: { type: Type.STRING },
              name: { type: Type.STRING },
              bondType: { type: Type.STRING },
              description: { type: Type.STRING },
              lewisStructure: { type: Type.STRING },
              error: { type: Type.STRING },
              reactionExplanation: {
                type: Type.STRING,
                description: "A simple explanation of why the reaction occurs or not.",
              },
              energyChange: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: "'exothermic' or 'endothermic'",
                  },
                  value: {
                    type: Type.NUMBER,
                    description: 'A qualitative value from -10 to 10.',
                  },
                },
                required: ['type', 'value'],
              },
            },
          },
        },
      });

      setCompoundResult(JSON.parse(response.text) as CompoundResult);
    } catch (error) {
      console.error('Gemini API call failed:', error);
      setCompoundResult({
        compoundFormed: false,
        error: 'An error occurred while analyzing the elements. Please try again.',
      });
    } finally {
      setIsCombining(false);
    }
  };

  const handleLoadFromGallery = useCallback((compound: SavedCompound) => {
    setBuilderElements(compound.elements);
    setIsGalleryOpen(false);
    setIsBuilderActive(true);
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

  const handleGroupClick = useCallback(
    (groupNumber: number) => {
      if (!selectedTrend) {
        alert('Please select a periodic trend from the filters to plot.');
        return;
      }

      const groupElements = allElements.filter((element) => element.group === groupNumber);
      setPlotModalInfo({
        isOpen: true,
        elements: groupElements,
        title: `Trend for Group ${groupNumber}`,
      });
    },
    [selectedTrend, allElements],
  );

  const handlePeriodClick = useCallback(
    (periodNumber: number) => {
      if (!selectedTrend) {
        alert('Please select a periodic trend from the filters to plot.');
        return;
      }

      const periodElements = allElements.filter((element) => element.period === periodNumber);
      setPlotModalInfo({
        isOpen: true,
        elements: periodElements,
        title: `Trend for Period ${periodNumber}`,
      });
    },
    [selectedTrend, allElements],
  );

  const pageTitle = selectedElement
    ? `${selectedElement.name} (${selectedElement.symbol}) - Element Details | Interactive Periodic Table`
    : 'Interactive Periodic Table - Learn Elements, Compounds & Chemistry';

  const pageDescription = selectedElement
    ? `Discover ${selectedElement.name} (${selectedElement.symbol}), atomic number ${selectedElement.atomicNumber}. Explore properties, uses, electron configuration, and periodic trends for this element.`
    : 'Explore the interactive periodic table with detailed element information, 3D atomic models, compound builder, and learning tools. Perfect for students, teachers, and chemistry enthusiasts.';

  const pageUrl = selectedElement
    ? `https://interactive-periodic-table-wheat.vercel.app/?element=${selectedElement.symbol}`
    : 'https://interactive-periodic-table-wheat.vercel.app/';

  const pageImage = 'https://interactive-periodic-table-wheat.vercel.app/og-image.png';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={pageImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
        <link rel="canonical" href={pageUrl} />
      </Helmet>
      <div
        className={`min-h-screen font-sans text-gray-900 transition-all duration-300 dark:text-gray-100 ${
          isBuilderActive ? 'pb-32' : ''
        } p-4 sm:p-6 lg:p-8`}
      >
      <div className="mx-auto max-w-screen-2xl">
        <header className="relative mb-6 text-center">
          <h1 className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-4xl font-extrabold text-transparent dark:from-cyan-400 dark:to-blue-500 sm:text-5xl">
            Interactive Periodic Table
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Explore the building blocks of the universe.
          </p>
          <div className="absolute top-0 right-0 flex items-center gap-2">
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              aria-label="Open compound gallery"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              <span>Gallery</span>
            </button>
            <button
              onClick={() => setTimelineModalOpen(true)}
              className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              aria-label="Open historical timeline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsBuilderActive(!isBuilderActive)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                isBuilderActive
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Builder</span>
            </button>
            <ThemeToggleButton />
          </div>
        </header>

        <div className="flex flex-row gap-6">
          <main
            className={`flex-grow transition-all duration-500 ease-in-out ${
              selectedElement ? 'w-full lg:w-[calc(100%-28rem)]' : 'w-full'
            }`}
          >
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
              allElements={allElements}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            <div className="relative">
              {viewMode === 'grid' ? (
                <PeriodicTable
                  elements={filteredElements}
                  selectedElement={selectedElement}
                  favorites={favorites}
                  onSelectElement={handleSelectElement}
                  onHoverElement={setHoveredElement}
                  selectedTrend={selectedTrend}
                  isDraggable={isBuilderActive}
                  onElementDragStart={handleDragStart}
                  onElementDragEnd={handleDragEnd}
                  onGroupClick={handleGroupClick}
                  onPeriodClick={handlePeriodClick}
                />
              ) : (
                <ElementList
                  elements={filteredElements}
                  selectedElement={selectedElement}
                  favorites={favorites}
                  onSelectElement={handleSelectElement}
                />
              )}

              {hoveredElement && !selectedElement && viewMode === 'grid' && (
                <div className="pointer-events-none absolute top-0 left-1/2 z-20 -mt-12 -translate-x-1/2 rounded-md border border-cyan-500 bg-white p-2 text-sm shadow-lg dark:border-cyan-400 dark:bg-gray-800">
                  <h4 className="font-bold">
                    {hoveredElement.name} ({hoveredElement.symbol})
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {selectedTrend
                      ? `${trendNames[selectedTrend]}: ${hoveredElement[selectedTrend] ?? 'N/A'} ${trendUnits[selectedTrend]}`.trim()
                      : hoveredElement.everydayExample}
                  </p>
                </div>
              )}
            </div>
            <Legend />
          </main>

          <aside
            className={`transition-all duration-500 ease-in-out ${
              selectedElement
                ? 'fixed inset-0 z-50 flex items-end lg:relative lg:inset-auto lg:w-full lg:max-w-md lg:items-start'
                : 'hidden w-0 lg:block'
            }`}
          >
            {selectedElement && (
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
                onClick={handleClosePanel}
              />
            )}
            <div className="relative z-10 h-[85vh] w-full overflow-hidden rounded-t-3xl shadow-2xl lg:h-auto lg:max-w-md lg:rounded-none lg:shadow-none">
              {selectedElement && (
                <Suspense fallback={null}>
                  <ElementPanel
                    key={selectedElement.atomicNumber}
                    element={selectedElement}
                    isFavorite={favorites.includes(selectedElement.atomicNumber)}
                    onClose={handleClosePanel}
                    onToggleFavorite={toggleFavorite}
                    comparisonList={comparisonList}
                    onAddToCompare={handleAddToCompare}
                    ai={ai}
                    onAddToBuilder={handleAddToBuilder}
                    builderElements={builderElements}
                  />
                </Suspense>
              )}
            </div>
          </aside>
        </div>
      </div>

      {isBuilderActive && (
        <CompoundBuilderTray
          elements={builderElements}
          isDragging={isDragging}
          onDrop={handleDropOnBuilder}
          onRemove={handleRemoveFromBuilder}
          onClear={handleClearBuilder}
          onCombine={handleCombine}
        />
      )}

      {(isCombining || compoundResult) && (
        <Suspense fallback={null}>
          <CompoundResultModal
            isLoading={isCombining}
            result={compoundResult}
            elements={builderElements}
            onClose={() => setCompoundResult(null)}
            onSaveCompound={saveCompound}
          />
        </Suspense>
      )}

      <ComparisonTray
        elements={comparisonList}
        onRemove={handleRemoveFromCompare}
        onClear={handleClearCompare}
        onCompare={() => setComparisonModalOpen(true)}
      />

      {isComparisonModalOpen && (
        <Suspense fallback={null}>
          <ComparisonModal
            elements={comparisonList}
            onClose={() => setComparisonModalOpen(false)}
          />
        </Suspense>
      )}

      {plotModalInfo.isOpen && selectedTrend && (
        <Suspense fallback={null}>
          <TrendPlotModal
            isOpen={plotModalInfo.isOpen}
            onClose={() => setPlotModalInfo({ isOpen: false, elements: [], title: '' })}
            elementsToPlot={plotModalInfo.elements}
            title={plotModalInfo.title}
            trend={selectedTrend}
            trendLabel={trendNames[selectedTrend]}
            trendUnit={trendUnits[selectedTrend]}
          />
        </Suspense>
      )}

      {isTimelineModalOpen && (
        <Suspense fallback={null}>
          <HistoricalTimelineModal
            elements={allElements}
            onClose={() => setTimelineModalOpen(false)}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <CompoundGalleryModal
          isOpen={isGalleryOpen}
          compounds={savedCompounds}
          onClose={() => setIsGalleryOpen(false)}
          onLoad={handleLoadFromGallery}
          onDelete={deleteCompound}
        />
      </Suspense>
    </div>
  </>
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
