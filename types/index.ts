export type ElementCategory = 
  | 'alkali metal'
  | 'alkaline earth metal'
  | 'lanthanide'
  | 'actinide'
  | 'transition metal'
  | 'post-transition metal'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble gas'
  | 'unknown';

export interface Isotope {
  mass: number;
  abundance: string | null;
  half_life: string;
  decay_mode: string | null;
}

export interface ElementData {
  atomicNumber: number;
  symbol: string;
  name: string;
  category: ElementCategory;
  block: string;
  period: number;
  group: number;
  atomicMass: number | string;
  atomicRadius_pm: number | null;
  firstIonizationEnergy_kJ_mol: number | null;
  stateAtSTP: string;
  electronConfiguration: string;
  electronegativity: number | null;
  oxidationStates: (number | string)[] | null;
  density_g_cm3: number | null;
  meltingPointK: number | null;
  boilingPointK: number | null;
  discoveryYear: number | string | null;
  discovery_story: string;
  commonUses: string[] | null;
  safetyNotes: string | null;
  everydayExample: string;
  xpos: number;
  ypos: number;
  summary: string;
  isotopes?: Isotope[];
}

export interface CompoundResult {
  compoundFormed: boolean;
  formula?: string;
  name?: string;
  bondType?: string;
  description?: string;
  lewisStructure?: string;
  error?: string;
}

export type QuizMode = 'symbol' | 'name' | 'atomicNumber' | 'group' | 'period';

export interface QuizResult {
  mode: QuizMode;
  correct: number;
  total: number;
  durationMs: number;
  timestamp: number;
}

export interface ProgressState {
  perMode: Record<QuizMode, { correct: number; total: number }>;
  perCategory: Record<ElementCategory, { correct: number; total: number }>;
  perGroup: Record<string, { correct: number; total: number }>;
  perPeriod: Record<string, { correct: number; total: number }>;
  streak: number;
  lastPlayed: number | null;
}

export interface StudySet {
  id: string;
  name: string;
  elementIds: number[];
  source: 'builtin' | 'custom';
  createdAt: number;
}

export interface UiSettings {
  highContrast: boolean;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
}

export interface UrlState {
  tab: 'explore' | 'learn' | 'classroom' | 'settings';
  search: string;
  filters: { category: string; state: string };
  elementId: number | null;
  studySetId: string | null;
}
