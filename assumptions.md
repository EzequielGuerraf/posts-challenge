# Assumptions

## Framework / routing
- Using Next.js App Router (`/src/app`) for a fullstack TypeScript setup.
- Backend will use Route Handlers under `/src/app/api/*` (REST-style endpoints) for simplicity and clarity.

## Database / Prisma
- Using Prisma ORM with SQLite for a lightweight local database.
- Prisma v7 is used. Runtime configuration is handled via `prisma.config.ts`
- SQLite access is configured through the Better SQLite3 adapter
- The database schema includes two models:
  - `User` and `Post` with a 1..N relationship..
- IDs are sourced from the provided JSON files (no auto-increment assumptions), so seeding can upsert by `id`.

## Migrations
- Prisma migrations are created via `prisma migrate dev` and committed under `/prisma/migrations` for reproducibility.

## Seeding (offline requirement)
- Seed data is read from local JSON files only (no external HTTP fetch):
  - `/seed-data/users.json`
  - `/seed-data/posts.json`
- Seeding is designed to be idempotent (running it multiple times should not create duplicates) using `upsert` by primary key (`id`).
- Users are seeded first, then posts, because posts depend on `userId` foreign keys.

## UX / unstable internet
- UI will always show explicit loading, empty and error states.
- Manual retry will be available for failed fetches.
- A simple client-side cache (localStorage) may be used to show the last successful result on refresh/offline.

## API
- Implemented REST endpoints using Next.js Route Handlers:
  - `GET /api/posts` (optional query param `userId` to filter by author)
  - `DELETE /api/posts/:id`
- Responses are JSON and include the post author (user `id` and `name`) to support the UI.
- Basic input validation is applied for `userId` and `id` (must be positive integers).


## UI (/posts)
- The `/posts` page fetches data from the backend (`GET /api/posts`).
- The UI is designed for unstable connections:
  - Clear loading state on first load.
  - Visible error state with a manual Retry action.
  - If data was loaded successfully at least once, the last successful list remains visible and an error banner is shown instead of a blank screen.
  - Explicit empty state when there are no posts.
- TailwindCSS is used to speed up implementation of cards and basic layout.


## Error handling (unstable internet)
- Posts listing:
  - Clear loading state on first load.
  - On fetch failure, a visible error message is shown with a Retry action.
  - The UI avoids blank screens whenever possible.
- Post deletion:
  - If delete fails, a visible error is shown.

## Client-side cache (low-effort resilience)
- To improve UX in unstable connections, the last successful posts result may be cached client-side (e.g., localStorage) and used as a fallback on refresh/offline scenarios.
- Cache is treated as a fallback only.

## Tooling / scripts
- Core scripts:
  - `npm run dev` (Next dev server)
  - `npm run build` / `npm run start` (production build/run)
  - `npm run db:migrate`, `npm run db:seed`, `npm run db:reset`
- TailwindCSS is used to speed up implementation of cards and modal UI.