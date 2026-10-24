# Atelier Motors — Incubyte Car Dealership Inventory

A full-stack vehicle inventory application built for the Incubyte TDD kata. Customers can register, browse and purchase vehicles. Administrators can maintain inventory and restock it. The API uses PostgreSQL through Prisma; a conditional database update prevents concurrent purchases from overselling.

## Features and architecture

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Web | React 19, TypeScript, Vite, Tailwind, React Router, React Hook Form, Zod | Authentication, searchable inventory, purchasing, admin workspace |
| API | Express 5, TypeScript, Zod, JWT, bcrypt, Pino | Validation, authorization, business rules, OpenAPI |
| Data | PostgreSQL 16, Prisma | Durable users and vehicles; atomic inventory updates |
| Tests | Vitest, Supertest, React Testing Library, Playwright | Rule, HTTP, UI and browser checks |

The repository uses npm workspaces: `apps/api`, `apps/web`, and `e2e`. The API reads environment variables; only the public API origin is passed to the web bundle. Prices use PostgreSQL `DECIMAL(12,2)` and are sent as decimal strings. Registered users receive the `USER` role. The seed script can create the first `ADMIN` from environment variables; the registration API never accepts a role.

The `User` table stores a unique lowercased email, bcrypt hash, role and timestamps. The `Vehicle` table stores a UUID, make, model, category, decimal price, nonnegative quantity and timestamps. Migration SQL adds checks for nonnegative price and quantity and indexes for search fields.

## Local setup

Prerequisites: Node.js 22+, npm, Docker Desktop with Compose, and a Chromium installation for Playwright browser tests. PostgreSQL can also be supplied externally via `DATABASE_URL`.

PowerShell:

```powershell
Copy-Item .env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
npm ci
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev:api
```

Open a second PowerShell terminal and run `npm run dev:web`. Browse to `http://localhost:5173`. API health is `http://localhost:4000/api/health`; Swagger UI is `http://localhost:4000/api/docs`. If port 5432 is already used, adjust the Compose mapping and `DATABASE_URL` together.

macOS/Linux:

```bash
cp .env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm ci
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev:api
```

Run `npm run dev:web` in a second terminal. Use unique, strong values for `JWT_SECRET` and any admin password outside local development. To create an initial admin, add `ADMIN_EMAIL` and `ADMIN_PASSWORD` (at least 12 characters) to `apps/api/.env`, then run `npm run db:seed`. Existing vehicle data is not deleted or replaced. In production, seeding additionally requires `ALLOW_PRODUCTION_SEED=true`; remove it afterward.

## API reference

All `/api/vehicles` routes require `Authorization: Bearer <JWT>`. Registration and login are public. Only `DELETE` and `restock` require `ADMIN`. JSON errors use `{ "error": { "message": "..." } }` and validation errors include `issues`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | `{name,email,password}`; creates `USER` |
| POST | `/api/auth/login` | `{email,password}`; returns JWT and user |
| POST | `/api/vehicles` | Create a vehicle |
| GET | `/api/vehicles` | Paginated list |
| GET | `/api/vehicles/search` | Search and filter |
| PUT | `/api/vehicles/:id` | Partial update |
| DELETE | `/api/vehicles/:id` | Admin delete |
| POST | `/api/vehicles/:id/purchase` | Decrement stock; `{quantity}` defaults to 1 |
| POST | `/api/vehicles/:id/restock` | Admin increment; `{quantity}` is required |

Search accepts `make`, `model`, `category`, `minPrice`, `maxPrice`, `page`, `limit` (1–100) and `sort` (`newest`, `priceAsc`, `priceDesc`, `make`). Text matching is case insensitive. Quantities must be positive integers for inventory actions. Purchase uses one atomic conditional update, returning 409 if stock is insufficient and 404 if the vehicle does not exist. Full request documentation is at `/api/docs` and `/api/openapi.json`.

## Quality checks

```text
npm run lint
npm run typecheck
npm run build
npm test
npm run coverage -w @inventory/api
npm run test:e2e
```

The browser suite expects the local PostgreSQL database to be running and migrated. The test report records what was actually run in this workspace. The current HTTP tests use mocked database operations; a real PostgreSQL integration run remains necessary before submission. Browser installation: `npx playwright install chromium`.

## Deployment

The application was deployed and checked on 24 October 2026:

| Component | URL |
| --- | --- |
| Web app (Vercel) | [incubyte-car-inventory.vercel.app](https://incubyte-car-inventory.vercel.app) |
| API (Render) | [incubyte-inventory-api.onrender.com](https://incubyte-inventory-api.onrender.com/api/health) |
| API docs | [Swagger UI](https://incubyte-inventory-api.onrender.com/api/docs/) |
| Source | [GitHub repository](https://github.com/sumitsagar1504/incubyte-car-inventory) |

The production database is a Neon PostgreSQL 16 project in Singapore. Migration `20261024000000_initial` was applied, and six demonstration vehicles plus the initial admin were seeded. The Render service uses the free plan, builds from `main`, installs development dependencies needed by TypeScript with `npm ci --include=dev`, and applies migrations during startup. Vercel builds the web app from the repository root with `VITE_API_BASE_URL` set to the Render origin. Render has `FRONTEND_URL` set to the Vercel origin for CORS. Production credentials are stored in host settings and ignored local environment files, never in Git.

The first Render build failed because `NODE_ENV=production` caused npm to omit TypeScript type packages. The corrected build command deployed successfully. Live registration, login, inventory, purchase, restock and admin authorization checks passed; temporary smoke data was removed. Chromium also verified the live inventory and admin pages. See [test-report.md](test-report.md) for evidence and limits. Render free instances may sleep after inactivity, so the first API request can take longer.

## Security and limitations

JWTs expire after the configured interval. The API validates requests, hashes passwords, applies auth rate limiting, restricts CORS to configured origins, redacts authorization headers from request logs, and hides internal errors from clients. The frontend stores JWTs in `localStorage`, which is convenient for this assignment but exposed to script injection; a production product should consider secure HTTP-only cookies and a reviewed CSRF strategy. Vehicle imagery and web fonts use external hosts and may be unavailable offline. Purchases model inventory reduction; payment and order records are outside this kata.

Troubleshooting: if the API fails at startup, confirm `apps/api/.env`, database availability, and a 32+ character `JWT_SECRET`. If migration fails, confirm the database credentials and SSL settings in Neon. If browser requests fail, check `VITE_API_BASE_URL` and `FRONTEND_URL` for exact origins. If Prisma Client is missing, run `npm exec -w @inventory/api prisma generate`.

## Screenshots

Browser captures: [login](screenshots/login.png) from the local smoke run, and [inventory](screenshots/inventory.png) and [admin](screenshots/admin.png) from the deployed site with the real Neon database.

## My AI Usage

OpenAI Codex assisted with repository setup, implementation, tests, documentation and debugging in this task. I checked its output using TypeScript, build, lint and test commands; `test-report.md` records the observed outcomes and gaps. The initial inventory rule tests were written before implementation, but their failing run was not captured; this is not presented as a complete red-green-refactor record. The owner should add their own honest reflection about how AI affected their workflow before submission. Available raw prompt evidence and the history limitation are in `PROMPTS.md`.
