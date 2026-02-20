# Assumptions

## Framework / routing
- Using Next.js App Router (`/src/app`) for a fullstack TypeScript setup.
- Backend will use Route Handlers under `/src/app/api/*` (REST-style endpoints) for simplicity and clarity.

## Database / Prisma
- Using Prisma ORM with SQLite for a lightweight local database.
- Prisma v7 is used. Runtime configuration is handled via `prisma.config.ts`
- The database schema includes two models:
  - `User` and `Post` with a 1..N relationship (`User.posts`, `Post.userId -> User.id`).
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