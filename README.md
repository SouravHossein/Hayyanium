# Interactive Periodic Table

An interactive, feature-rich periodic table built with React and Vite. Explore elements, compare properties, visualize trends, and experiment with a lightweight compound builder.

## Features

- Search by name, symbol, or atomic number
- Filter by category, state at STP, and discovery year range
- Favorites for quick access
- Element comparison (up to 3)
- Periodic trend visualization by group/period
- Compound builder with AI-assisted result output
- Light/dark theme toggle

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS
- @google/genai for AI-assisted compound analysis

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Create or update `.env.local` with your API key:
   `VITE_GEMINI_API_KEY=your_api_key_here`
3. Start the dev server:
   `npm run dev`
