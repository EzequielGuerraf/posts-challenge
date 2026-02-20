# Assumptions

## Framework / routing
- Using Next.js App Router (`/src/app`) for a fullstack TypeScript setup.
- Backend will use Route Handlers under `/src/app/api/*` (REST-style endpoints) for simplicity and clarity.

## Database / Prisma
- Using Prisma ORM with SQLite for a lightweight local database.
- Prisma v7 is used. Runtime configuration is handled via `prisma.config.ts`

## Seeding (offline requirement)
- Seed data will be read from local JSON files only:
  - `/seed-data/users.json`
  - `/seed-data/posts.json`
- No external HTTP fetch is used for seeding.

## UX / unstable internet
- UI will always show explicit loading, empty and error states.
- Manual retry will be available for failed fetches.
- A simple client-side cache (localStorage) may be used to show the last successful result on refresh/offline.