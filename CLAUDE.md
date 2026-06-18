# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Upward is an Electron desktop app (React 19 + TypeScript) for personal productivity: projects with Kanban boards/sprints/tasks, routines, goals, habits, notes, and an optional Google Calendar integration. Built with `electron-vite`. Local-first: all data lives in a SQLite database managed by Drizzle ORM. No backend server.

## Commands

```bash
npm run dev            # Run app in development (HMR for renderer)
npm run build          # Typecheck (node + web) then electron-vite build
npm run build:mac      # Build + package macOS app (also :win, :linux, :unpack)
npm run lint           # ESLint with cache
npm run format         # Prettier write across repo
npm run typecheck      # Both typecheck:node and typecheck:web
npm run db:generate    # Generate a Drizzle migration after editing the schema
```

There is no test runner configured. `npm run build` always runs `typecheck` first, so type errors break builds.

## Architecture

Three Electron processes, each with its own tsconfig and Vite build (see `electron.vite.config.ts`):

- **main** (`src/main/`) — Node process. Owns the database, all business logic, and IPC handlers.
- **preload** (`src/preload/`) — Bridges main and renderer. Exposes a typed `window.api` via `contextBridge`.
- **renderer** (`src/renderer/src/`) — React UI. Has **no** direct DB/Node access; everything goes through `window.api`.

### The data flow (important — follow this for any new feature)

Adding or changing a data operation touches **four files in lockstep**:

1. `src/shared/schema.ts` — Drizzle table + inferred `Select`/`Insert` types. Shared across processes via the `@shared` alias.
2. `src/main/ipc.ts` — register an `ipcMain.handle('<domain>:<action>', ...)` that runs Drizzle queries against `db`.
3. `src/preload/index.ts` — add the matching method under `api.<domain>.<action>` that calls `ipcRenderer.invoke('<domain>:<action>', ...)`. Keep the param types in sync with the handler.
4. `src/renderer/src/store/<domain>Store.ts` — a Zustand store that calls `window.api.<domain>.*` and holds the UI state.

IPC channels are namespaced `domain:action` (e.g. `projects:create`, `tasks:move`, `kanban:reorderColumns`). Renderer components consume Zustand stores, never IPC directly.

### Database

- `better-sqlite3` + Drizzle, initialized in `src/main/database.ts`. DB file is at `app.getPath('userData')/upward.db` (note: `drizzle.config.ts` points at `./upward.db` in the project root, used only by `drizzle-kit` for generating migrations).
- Migrations live in `drizzle/` and are applied automatically on startup via `runMigrations()` in `src/main/index.ts`. After changing `schema.ts`, run `npm run db:generate` to emit a new SQL migration — do not hand-edit applied migrations.
- Timestamps are stored as ISO strings (`new Date().toISOString()`), not native dates. JSON-shaped fields (e.g. `routines.daysOfWeek`) are stored as `JSON.stringify`'d text and parsed at the boundary.
- Project creation seeds default Kanban columns (Backlog / In Progress / In Review / Done); the Done column is `isDefault` and cannot be deleted. Foreign keys cascade-delete (e.g. deleting a project removes its columns, sprints, tasks).

### Google Calendar integration (optional)

- OAuth flow in `src/main/oauth/googleCalendar.ts`; API/sync in `src/main/services/googleCalendarApi.ts`; token persistence in `src/main/services/tokenStorage.ts`.
- Tokens are encrypted with Electron `safeStorage` (Keychain/Credential Manager) before being stored in the `integrations` table. `safeStorage` may be unavailable (e.g. Linux without a secret service) — code guards with `canStoreTokensSecurely()`.
- `GOOGLE_CLIENT_ID` is read from `.env` in dev (`src/main/envLoader.ts`) and baked into the build via the `__BUILTIN_GOOGLE_CLIENT_ID__` define in `electron.vite.config.ts`. See README for Google Cloud setup. OAuth redirect URI is `http://localhost:3456/callback`.
- Calendar events are cached locally in `calendar_events_cache` for offline/countdown display.

### Renderer specifics

- No router. `App.tsx` does manual page switching via `currentPage` state and the `Sidebar`; project detail is shown by setting `openProjectId`.
- Theme is light/dark/system, persisted to `localStorage` and applied as `theme-dark`/`theme-light` classes on `<html>`. Styling is Tailwind (`tailwind.config.js`) plus CSS in `src/renderer/src/assets/`.

## Conventions

- Path aliases: `@shared` (both main and renderer), `@renderer` (renderer only). Use these instead of long relative paths.
- Prettier (`.prettierrc.yaml`) + ESLint enforce style; no semicolons, single quotes. Run `npm run format` / `npm run lint` before finishing.
- Parts of the codebase (user-facing strings, some error messages, README) are in Spanish. Match the surrounding language of the file you're editing.
