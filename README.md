# Interactive Periodic Table

A Vite + React + TypeScript periodic table with:

- interactive grid and list views
- favorites, compare mode, and compound builder
- optional Gemini-powered chemistry helpers
- Tailwind-powered styling with local build-time dependencies

## Getting Started

1. Install dependencies with `npm install`
2. Create `.env.local` from `.env.example`
3. Start the dev server with `npm run dev`

## Environment

This project uses Vite-style client env vars:

- `VITE_GEMINI_API_KEY`

If the Gemini key is missing, the app still works and AI-only actions degrade gracefully.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run typecheck`
