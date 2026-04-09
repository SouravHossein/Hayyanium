import { ElementCategory } from './types';

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
  lanthanide: '#e76f51',
  actinide: '#f4a261',
  'transition metal': '#a8dadc',
  'post-transition metal': '#457b9d',
  metalloid: '#8ecae6',
  nonmetal: '#2a9d8f',
  halogen: '#264653',
  'noble gas': '#a2d2ff',
  unknown: '#d9d9d9',
};

export const CATEGORY_EMOJIS: Record<ElementCategory, string> = {
  'alkali metal': '\u{1F50B}',
  'alkaline earth metal': '\u{1F9F1}',
  lanthanide: '\u{1F4A1}',
  actinide: '\u2622\uFE0F',
  'transition metal': '\u2699\uFE0F',
  'post-transition metal': '\u{1F517}',
  metalloid: '\u26A1\uFE0F',
  nonmetal: '\u{1F388}',
  halogen: '\u{1F9EA}',
  'noble gas': '\u{1F32C}\uFE0F',
  unknown: '\u2753',
};
