"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Type } from "@google/genai";
import { Drawer } from "vaul";
import PeriodicTable from "./PeriodicTable";
import Legend from "./Legend";
import SearchBarAndFilters from "./SearchBarAndFilters";
import { useFavorites } from "../hooks/useFavorites";
import ThemeToggleButton from "./ThemeToggleButton";
import ComparisonTray from "./ComparisonTray";
import CompoundBuilderTray from "./CompoundBuilderTray";
import { useCompoundGallery } from "../hooks/useCompoundGallery";
import ElementList from "./ElementList";
import LabPartner from "./LabPartner";
import CollectionProgress from "./CollectionProgress";
import { useDiscovery } from "../hooks/useDiscovery";
import { createGeminiClient } from "../lib/gemini";
import { CompoundResult, ElementData, SavedCompound, Trend } from "../types";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";
import TableRenderer from "./table/TableRenderer";
import TableModeSwitcher from "./table/TableModeSwitcher";
import { TableMode, LAYOUT_META } from "../layouts";
import { Table3DMode, LAYOUT_3D_META } from "../layouts/3d/types";
import TableModeSwitcher3D from "./table/TableModeSwitcher3D";
import Scene3D from "./3d/Scene3D";
import SkeletonLoader from "./ui/SkeletonLoader";
import TableZoomWrapper, { TableZoomRef } from "./table/TableZoomWrapper";
import { applyStreakFreezeIfNeeded } from "../lib/quiz/progressionStorage";

const ElementPanel = dynamic(() => import("./ElementPanel"), { ssr: false });
const ComparisonModal = dynamic(() => import("./ComparisonModal"), {
  ssr: false,
});
const CompoundResultModal = dynamic(() => import("./CompoundResultModal"), {
  ssr: false,
});
const TrendPlotModal = dynamic(() => import("./TrendPlotModal"), {
  ssr: false,
});
const AuthModal = dynamic(() => import("./AuthModal"), { ssr: false });

interface ClientAppProps {
  initialElements: ElementData[];
}

