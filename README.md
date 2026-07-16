# React Applications Manager

Feature-parity React + TypeScript rewrite of the Vue Applications Manager monorepo SPA. Uses the same Django REST API backend and preserves existing user-visible URLs.

## Stack

- React 19 + TypeScript + Vite 8
- MUI (Material UI) + Emotion
- TanStack Query + Zustand
- React Router v7
- Axios
- React Hook Form + Zod
- Vitest + React Testing Library + MSW
- Firebase Hosting

## Requirements

- Node.js **22.x** (see [`.nvmrc`](.nvmrc))

## Setup

```bash
cp .env.example .env
npm install
```

Fill in `.env` values (same `VITE_*` names as the Vue app):

| Variable | Purpose |
| --- | --- |
| `VITE_REMOTE_HOST` | API base URL |
| `VITE_ENCRIPTION_KEY` | CryptoJS AES key for social profile cache |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe.js publishable key |
| `VITE_STRIPE_ACTION_TYPE` | `session` or `charge` |

## Scripts

```bash
npm run dev          # Vite dev server on http://localhost:5173
npm run build        # Typecheck + production build
npm run preview      # Preview production build
npm run lint         # ESLint
npm run format       # Prettier write
npm run test         # Vitest watch
npm run test:run     # Vitest single run
npm run test:coverage
```

## Project layout

See [docs/react-frontend-development-plan.md](docs/react-frontend-development-plan.md) for the full development plan (phases 0–12), route matrix, and API surface.

```
src/
  app/          # theme, QueryClient, providers
  router/       # createBrowserRouter
  core/         # auth, http, alert (Phase 1+)
  shared/       # shared UI, hooks, utils
  features/     # apps-manager, taberna, social, ai-lab
```

## Deploy

Production builds go to `dist/` and are configured for Firebase Hosting SPA rewrites in [`firebase.json`](firebase.json). CI runs lint, test, and build on every PR (deploy is added in a later phase).
