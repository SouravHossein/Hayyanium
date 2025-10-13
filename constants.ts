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

export const CATEGORY_HEX_COLORS: Record<ElementCategory, string> = {
    'alkali metal': '#f4a261',
    'alkaline earth metal': '#e9c46a',
    'lanthanide': '#e76f51',
    'actinide': '#f4a261',
    'transition metal': '#a8dadc',
    'post-transition metal': '#457b9d',
    'metalloid': '#8ecae6',
    'nonmetal': '#2a9d8f',
    'halogen': '#264653',
    'noble gas': '#a2d2ff',
    'unknown': '#d9d9d9',
};
