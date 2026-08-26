# Sticky Notes

A Google Keep–style note-taking app. Notes are stored in Neon Postgres
behind a Vercel serverless API, with per-user accounts (JWT cookie auth) —
sign in from any device to see your notes.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and JWT_SECRET
vercel dev                    # dev server + API at http://localhost:5173
```

Run the schema in `CLAUDE.md` ("DB Schema") against your Neon database
before first use.

## Scripts

| Command           | Description                                          |
| ------------------ | ----------------------------------------------------- |
| `vercel dev`         | Start dev server with API support (preferred)        |
| `npm run dev`          | Frontend only — `/api` calls will fail without `vercel dev` |
| `npm run build`          | Build for production into `dist/`                    |
| `npm run lint`             | Run oxlint                                            |
| `npm run preview`            | Preview the production build                          |

## Features

- Email/password accounts, JWT httpOnly cookie session
- Add notes with an expandable "Take a note..." composer
- Masonry note grid with a separate pinned section
- Pin, archive, delete (soft), and color notes
- Label notes and filter by label from the sidebar
- Edit any note inline, with auto-save on close
- Live, debounced search across title/content/labels
- Trash view with restore / delete forever
- Archive view
- Responsive down to ~375px wide

## Deploy to Vercel

Push to a Git repo and import it in Vercel — it's a standard Vite app with
serverless functions in `api/`, so the default build settings work with
zero configuration. Set `DATABASE_URL` and `JWT_SECRET` in the Vercel
project's environment variables before deploying.
