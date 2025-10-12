
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

export interface ElementData {
  atomicNumber: number;
  symbol: string;
  name: string;
  category: ElementCategory;
  block: string;
  period: number;
  group: number;
  atomicMass: number | string;
  stateAtSTP: string;
  electronConfiguration: string;
  electronegativity: number | null;
  oxidationStates: (number | string)[] | null;
  density_g_cm3: number | null;
  meltingPointK: number | null;
  boilingPointK: number | null;
  discoveryYear: number | string | null;
  discoverer: string;
  commonUses: string[] | null;
  safetyNotes: string | null;
  everydayExample: string;
  xpos: number;
  ypos: number;
  summary: string;
}