const AppContent: React.FC<ClientAppProps> = ({ initialElements }) => {
  const [allElements, setAllElements] =
    useState<ElementData[]>(initialElements);
  const [activeElement, setActiveElement] = useState<ElementData | null>(null);
  const [isElementPanelOpen, setIsElementPanelOpen] = useState(false);

  useEffect(() => {
    try {
      applyStreakFreezeIfNeeded();
    } catch (e) {
      console.error("Streak freeze check failed", e);
    }
  }, []);
  const [hoveredElement, setHoveredElement] = useState<ElementData | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ category: "", state: "" });
  const [favorites, toggleFavorite] = useFavorites();
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);

  // Initialize year range from data
  const initialYearRange = useMemo(() => {
    if (initialElements.length === 0)
      return { min: 1600, max: new Date().getFullYear() };
    const years = initialElements
      .map((element: ElementData) => element.discoveryYear)
      .filter((year): year is number => typeof year === "number");
    return { min: Math.min(...years), max: Math.max(...years) };
  }, [initialElements]);

  const [yearRange, setYearRange] = useState(initialYearRange);
  const [dateFilter, setDateFilter] = useState(initialYearRange);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "3d">("grid");
  const [tableMode, setTableMode] = useState<TableMode>("modern");
  const [table3DMode, setTable3DMode] = useState<Table3DMode>("helix");
  const [comparisonList, setComparisonList] = useState<ElementData[]>([]);
  const [isComparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [isBuilderActive, setIsBuilderActive] = useState(false);
  const [builderElements, setBuilderElements] = useState<ElementData[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [compoundResult, setCompoundResult] = useState<CompoundResult | null>(
    null,
  );
  const [isCombining, setIsCombining] = useState(false);
  const { savedCompounds, saveCompound, deleteCompound } = useCompoundGallery();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const [plotModalInfo, setPlotModalInfo] = useState<{
    isOpen: boolean;
    elements: ElementData[];
    title: string;
  }>({ isOpen: false, elements: [], title: "" });
  const [labPartnerMessage, setLabPartnerMessage] = useState<string | null>(
    null,
  );
  const { discovered, discover } = useDiscovery();
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  // Touch drag state
  const touchDragElement = useRef<ElementData | null>(null);
  const touchDragTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchDragArmedRef = useRef(false);
  const workbenchRef = useRef<HTMLDivElement | null>(null);
  const [touchDragActive, setTouchDragActive] = useState(false);
  const [touchPos, setTouchPos] = useState({ x: 0, y: 0 });
  const touchGhostRef = useRef<HTMLDivElement | null>(null);
  const tableZoomRef = useRef<TableZoomRef>(null);
  const searchParams = useSearchParams();
  const builderParam = searchParams.get("builder");

  useEffect(() => {
    if (builderParam === "1") {
      setIsBuilderActive(true);
      return;
    }
    setIsBuilderActive(false);
  }, [builderParam]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);

    syncViewport();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncViewport);
      return () => mediaQuery.removeEventListener("change", syncViewport);
    }

    mediaQuery.addListener(syncViewport);
    return () => mediaQuery.removeListener(syncViewport);
  }, []);

  useEffect(() => {
    return () => {
      if (touchDragTimerRef.current) {
        clearTimeout(touchDragTimerRef.current);
      }
    };
  }, []);

  const ai = useMemo(() => createGeminiClient(), []);

  // Effect to sync year range if initialElements changes
  useEffect(() => {
    setYearRange(initialYearRange);
    setDateFilter(initialYearRange);
    setAllElements(initialElements);
  }, [initialElements, initialYearRange]);

  const handleFilterChange = (
    filterType: "category" | "state",
    value: string,
  ) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilters({ category: "", state: "" });
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

      const matchesCategory = filters.category
        ? element.category === filters.category
        : true;
      const matchesState = filters.state
        ? element.stateAtSTP.toLowerCase() === filters.state.toLowerCase()
        : true;

      const discoveryYear =
        typeof element.discoveryYear === "number"
          ? element.discoveryYear
          : null;
      const matchesDate = discoveryYear
        ? discoveryYear >= dateFilter.min && discoveryYear <= dateFilter.max
        : true;

      return matchesSearch && matchesCategory && matchesState && matchesDate;
    });
  }, [allElements, searchTerm, filters, dateFilter]);

  const isHistoricalTableMode =
    viewMode === "grid" &&
    (tableMode === "mendeleev" || tableMode === "newland");
  const visibleElements = isHistoricalTableMode
    ? allElements
    : filteredElements;

  const handleSelectElement = useCallback(
    (element: ElementData) => {
      const isDifferentElement =
        activeElement?.atomicNumber !== element.atomicNumber;
      setActiveElement(element);
      setIsElementPanelOpen(true);

      // Trigger zoom to element if in grid mode
      if (viewMode === "grid") {
        setTimeout(() => {
          tableZoomRef.current?.zoomToElement(element.atomicNumber);
        }, 100);
      }

      if (isDifferentElement) {
        // Handle discovery
        const isNew = !discovered.includes(element.atomicNumber);
        if (isNew) {
          discover(element.atomicNumber);
        }

        // Add a fun reaction for the Lab Partner
        const reactions = isNew
          ? [
            `NEW DISCOVERY! You found ${element.name}. That's ${discovered.length + 1} elements found!`,
            `Eureka! ${element.name} added to your collection. Did you know it's a ${element.category}?`,
            `First time seeing ${element.symbol}? Truly ${element.category} excellence!`,
          ]
          : [
            `Ah, the familiar ${element.symbol}. Density is ${element.density_g_cm3 || "mysterious"} g/cm³.`,
            `${element.name} is a ${element.block}-block element. Still as ${element.category} as ever!`,
            `Checking in on ${element.name}? ${element.everydayExample.split(".")[0]}.`,
          ];
        setLabPartnerMessage(
          reactions[Math.floor(Math.random() * reactions.length)],
        );
      }
    },
    [activeElement, discovered, discover, viewMode],
  );

  const handleClosePanel = useCallback(() => {
    setIsElementPanelOpen(false);
    setActiveElement(null);
  }, []);

  const handleAddToCompare = useCallback((element: ElementData) => {
    setComparisonList((prev) => {
      if (
        prev.length < 3 &&
        !prev.some((item) => item.atomicNumber === element.atomicNumber)
      ) {
        return [...prev, element];
      }
      return prev;
    });
  }, []);

  const handleRemoveFromCompare = useCallback((atomicNumber: number) => {
    setComparisonList((prev) =>
      prev.filter((element) => element.atomicNumber !== atomicNumber),
    );
  }, []);

  const handleClearCompare = useCallback(() => {
    setComparisonList([]);
  }, []);

  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLAnchorElement>, element: ElementData) => {
      event.dataTransfer.setData(
        "atomicNumber",
        element.atomicNumber.toString(),
      );
      setIsDragging(true);
    },
    [],
  );

  const handleDragEnd = useCallback(
    (_event: React.DragEvent<HTMLAnchorElement>) => setIsDragging(false),
    [],
  );

  const handleDropOnBuilder = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const atomicNumber = parseInt(
        event.dataTransfer.getData("atomicNumber"),
        10,
      );
      setIsDragging(false);

      if (!atomicNumber) {
        return;
      }

      const elementToAdd = allElements.find(
        (element) => element.atomicNumber === atomicNumber,
      );
      if (elementToAdd) {
        setBuilderElements((prev) => {
          if (
            prev.length < 4 &&
            !prev.some(
              (element) => element.atomicNumber === elementToAdd.atomicNumber,
            )
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
    setBuilderElements((prev) =>
      prev.filter((element) => element.atomicNumber !== atomicNumber),
    );
  }, []);

  const handleClearBuilder = useCallback(() => setBuilderElements([]), []);

  const handleAddToBuilder = useCallback((element: ElementData) => {
    setBuilderElements((prev) => {
      if (
        prev.length < 4 &&
        !prev.some((item) => item.atomicNumber === element.atomicNumber)
      ) {
        return [...prev, element];
      }
      return prev;
    });
    setIsBuilderActive(true);
  }, []);

  // --- Touch drag handlers ---
  const handleElementTouchStart = useCallback(
    (element: ElementData, e: React.TouchEvent) => {
      if (!isBuilderActive) return;
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      setTouchPos({ x: touch.clientX, y: touch.clientY });
      touchDragArmedRef.current = false;
      if (touchDragTimerRef.current) {
        clearTimeout(touchDragTimerRef.current);
      }
      touchDragTimerRef.current = setTimeout(() => {
        touchDragElement.current = element;
        touchDragArmedRef.current = true;
        setTouchDragActive(true);
      }, 280);
    },
    [isBuilderActive],
  );

  const handleElementTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touchStartRef.current && !touchDragArmedRef.current) {
      const dx = Math.abs(touch.clientX - touchStartRef.current.x);
      const dy = Math.abs(touch.clientY - touchStartRef.current.y);
      if (dx > 12 || dy > 12) {
        if (touchDragTimerRef.current) {
          clearTimeout(touchDragTimerRef.current);
          touchDragTimerRef.current = null;
        }
      }
      return;
    }
    if (!touchDragElement.current) return;
    e.preventDefault();
    setTouchPos({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleElementTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchDragTimerRef.current) {
        clearTimeout(touchDragTimerRef.current);
        touchDragTimerRef.current = null;
      }
      if (!touchDragArmedRef.current) {
        touchStartRef.current = null;
        return;
      }
      if (!touchDragElement.current) return;
      const touch = e.changedTouches[0];

      // Check if released over the workbench
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (workbenchRef.current && workbenchRef.current.contains(target)) {
        handleAddToBuilder(touchDragElement.current);
      }

      touchDragElement.current = null;
      touchStartRef.current = null;
      touchDragArmedRef.current = false;
      setTouchDragActive(false);
    },
    [handleAddToBuilder],
  );

  const handleCombine = async () => {
    if (builderElements.length < 2) {
      return;
    }

    if (!ai) {
      setCompoundResult({
        compoundFormed: false,
        error:
          "Add NEXT_PUBLIC_GEMINI_API_KEY to enable AI-powered compound analysis.",
      });
      return;
    }

    setIsCombining(true);
    setCompoundResult(null);

    const elementSymbols = builderElements.map((element) => element.symbol);
    const prompt = `Analyze the chemical reaction between [${elementSymbols.join(", ")}].
1. Determine if they form a common, simple, and stable chemical compound. Prioritize common binary compounds.
2. If a compound forms, provide its details.
3. If no common compound forms, explain why.
4. Provide a simple, one-sentence explanation for the reaction's outcome, referencing electron configurations or reactivity.
5. Describe the energy change as 'exothermic' or 'endothermic' and provide a qualitative energy value from -10 (very exothermic) to 10 (very endothermic).
Respond ONLY with a JSON object. For the lewisStructure, use element symbols, dots (.), and colons (:) for shared pairs.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
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
                description:
                  "A simple explanation of why the reaction occurs or not.",
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
                    description: "A qualitative value from -10 to 10.",
                  },
                },
                required: ["type", "value"],
              },
            },
          },
        },
      });

      const responseText = await response.text;
      if (responseText) {
        setCompoundResult(JSON.parse(responseText) as CompoundResult);
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (error) {
      console.error("Gemini API call failed:", error);
      setCompoundResult({
        compoundFormed: false,
        error:
          "An error occurred while analyzing the elements. Please try again.",
      });
    } finally {
      setIsCombining(false);
    }
  };

  const handleLoadFromGallery = useCallback((compound: SavedCompound) => {
    setBuilderElements(compound.elements);
    setIsBuilderActive(true);
  }, []);

  const trendNames: Record<Trend, string> = {
    atomicRadius_pm: "Atomic Radius",
    electronegativity: "Electronegativity",
    firstIonizationEnergy_kJ_mol: "First Ionization Energy",
  };

  const trendUnits: Record<Trend, string> = {
    atomicRadius_pm: "pm",
    electronegativity: "",
    firstIonizationEnergy_kJ_mol: "kJ/mol",
  };

  const handleGroupClick = useCallback(
    (groupNumber: number) => {
      if (!selectedTrend) {
        alert("Please select a periodic trend from the filters to plot.");
        return;
      }

      const groupElements = allElements.filter(
        (element) => element.group === groupNumber,
      );
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
        alert("Please select a periodic trend from the filters to plot.");
        return;
      }

      const periodElements = allElements.filter(
        (element) => element.period === periodNumber,
      );
      setPlotModalInfo({
        isOpen: true,
        elements: periodElements,
        title: `Trend for Period ${periodNumber}`,
      });
    },
    [selectedTrend, allElements],
  );

  return (
    <>
      <div
        className={`min-h-screen font-sans text-gray-900 transition-all duration-300 dark:text-gray-100 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-8 ${isBuilderActive ? "pb-[calc(13rem+env(safe-area-inset-bottom))] md:pb-32" : ""
          } p-2 sm:p-4 overflow-x-hidden`}
      >
        <div className="mx-auto max-w-screen-2xl">
          {/* ─── HEADER ─────────────────────────────────────────────────────── */}
          {/* Desktop header:  brand + all controls */}
          <header className="items-center justify-between mb-2 hidden md:flex text-center">
            <h1 className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-4xl font-extrabold text-transparent dark:from-cyan-400 dark:to-blue-500 sm:text-5xl">
              Hayyanium
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <button
                onClick={() => setIsBuilderActive(!isBuilderActive)}
                className={`flex items-center gap-3 px-4 py-2 font-bold uppercase tracking-wider text-sm transition-all ${isBuilderActive ? "!bg-cyan-500 !text-white" : ""
                  }`}
              >
                <div
                  className={`w-2 h-2 rounded-full border border-[var(--color-retro-stroke)] ${isBuilderActive ? "bg-white animate-pulse" : "bg-gray-400"}`}
                ></div>
                <span>Builder</span>
              </button>
              <Link
                href="/timeline"
                className="retro-btn flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-sm transition-all text-[var(--color-transition-metal)]"
                aria-label="Open historical timeline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[var(--color-alkali-metal)]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Timeline</span>
              </Link>

              <Link
                href="/quiz"
                className="retro-btn flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-sm transition-all text-[var(--color-actinide)]"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
                <span>Quiz</span>
              </Link>


              <Link
                href="/community"
                className="retro-btn relative flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-sm transition-all text-[var(--color-transition-metal)] group overflow-hidden"
              >
                {/* Attention-seeking background shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />

                <div className="relative">
                  <img
                    src="/favicons/animatedCommunityIcon.gif"
                    alt="Community"
                    className="h-10 w-10 object-contain transition-transform group-hover:scale-110"
                  />
                  {/* Notification Dot / Pulse */}
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="relative z-10 text-sm">Community</span>
                  <span className="relative z-10 text-[9px] opacity-70 font-normal normal-case">any bugs or suggestions?</span>
                  <span className="absolute z-999 -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                {user ? (
                  <Link
                    href="/profile"
                    className="retro-btn flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-sm transition-all"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="User avatar"
                        className="w-5 h-5 rounded-full border border-[var(--color-retro-stroke)]"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white border border-[var(--color-retro-stroke)]">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span>Profile</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-sm transition-all"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>Sign In</span>
                  </button>
                )}
              </div>

              <ThemeToggleButton />
            </div>
          </header>

          {/* Mobile header: brand left, sign-in + dark mode right */}
          <header className="md:hidden flex items-center justify-between mb-5 px-1">
            <h1 className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-2xl font-extrabold text-transparent dark:from-cyan-400 dark:to-blue-500">
              Hayyanium
            </h1>
            <div className="flex items-center gap-2">
              {!user ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 font-bold uppercase text-xs"
                  aria-label="Sign In"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-xs">Sign In</span>
                </button>
              ) : ""}
              <ThemeToggleButton />
            </div>
          </header>

          <div className="flex flex-row gap-6">
            <main
              className={`flex-grow transition-all duration-500 ease-in-out ${isElementPanelOpen ? "w-full lg:w-[calc(100%-28rem)]" : "w-full"
                }`}
            >
              <section
                aria-label="Filters and controls"
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-30 py-2.5 sm:py-4 px-2 sm:px-6 border-b border-gray-200 dark:border-gray-700"
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
                  controlsDisabled={isHistoricalTableMode}
                  disabledMessage="Historical mode locked: search and filters are disabled to preserve exact 1860s layouts."
                />
              </section>

              {/* Touch drag hint on mobile */}
              {isBuilderActive && (
                <div className="md:hidden sticky top-[88px] z-20 flex items-center gap-2 bg-cyan-50/95 dark:bg-cyan-900/35 border border-cyan-200 dark:border-cyan-800 rounded-xl px-3 py-2 my-2 text-xs text-cyan-700 dark:text-cyan-300">
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                    />
                  </svg>
                  <span>
                    Long-press & drag an element into the Workbench below
                  </span>
                </div>
              )}

              {/* Table Mode Switcher (visible only in grid mode or 3d mode) */}
              {viewMode === "grid" && (
                <div className="px-2 py-2 bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 shrink-0 hidden sm:block">
                      Layout
                    </span>
                    <TableModeSwitcher
                      currentMode={tableMode}
                      onModeChange={setTableMode}
                    />
                  </div>
                  {/* Mode description */}
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 pl-1">
                    {LAYOUT_META[tableMode].icon}{" "}
                    {LAYOUT_META[tableMode].description}
                  </p>
                </div>
              )}
              {viewMode === "3d" && (
                <div className="px-2 py-2 bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 shrink-0 hidden sm:block">
                      3D Layout
                    </span>
                    <TableModeSwitcher3D
                      currentMode={table3DMode}
                      onModeChange={setTable3DMode}
                    />
                  </div>
                  {/* Mode description */}
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 pl-1">
                    {LAYOUT_3D_META[table3DMode].icon}{" "}
                    {LAYOUT_3D_META[table3DMode].description}
                  </p>
                </div>
              )}

              <section
                aria-label="Periodic table view"
                className="relative border border-gray-200 dark:border-gray-700 rounded-2xl overflow-auto bg-gray-50/50 dark:bg-gray-900/50 custom-scrollbar max-h-[calc(100vh-14.5rem)] sm:max-h-[calc(100vh-13rem)] lg:max-h-[calc(100vh-12rem)]"
              >
                {viewMode === "list" ? (
                  <ElementList
                    elements={visibleElements}
                    selectedElement={activeElement}
                    favorites={favorites}
                    onSelectElement={handleSelectElement}
                  />
                ) : viewMode === "3d" ? (
                  <Scene3D
                    elements={visibleElements}
                    selectedElement={activeElement}
                    favorites={favorites}
                    onSelectElement={handleSelectElement}
                    onHoverElement={setHoveredElement}
                    mode={table3DMode}
                  />
                ) : (
                  <TableZoomWrapper
                    ref={tableZoomRef}
                    mode={
                      LAYOUT_META[tableMode].renderType === "grid"
                        ? "spreadsheet"
                        : "transform"
                    }
                    mobileBottomOffset={isBuilderActive ? 156 : 108}
                  >
                    {(_scale, detailLevel) => (
                      <>
                        {tableMode === "modern" ? (
                          <PeriodicTable
                            elements={visibleElements}
                            selectedElement={activeElement}
                            favorites={favorites}
                            onSelectElement={handleSelectElement}
                            onHoverElement={setHoveredElement}
                            selectedTrend={selectedTrend}
                            isDraggable={isBuilderActive}
                            onElementDragStart={handleDragStart}
                            onElementDragEnd={handleDragEnd}
                            onGroupClick={handleGroupClick}
                            onPeriodClick={handlePeriodClick}
                            onElementTouchStart={handleElementTouchStart}
                            onElementTouchMove={handleElementTouchMove}
                            onElementTouchEnd={handleElementTouchEnd}
                            detailLevel={detailLevel}
                          />
                        ) : (
                          <TableRenderer
                            elements={visibleElements}
                            selectedElement={activeElement}
                            favorites={favorites}
                            onSelectElement={handleSelectElement}
                            onHoverElement={setHoveredElement}
                            selectedTrend={selectedTrend}
                            tableMode={tableMode}
                            isDraggable={isBuilderActive}
                            onElementDragStart={handleDragStart}
                            onElementDragEnd={handleDragEnd}
                            onElementTouchStart={handleElementTouchStart}
                            onElementTouchMove={handleElementTouchMove}
                            onElementTouchEnd={handleElementTouchEnd}
                            detailLevel={detailLevel}
                          />
                        )}
                      </>
                    )}
                  </TableZoomWrapper>
                )}

                {hoveredElement && !activeElement && viewMode === "grid" && (
                  <div className="pointer-events-none absolute top-30 left-1/2 z-20 -mt-12 -translate-x-1/2 rounded-md border border-cyan-500 bg-white p-2 text-sm shadow-lg dark:border-cyan-400 dark:bg-gray-800">
                    <h4 className="font-bold">
                      {hoveredElement.name} ({hoveredElement.symbol})
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {selectedTrend
                        ? `${trendNames[selectedTrend]}: ${hoveredElement[selectedTrend] ?? "N/A"} ${trendUnits[selectedTrend]}`.trim()
                        : hoveredElement.everydayExample}
                    </p>
                  </div>
                )}
              </section>
              <Legend />
              <Link
                href="/community"
                className="card flex w-full flex-col gap-4 p-6 group hover:-translate-y-1 transition-all duration-300 bg-[url('https://www.transparenttextures.com/patterns/p6.png')] sm:flex-row sm:items-center"
              >
                <div className="w-16 h-16 bg-post-transition-metal text-retro-stroke border-2 border-retro-stroke rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] opacity-60">
                    Your voice
                  </p>
                  <h3 className="font-black text-xl mb-1">Community Board</h3>
                  <p className="text-sm font-bold opacity-80 leading-relaxed">
                    Share bug reports, suggest features, and shape the next version of Hayyanium. If something feels off or something could be better, this is your place to say it.
                  </p>
                </div>
                <div className="ml-auto self-end w-12 h-12 rounded-full bg-white border-2 border-retro-stroke flex items-center justify-center group-hover:bg-retro-stroke group-hover:text-white transition-colors sm:self-auto">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            </main>

            {/* Desktop Panel */}
            <aside
              className={`hidden transition-all duration-500 ease-in-out lg:block lg:relative lg:inset-auto lg:items-start ${isElementPanelOpen ? "lg:w-full lg:max-w-md" : "lg:w-0"
                }`}
            >
              <div className="relative z-10 w-full overflow-hidden lg:h-auto lg:max-w-md lg:rounded-none lg:shadow-none">
                {activeElement && isElementPanelOpen && (
                  <Suspense
                    fallback={
                      <div className="space-y-4">
                        <div className="grid gap-4">
                          {[1, 2, 3].map((index) => (
                            <div
                              key={index}
                              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow"
                            >
                              <SkeletonLoader
                                width="100%"
                                height="200px"
                                radius="xl"
                                className="mb-3"
                              />
                              <div className="space-y-2">
                                <SkeletonLoader
                                  width="70%"
                                  height="1.5rem"
                                  radius="md"
                                />
                                <SkeletonLoader
                                  width="50%"
                                  height="1rem"
                                  radius="sm"
                                />
                                <SkeletonLoader
                                  width="80%"
                                  height="1rem"
                                  radius="sm"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    }
                  >
                    <ElementPanel
                      element={activeElement}
                      isFavorite={favorites.includes(
                        activeElement.atomicNumber,
                      )}
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

            {/* Mobile Panel Drawer */}
            {isMobileViewport && (
              <Drawer.Root
                open={isElementPanelOpen}
                onOpenChange={(open) => !open && handleClosePanel()}
                snapPoints={[0.5, 0.9]}
                fadeFromIndex={0}
              >
                <Drawer.Portal>
                  <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] lg:hidden" />
                  <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[101] flex flex-col rounded-t-[32px] bg-white dark:bg-gray-800 lg:hidden h-[96vh] outline-none shadow-2xl pb-[env(safe-area-inset-bottom)]">
                    <Drawer.Title className="sr-only">
                      Element Details
                    </Drawer.Title>
                    <Drawer.Description className="sr-only">
                      View detailed information about the selected element
                    </Drawer.Description>
                    <div className="mx-auto mt-4 mb-2 h-1.5 w-12 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
                      {activeElement && isElementPanelOpen && (
                        <Suspense fallback={null}>
                          <ElementPanel
                            element={activeElement}
                            isFavorite={favorites.includes(
                              activeElement.atomicNumber,
                            )}
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
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.Root>
            )}
          </div>
        </div>

        {/* Touch drag ghost element */}
        {touchDragActive && touchDragElement.current && (
          <div
            style={{
              position: "fixed",
              left: touchPos.x - 28,
              top: touchPos.y - 28,
              zIndex: 9999,
              pointerEvents: "none",
              opacity: 0.85,
            }}
            className="w-14 h-14 rounded-lg bg-cyan-500 text-white flex flex-col items-center justify-center shadow-2xl border-2 border-cyan-300 animate-pulse"
          >
            <span className="text-lg font-bold">
              {touchDragElement.current.symbol}
            </span>
            <span className="text-[10px]">
              {touchDragElement.current.atomicNumber}
            </span>
          </div>
        )}

        {isBuilderActive && (
          <CompoundBuilderTray
            elements={builderElements}
            isDragging={isDragging}
            onDrop={handleDropOnBuilder}
            onRemove={handleRemoveFromBuilder}
            onClear={handleClearBuilder}
            onCombine={handleCombine}
            isCombining={isCombining}
            workbenchRef={workbenchRef}
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
              onClose={() =>
                setPlotModalInfo({ isOpen: false, elements: [], title: "" })
              }
              elementsToPlot={plotModalInfo.elements}
              title={plotModalInfo.title}
              trend={selectedTrend}
              trendLabel={trendNames[selectedTrend]}
              trendUnit={trendUnits[selectedTrend]}
            />
          </Suspense>
        )}

        <Suspense fallback={null}>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </Suspense>
      </div>

      <LabPartner message={labPartnerMessage} />
    </>
  );
};

const ClientApp: React.FC<ClientAppProps> = ({ initialElements }) => {
  return <AppContent initialElements={initialElements} />;
};

export default ClientApp;
