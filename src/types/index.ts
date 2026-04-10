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
  reactionExplanation?: string;
  energyChange?: {
    type: 'exothermic' | 'endothermic';
    value: number;
  };
}

export interface SavedCompound {
  id: string;
  formula: string;
  name: string;
  elements: ElementData[];
}

export type Trend =
  | 'atomicRadius_pm'
  | 'electronegativity'
  | 'firstIonizationEnergy_kJ_mol';
