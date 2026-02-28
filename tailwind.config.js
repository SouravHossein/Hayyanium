export default {
  darkMode: 'class',
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'alkali-metal': '#f4a261',
        'alkaline-earth-metal': '#e9c46a',
        lanthanide: '#e76f51',
        actinide: '#f4a261',
        'transition-metal': '#a8dadc',
        'post-transition-metal': '#457b9d',
        metalloid: '#8ecae6',
        nonmetal: '#2a9d8f',
        halogen: '#264653',
        'noble-gas': '#a2d2ff',
        unknown: '#d9d9d9'
      }
    }
  }
};