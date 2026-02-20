# Posts Challenge (Next.js + Prisma + SQLite)

A full-stack technical challenge built with Next.js App Router and TypeScript.  
It implements a local posts dashboard (`/posts`) with filtering, resilient error states, and delete actions backed by Prisma v7 + SQLite (Better SQLite3 adapter).

## Requirements

- Node.js `20+` recommended.
- Tested locally with Node.js `v22.18.0`.
- npm.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Verify `.env` exists and contains:

```env
DATABASE_URL="file:./dev.db"
```

`.env` is committed intentionally for this challenge.

3. Run migrations:

```bash
npm run db:migrate
```

4. Seed the database (offline, local JSON only):

```bash
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

## Available Scripts

- `dev`: `next dev`
- `build`: `next build`
- `start`: `next start`
- `lint`: `eslint`
- `db:migrate`: `prisma migrate dev`
- `db:seed`: `prisma db seed`
- `db:reset`: `prisma migrate reset --force && prisma db seed`

## How To Use

1. Open `http://localhost:3000/posts`.
2. Filter by user using the **User ID** dropdown (server-side data is loaded once, filtering is instant on the client).
3. Delete a post by clicking delete on a card, then confirm in the modal.  
   On delete failure, the UI shows a visible error and allows retrying.

## API

### `GET /api/posts`
Returns all posts with author summary.

Example:

```bash
curl "http://localhost:3000/api/posts"
```

Response (200):

```json
{
  "posts": [
    {
      "id": 1,
      "userId": 1,
      "title": "Post title",
      "body": "Post body",
      "user": { "id": 1, "name": "Leanne Graham" }
    }
  ]
}
```

### `GET /api/posts?userId=<number>`
Returns posts filtered by `userId`.

Example:

```bash
curl "http://localhost:3000/api/posts?userId=1"
```

Error example (400):

```json
{ "error": "Invalid userId. It must be a positive integer." }
```

### `DELETE /api/posts/:id`
Deletes one post by id.

Example:

```bash
curl -X DELETE "http://localhost:3000/api/posts/1"
```

Success (200):

```json
{ "ok": true }
```

Not found (404):

```json
{ "error": "Post not found." }
```

## Troubleshooting

- Prisma v7 + SQLite uses the Better SQLite3 adapter (`@prisma/adapter-better-sqlite3` + `better-sqlite3`). Ensure dependencies install correctly on your OS.
- If seed fails, confirm `seed-data/users.json` and `seed-data/posts.json` exist.
- If seed fails, run `npx prisma generate`.
- If seed fails, run `npm run db:reset`.
