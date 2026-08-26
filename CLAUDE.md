# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Google Keep–style note-taking app. React + Vite + Tailwind CSS on the
frontend, Vercel serverless functions + Neon Postgres on the backend
(pattern matches the sibling `smart-notes` project). Multi-user, JWT
cookie auth — each user only sees their own notes.

## Commands

```bash
npm install         # install deps
vercel dev           # dev server with API support (preferred — proxies /api to serverless functions)
npm run dev            # frontend only, at http://localhost:5173 — /api calls will fail without vercel dev
npm run build             # production build to dist/
npm run lint                # oxlint (config: .oxlintrc.json)
npm run preview               # preview the production build
```

There is no test suite in this project.

### oxlint on Windows + Node < 20.19

oxlint ships its linter as a platform-specific native binding
(`@oxlint/binding-<platform>`), installed as an npm optional dependency. On a
dev machine running Node < 20.19, npm's optional-dependency resolution can
skip installing that binding, and `npm run lint` fails with "Cannot find
native binding". Fix locally with:

```bash
npm install @oxlint/binding-win32-x64-msvc --no-save
```

**Never add that package to `package.json` or let it land in
`package-lock.json` as a non-optional entry** — it is Windows-only and will
break `npm install` on Vercel's Linux build (`EBADPLATFORM`). Always use
`--no-save`, and if `package-lock.json` ends up with a
`node_modules/@oxlint/binding-win32-x64-msvc` entry missing `"optional":
true`, regenerate the lockfile (`rm -rf node_modules package-lock.json &&
npm install`) before committing.

## Architecture

**Frontend data flow:**
- `src/context/AppContext.jsx` owns `user`, `notes`, `loading`; exposes
  `addNote`, `updateNote`, `deleteNote`, `restoreNote`, `permanentDelete`,
  `togglePin`, `toggleArchive`, `setColor`, `addLabel`/`removeLabel`,
  `removeLabelEverywhere`/`renameLabelEverywhere`, `logout`. Loads
  `user`/`notes` from the API on mount via `loadData`.
- `labels` is *derived* from `notes` (`useMemo` over each note's `labels`
  array) — there is no separate labels table or collection. A label exists
  only as long as some note references it.
- All mutations are optimistic: state updates immediately, then the API call
  fires; on failure the optimistic update is not rolled back (logged to
  console only) since these are simple toggles a user can retry.
- `App.jsx` (`NotesApp`) is the composition root: holds view/filter UI state
  (`view`: notes/archive/trash/label, `activeLabel`, `search`, debounced via
  a local `useDebounced` hook) that is orthogonal to `AppContext`'s data
  state, derives `filteredNotes` via `useMemo`, and passes a single
  `cardActions` object down to `NoteGrid` → `NoteCard`.
- Notes persist to **Neon Postgres** via Vercel serverless functions — no
  localStorage.

**Backend (`api/`, Vercel serverless functions):**
- `api/auth.js` — register / login / logout / me (JWT, httpOnly cookie, 1h
  expiry). Single handler; sub-route dispatched by `path` (see `vercel.json`
  rewrites, since one Vercel function can't have multiple URL paths without
  them).
- `api/notes.js` — CRUD, maps snake_case DB columns → camelCase JSON. `PUT`
  is a generic partial update (`COALESCE(${field ?? null}, field)` per
  column) — every note mutation (pin, archive, soft-delete, restore, color,
  labels, title/content edit) goes through the same endpoint with different
  fields set.
- `api/db.js` — `getDb()` (lazy-init Neon `sql` tagged-template client),
  `getUserFromRequest()` (parses the `auth_token` cookie, verifies the JWT,
  loads the user row), `signToken`/`verifyToken` (JWT, `HS256` pinned,
  `JWT_SECRET` required — throws at module load if unset, no insecure
  fallback), `setCorsHeaders()` (only echoes `Access-Control-Allow-Origin`
  for an origin on the `ALLOWED_ORIGIN` allowlist — never combine a
  reflected/wildcard origin with `Allow-Credentials: true`). `api/auth.js`
  and `api/notes.js` both import these rather than rolling their own.
- `src/utils/api.js` — `authApi` + `notesApi` fetch helpers, all
  `credentials: 'include'` so the httpOnly cookie round-trips.
- `vercel.json` — rewrites `/api/auth/{login,logout,me}` to
  `/api/auth?path=...`, SPA fallback to `index.html`, CORS headers.

Note shape (camelCase, as returned by the API and stored in `notes` state):

```js
{
  id,                          // integer, from Postgres SERIAL
  title, content,
  color,                        // Tailwind bg-* class name, applied directly as className
  pinned, archived, trashed,     // booleans; mutually orthogonal, not an enum
  labels,                         // string[]
  createdAt, updatedAt,
}
```

Soft-delete only: `deleteNote` sets `trashed: true` (and unpins); there is a
separate `permanentDelete` (hard `DELETE` in Postgres) for the trash view's
"delete forever". Archiving also unpins (`toggleArchive`). `NoteGrid`
renders a pinned section separately only in the `notes` view — pinned notes
aren't specially sectioned in archive/trash/label/search results.

Color and label pickers (`ColorPicker.jsx`, `LabelPicker.jsx`) are shared
popovers used by both `NoteCard` (editing an existing note) and `NoteInput`
(composing a new one) — they take the current selection and callbacks as
props and don't touch `AppContext` state directly. The preset color list
lives in `src/utils/colors.js` (kept out of `ColorPicker.jsx` itself to
satisfy the `react/only-export-components` oxlint rule, which flags files
that export both a component and a constant).

Action-row buttons on `NoteCard` (pin/color/label/archive/delete) are
visible by default and only hover-gated above the `md` breakpoint
(`md:opacity-0 md:group-hover:opacity-100`), matching the "always visible on
touch" requirement without a touch-detection check.

## DB Schema

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  color VARCHAR(50) NOT NULL DEFAULT 'bg-white',
  pinned BOOLEAN NOT NULL DEFAULT false,
  archived BOOLEAN NOT NULL DEFAULT false,
  trashed BOOLEAN NOT NULL DEFAULT false,
  labels TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Environment

Copy `.env.example` → `.env.local` and fill:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `JWT_SECRET` — secret for signing JWTs; **required**, the API throws at
  startup if unset (no default-secret fallback)
- `VITE_API_BASE_URL` — defaults to `/api`, only needed if the API is hosted elsewhere
- `ALLOWED_ORIGIN` — comma-separated CORS allowlist; only needed if the
  frontend is served from a different origin than the API (same-origin
  Vercel deployments don't need it)

## Non-goals (v1)

No multi-device conflict resolution beyond last-write-wins, no rich text
formatting, no drag-to-reorder, no image attachments. Trash is not
auto-emptied.
