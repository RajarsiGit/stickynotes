# Sticky Notes

A Google Keep–style note-taking app. Notes are stored in Neon Postgres
behind a Vercel serverless API, with per-user accounts (JWT httpOnly-cookie
auth) — sign in from any device to see your notes.

## Tech stack

- **Frontend:** React + Vite, Tailwind CSS
- **Backend:** Vercel serverless functions (`api/`)
- **Database:** Neon Postgres (`@neondatabase/serverless`)
- **Auth:** JWT in an httpOnly cookie, passwords hashed with `bcryptjs`

## Features

- Email/password accounts, JWT httpOnly cookie session
- Add notes with an expandable "Take a note..." composer
- Masonry note grid with a separate pinned section
- Pin, archive, delete (soft), and color notes
- Label notes and filter by label from the sidebar
- Click a note to edit it in a focused, centered modal, with auto-save on close
- Live, debounced search across title/content/labels
- Trash view with restore / delete forever
- Archive view
- Responsive down to ~375px wide

## Project structure

```
api/
  auth.js          # register / login / logout / me
  notes.js         # notes CRUD, scoped to the signed-in user
  db.js            # Neon client, JWT sign/verify, CORS allowlist
src/
  components/       # NoteCard, NoteInput, NoteGrid, Sidebar, Toolbar,
                     # ColorPicker, LabelPicker, AuthScreen, Loader
  context/
    AppContext.jsx   # user/notes state, all note actions
  utils/
    api.js            # fetch helpers for api/
    colors.js          # preset note color palette
  App.jsx
  main.jsx
```

## Prerequisites

- Node.js
- A [Neon](https://neon.tech) Postgres database (free tier is fine) —
  **use a database dedicated to this project**, not shared with another app;
  the schema below defines tables named `users` and `notes`, which would
  collide with any other app using the same names in the same database.
- The [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`), for
  running the API locally with `vercel dev`

## Setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and JWT_SECRET
vercel dev                    # dev server + API at http://localhost:5173
```

Then run the schema below against your Neon database before first use
(via the Neon SQL editor, or `psql "$DATABASE_URL"`).

### Database schema

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

There's no migration runner in this project — the schema above is applied
manually, once, to whichever Neon database `DATABASE_URL` points at.

### Environment variables

Copy `.env.example` to `.env.local` for local dev, and set the same values
in the Vercel project (Settings → Environment Variables) for deployment.

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Neon Postgres connection string (pooled connection, `...neon.tech/...?sslmode=require`) |
| `JWT_SECRET` | Yes | Secret used to sign JWTs. The API throws at startup if this is unset — there is no insecure default fallback |
| `VITE_API_BASE_URL` | No | Defaults to `/api`. Only needed if the API is hosted at a different origin than the frontend |
| `ALLOWED_ORIGIN` | No | Comma-separated CORS allowlist for credentialed cross-origin requests. Only needed if the frontend is served from a different origin than the API — a normal same-origin Vercel deployment doesn't need it |

## Scripts

| Command | Description |
| --- | --- |
| `vercel dev` | Start dev server with API support (preferred) |
| `npm run dev` | Frontend only — `/api` calls will fail without `vercel dev` |
| `npm run build` | Build for production into `dist/` |
| `npm run lint` | Run oxlint |
| `npm run preview` | Preview the production build |

## API overview

All endpoints are under `/api`, require the `auth_token` cookie (except
register/login), and are scoped to the authenticated user.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/auth` | Register |
| `POST` | `/api/auth/login` | Log in |
| `POST` | `/api/auth/logout` | Log out |
| `GET` | `/api/auth/me` | Current user |
| `GET` | `/api/notes` | List the signed-in user's notes |
| `POST` | `/api/notes` | Create a note |
| `PUT` | `/api/notes` | Partially update a note (any of title/content/color/pinned/archived/trashed/labels) |
| `DELETE` | `/api/notes?id=` | Permanently delete a note |

## Deploy to Vercel

Push to a Git repo and import it in Vercel — it's a standard Vite app with
serverless functions in `api/`, so the default build settings work with
zero configuration. Set `DATABASE_URL` and `JWT_SECRET` in the Vercel
project's environment variables before deploying, and run the schema above
against the Neon database first.
