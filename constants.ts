
import { ElementCategory } from './types/index';

export const CATEGORY_COLORS: Record<ElementCategory, string> = {
  'alkali metal': 'bg-alkali-metal',
  'alkaline earth metal': 'bg-alkaline-earth-metal',
  lanthanide: 'bg-lanthanide',
  actinide: 'bg-actinide',
  'transition metal': 'bg-transition-metal',
  'post-transition metal': 'bg-post-transition-metal',
  metalloid: 'bg-metalloid',
  nonmetal: 'bg-nonmetal',
  halogen: 'bg-halogen',
  'noble gas': 'bg-noble-gas',
  unknown: 'bg-unknown',
};

export const CATEGORY_TEXT_COLORS: Record<ElementCategory, string> = {
  'alkali metal': 'text-gray-900',
  'alkaline earth metal': 'text-gray-900',
  lanthanide: 'text-gray-900',
  actinide: 'text-gray-900',
  'transition metal': 'text-gray-900',
  'post-transition metal': 'text-white',
  metalloid: 'text-gray-900',
  nonmetal: 'text-gray-900',
  halogen: 'text-white',
  'noble gas': 'text-gray-900',
  unknown: 'text-gray-900',
};
