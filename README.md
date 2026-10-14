# AI Models Comparator

Software Engineering Project — ESILV A4 (2026-2027).
Made by Vivien GRUEL, Noé WALES, Valentin GEMPP and Maxence TESSIER.

Web application that compares AI models with two rankings: benchmarks and community votes.
Specifications: `docs/BRD`, `docs/SRS`, `docs/SDD`.

## Status

Implemented: model catalogue (`/models`) and model pages (`/models/:slug`), with fictional demo data.
Not implemented yet: rankings computation, accounts, votes, comments, news, administration, imports.

## Stack

npm workspaces, all in TypeScript:

- `backend/` — Node.js + Express 5, TypeORM + PostgreSQL
  (`GET /api/health`, `GET /api/labs`, `GET /api/models/:slug`)
- `frontend/` — React + Vite + React Router + Tailwind CSS
- `shared/` — types shared by the backend and the frontend (no runtime code)

## Requirements

- **Node.js 22** (≥ 22.22, see `.nvmrc`). `npm install` refuses other versions (`engine-strict`).
  With nvm: `nvm install && nvm use`.
- Docker with Docker Compose (for PostgreSQL 17).

## Setup

```sh
cp .env.example .env   # then change POSTGRES_PASSWORD
npm install
```

## Run

```sh
npm run db:up          # starts PostgreSQL 17 and waits until it is healthy
npm run db:migrate     # applies the TypeORM migrations
npm run db:seed        # fictional demo data; safe to run again (no duplicates)
npm run dev:backend    # API on http://localhost:3000 (API_PORT)
npm run dev:frontend   # http://localhost:5173, /api is proxied to the API
```

`npm run db:stop` stops the database. Data is kept in the `pgdata` Docker volume.

## Checks

```sh
npm run typecheck
npm run lint
npm run format:check
npm test               # unit and component tests
npm run test:integration   # API + migrations + seed on a throwaway PostgreSQL container (needs Docker)
npm run build
npm run check          # all of the above except the integration tests
```

## Database changes

The schema only changes through TypeORM migrations (`synchronize` is disabled).
After changing an entity, generate a migration against an up-to-date database, then register it in
`backend/src/db/migrations/index.ts`:

```sh
npm run migration:generate -w backend -- src/db/migrations/<Name>
```

## Limits

- `GET /api/health` only says that the API process answers. It does not check the database.
- All labs, models, benchmarks and scores come from the demo seed and are fictional
  (`backend/src/db/seed/demo-data.ts`, described at `/demo-source.html`). No real source is imported yet.
- Aggregated scores and ranks stay empty until the ranking computation exists: the pages show
  "Not ranked" and "No votes yet".
