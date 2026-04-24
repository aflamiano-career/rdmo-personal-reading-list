# rdmo — Personal Reading List

A modern reading tracker built with React 19 + React Router v7.

---

→ [View Live Site](https://rdmo-personal-reading-list.vercel.app/)

## Features

### Library

- Browse your entire book collection on the Library page with shelf and genre filters
- Search and add real books via the Open Library API — covers, page counts, and metadata auto-filled
- Move books between shelves (Want to Read, Currently Reading, Read) from any book card
- Log reading progress by page for currently-reading books
- Rate and write notes on finished books
- Quick-action menu on each card for shelf changes and deletion
- Empty shelf state with call-to-action

### Goals & Stats

- Set a yearly reading goal and track progress with a circular progress indicator
- Stats page with monthly books-read chart, genre breakdown, total pages read, and average rating
- Reading pace projection based on books finished so far this year

### UI & Experience

- Light and dark mode with system preference detection — persists across sessions via localStorage
- Responsive layout across desktop, tablet, and mobile
- Toast notifications for book actions (added, moved, deleted)
- 5-column book grid with genre-colored placeholder covers when no cover image is available

## Limitations

This is a demo project and is not intended for production use.

- No real authentication — the app offers a guest mode (preloaded sample books) or a blank account mode
- No backend or cloud sync — all state is stored in localStorage and lost if cleared
- Book search depends on the Open Library API, a public free API with no uptime guarantee
- Cover images are served by Open Library's CDN and may occasionally fail to load

## Architecture

**Routing.** Uses `BrowserRouter` from React Router v7 with `<Routes>` and nested `<Route>` elements. A `ProtectedRoute` wrapper redirects unauthenticated users to the landing page. `AppLayout` holds the shared `Navigation` sidebar and an `<Outlet />` for page components.

**State management.** All book, goal, and session state lives in `AppContext`, backed by `useReducer` with a typed action set (`ADD_BOOK`, `UPDATE_BOOK`, `DELETE_BOOK`, `MOVE_SHELF`, `UPDATE_PROGRESS`, `SET_GOAL`, etc.). State is persisted to and rehydrated from `localStorage` via `storage.js`. Toast notifications are managed separately in `ToastContext`.

**Data fetching.** `utils/api.js` wraps the Open Library search and ISBN-lookup endpoints. Genre is inferred client-side from subject tags returned by the API.

**Error handling.** Unmatched routes redirect to `/`. Cover image load errors fall back to a genre-colored placeholder rendered entirely in CSS/JSX with the book title and author.

## Design

Warm bibliophile aesthetic: a cream-and-parchment base (`#FAF8F5`, `#F3F0EB`) with a terracotta accent (`#A8612B`) for interactive elements and shelf highlights. Typography pairs Lora (serif headings) with Inter (UI sans-serif). Shelf states each have a distinct hue — blue for Want to Read, terracotta for Currently Reading, green for Read. Dark mode shifts the palette to warm near-blacks while preserving all accent colors.

## CSS Naming Convention

All styles follow BEM (Block Element Modifier):

```
block__element--modifier
```

- **Block** — standalone component (`book-card`, `navigation`, `progress-bar`)
- **Element** — a part of the block, separated by `__` (`book-card__cover`, `navigation__link`)
- **Modifier** — a variant or state, separated by `--` (`book-card__shelf-badge--currently-reading`, `progress-bar--sm`)

All styles live in a single `src/index.css` file, organized by block with section headers.

## Tech Stack

| Tool         | Version |
|--------------|---------|
| React        | 19      |
| React Router | 7       |
| Recharts     | 3       |
| Vite         | 8       |
