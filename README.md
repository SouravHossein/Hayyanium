# Hayyanium

Hayyanium is a Next.js 15 interactive periodic table with rich element detail pages, discovery timelines, quiz modes, compound-building tools, and optional Supabase-backed user features.

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth + data storage
- Three.js / React Three Fiber
- Optional Gemini-powered chemistry helpers

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and add the values you need:

```env
NEXT_PUBLIC_GEMINI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_DEVELOPER_EMAIL=
```

3. Start the app:

```bash
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```

## Production Notes

- `npm run build` currently succeeds.
- `npm run lint` is not configured yet. Next.js 15 now expects a standalone ESLint setup instead of `next lint`.
- PWA generation is currently disabled in `next.config.mjs`.
- User-facing data features in profile, favorites, discoveries, and community pages require Supabase tables and auth providers to be configured in your project.
