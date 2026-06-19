# SpeakUp — Admin Panel

React + Vite + Tailwind admin dashboard for SpeakUp (users, sessions, leaderboard,
payments, bonuses, content, activity log, settings).

## Architecture
```
src/
├── App.tsx            # routes (react-router) + react-query provider + auth guards
├── main.tsx           # entry
├── api/client.ts      # axios instance (Bearer token from auth store, 401 → /login)
├── services/          # ── the ONLY place that touches the data source ──
│   ├── admin.ts        #   data fns (users, sessions, …) — mock today, API later
│   └── auth.ts         #   admin login
├── hooks/queries.ts   # react-query hooks over services (useUsers, useSessions, …)
├── store/authStore.ts # zustand auth + sidebar state (persisted)
├── pages/             # one component per route — consume hooks, never mock
├── components/Layout  # sidebar + topbar shell
├── data/mock.ts       # mock dataset (imported ONLY by services/admin.ts)
├── types/             # shared domain types
└── styles/            # tailwind v4 + theme
```

**Swapping mock → real backend:** edit only `src/services/*`. Replace each function
body with an `api.get(...)` call (see commented examples). Pages and hooks don't change.

## Run
```bash
cp .env.example .env        # set VITE_API_URL when a backend exists
pnpm install
pnpm dev                    # http://localhost:5173
pnpm build                  # -> dist/
pnpm typecheck
```

Demo login (mock auth): **admin@speakup.ai / admin123**.

## Deploy (Vercel)
Set project **Root Directory = `frontend-admin`** (Vite auto-detected), env var
`VITE_API_URL` = admin API origin. SPA — add a catch-all rewrite to `/index.html`.
