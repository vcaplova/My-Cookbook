# My Cookbook 📖

A personal recipe library — warm, fast, and entirely yours. This is the full React port of the original single-file app, built with Vite and React Router.

**Live app:** https://vcaplova.github.io/My-Cookbook/

## Features

- **Library views** — grid and list, with search, cook-time and servings filters, and tag filtering
- **Collections** — create, edit, and colour-code collections with food emoji icons
- **Recipe detail** — ingredient scaling by servings, US ↔ metric unit conversion (tsp/tbsp intentionally excluded), personal notes
- **Cook mode** — step-by-step guidance with per-step ingredients, automatic timer detection (including "10 to 12 minutes" ranges with a slider), and multi-timer support
- **Pin & star** recipes, nine colour palette themes, JSON export
- **AI import** — import recipes from URLs or photos via the Anthropic API (bring your own API key, set in Settings; stored only in your browser)
- **Local-first** — everything persists in localStorage; no account, no server

## Architecture

```
src/
├── lib/          Pure logic: unit conversion, timers, scaling, palettes, storage adapter, AI client
├── context/      LibraryContext — recipes, collections, tags, filters, persistence
├── components/   Chrome (top bar, sidebar, bottom nav), icons, modals
├── pages/        Library, Recipe detail, Cook mode (React Router routes)
└── styles/       The original design system, ported wholesale
```

The storage layer (`src/lib/storage.js`) is a swappable adapter — the app is backend-ready. Swap `LocalStorageAdapter` for an API-backed adapter without touching component code.

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

Deployed automatically to GitHub Pages on every push to `main` via GitHub Actions.
