# Tatami — Private Lesson Tracker

A clean, cloud-backed web app for private-lesson instructors: manage students,
track their progress (belt history + skills), log lessons, and record payments.
Web-first (installable as a PWA) with a documented path to a native iOS app.

> **New here?** Two guides in [`docs/`](docs/):
> [`OWNERS_GUIDE.md`](docs/OWNERS_GUIDE.md) (how to use the app, non-technical) and
> [`HANDOFF_CHECKLIST.md`](docs/HANDOFF_CHECKLIST.md) (how to go live, step by step).

## Tech

- **Vite + React + TypeScript** — a static single-page app; the host builds it, so nobody runs builds by hand.
- **Supabase** (Postgres + Auth + Row-Level Security) for cloud data and login.
- Runs in two modes behind one interface (`src/data/`): **`local`** (in-browser
  sample data, zero setup — the default) and **`supabase`** (real cloud + login).

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173  (sample-data mode, no accounts)
```

Other scripts:

```bash
npm run build      # typecheck + production build → dist/
npm test           # unit tests (billing math) + a render smoke test
npm run preview    # serve the production build
```

## Turn on the cloud (Supabase)

1. Create a Supabase project, then run [`supabase/schema.sql`](supabase/schema.sql)
   in the SQL Editor (creates tables, RLS, triggers).
2. Copy `.env.example` → `.env` and set:
   ```
   VITE_DATA_MODE=supabase
   VITE_SUPABASE_URL=...        # Project Settings → API
   VITE_SUPABASE_ANON_KEY=...   # the anon/public key (safe in the browser; RLS protects data)
   ```
3. Create a login user in Supabase → Authentication → Users.
4. `npm run dev` and sign in.

For production, set those three variables in your host's dashboard instead of a
`.env` file. See the handoff checklist.

## Project layout

```
src/
  data/       DataStore interface + LocalStore, SupabaseStore, sample data
  auth/       AuthClient interface + MockAuth, SupabaseAuth, AuthProvider
  lib/        pure helpers: money (integer cents), dates, billing math
  components/ shared UI (buttons, cards, badges, rows)
  features/   screens: dashboard, students, lessons, payments, statement, settings
  styles/     Japandi design tokens + global/component CSS
supabase/     schema.sql
docs/         owner's guide + handoff checklist
```

## Rebranding

All naming lives in [`src/brand.ts`](src/brand.ts). Change it there. The app is
intentionally unbranded.

## iOS (later)

The app installs to the home screen today (Safari → Share → Add to Home Screen).
A native App Store build is a later add-on via **Capacitor**, which wraps this
same `dist/` — it needs a Mac with Xcode and an Apple Developer account
($99/year). No rewrite required.
