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

- **Node.js 22** (≥ 22.22, < 23). `npm install` refuses other versions (`engine-strict`).
  Check with `node -v`. The project does not require a version manager: install Node 22 from
  [nodejs.org](https://nodejs.org/), or, if you already use one (nvm, fnm, Volta…),
  select the version written in `.nvmrc`.
- Docker with Docker Compose (for PostgreSQL 17, and for the integration tests).

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
After changing an entity, apply the existing migrations (`npm run db:migrate`), generate the new one,
then register it in `backend/src/db/migrations/index.ts`:

```sh
npm run migration:generate -w backend -- src/db/migrations/<Name>
```

TypeORM compares the entities with the database it is connected to. If nothing changed, it writes no file
and exits with code 1 ("No changes in database schema were found"). On an empty database, it generates the
whole schema again: always run it on a database that is up to date.

## Limits

- `GET /api/health` only says that the API process answers. It does not check the database.
- All labs, models, benchmarks and scores come from the demo seed and are fictional
  (`backend/src/db/seed/demo-data.ts`, described at `/demo-source.html`). No real source is imported yet.
- Benchmark scores must be finite percentages between 0 and 100. This is checked in the application
  (`backend/src/catalog/percentage.ts`) before the seed writes anything, **not** by PostgreSQL:
  the `scores.value` column (`NUMERIC(5,2)`) has no `CHECK` constraint yet, and values with more than
  two decimals are rounded by the column.
- Aggregated scores and ranks stay empty until the ranking computation exists: the pages show
  "Not ranked" and "No votes yet".
