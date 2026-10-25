# Atelier Motors — Incubyte Car Dealership Inventory

A full-stack vehicle inventory application built for the Incubyte TDD kata. Guests can browse, filter, save and compare vehicles. Customers can create accounts and reserve vehicles; cancelling a reservation returns the held unit to stock. Administrators can maintain inventory, restock it and review reservations. PostgreSQL and conditional updates prevent overselling.

## Features and architecture

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Web | React 19, TypeScript, Vite, React Router | Public inventory, model photo galleries, reservations, favorites, comparison, admin workspace |
| API | Express 5, TypeScript, Zod, JWT, bcrypt, Pino | Validation, authorization, business rules, OpenAPI |
| Data | PostgreSQL 16, Prisma | Users, vehicles, reservations and one-use account tokens; atomic stock updates |
| Tests | Vitest, Supertest, React Testing Library, Playwright | Rule, HTTP, UI and browser checks |

The repository uses npm workspaces: `apps/api`, `apps/web`, and `e2e`. The API reads environment variables; only the public API origin is passed to the web bundle. Prices use PostgreSQL `DECIMAL(12,2)` and are sent as decimal strings. Registered users receive the `USER` role. The seed script can create the first `ADMIN` from environment variables; the registration API never accepts a role.

The `User` table stores unique lowercased emails, bcrypt hashes, roles, verification state and session versions. `Vehicle` records include price, stock, optional specifications and model-specific photos. `Reservation` records preserve the listed price and status. One-use, hashed tokens support password reset and email verification once an email sender is configured.

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

Public routes: `GET /api/vehicles`, `GET /api/vehicles/search`, and `GET /api/vehicles/:id`. Search supports `make`, `model`, `category`, `minPrice`, `maxPrice`, `inStock=true`, `page`, `limit` (1–100), and `sort` (`newest`, `priceAsc`, `priceDesc`, `make`). Text matching is case insensitive.

`POST /api/auth/register` and `POST /api/auth/login` create and authenticate customers. `GET /api/auth/me` returns the signed-in account. Account recovery uses `POST /api/auth/password-reset/request` and `/confirm`; email verification uses `POST /api/auth/verify/request` and `/confirm`. `GET /api/auth/capabilities` reports whether email delivery is configured. Without a sender, recovery requests return 503 and the web app explains that email recovery is unavailable. Existing users are marked verified during migration.

Authenticated users can create a one-unit hold with `POST /api/reservations`, list their holds with `GET /api/reservations`, inspect one with `GET /api/reservations/:id`, and cancel it with `POST /api/reservations/:id/cancel`. Both reservation and cancellation use database transactions and conditional stock updates. Admins can review the most recent 100 holds at `GET /api/reservations/admin`.

Authenticated users can create or update inventory with `POST /api/vehicles` and `PUT /api/vehicles/:id`. Admin-only endpoints are `DELETE /api/vehicles/:id` and `POST /api/vehicles/:id/restock`. The original kata's `POST /api/vehicles/:id/purchase` remains available for API compatibility; the customer interface uses reservations. API details are at `/api/docs` and `/api/openapi.json`. JSON errors use `{ "error": { "message": "..." } }`.

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

The initial application was deployed on 24 October 2026. The customer experience upgrade was prepared on 25 October 2026:

| Component | URL |
| --- | --- |
| Web app (Vercel) | [incubyte-car-inventory.vercel.app](https://incubyte-car-inventory.vercel.app) |
| API (Render) | [incubyte-inventory-api.onrender.com](https://incubyte-inventory-api.onrender.com/api/health) |
| API docs | [Swagger UI](https://incubyte-inventory-api.onrender.com/api/docs/) |
| Source | [GitHub repository](https://github.com/sumitsagar1504/incubyte-car-inventory) |

The production database is a Neon PostgreSQL 16 project in Singapore. Migrations `20261024000000_initial` and `20261025000000_customer_experience` were applied. Six demonstration vehicles and the initial admin were seeded. The Render service uses the free plan, builds from `main`, installs development dependencies needed by TypeScript with `npm ci --include=dev`, and applies migrations during startup. Vercel builds the web app from the repository root with `VITE_API_BASE_URL` set to the Render origin. Render has `FRONTEND_URL` set to the Vercel origin for CORS. Production credentials are stored in host settings and ignored local environment files, never in Git.

The first Render build failed because `NODE_ENV=production` caused npm to omit TypeScript type packages. The corrected build command deployed successfully. Live registration, login, inventory, purchase, restock and admin authorization checks passed; temporary smoke data was removed. Chromium also verified the live inventory and admin pages. See [test-report.md](test-report.md) for evidence and limits. Render free instances may sleep after inactivity, so the first API request can take longer.

## Security and limitations

To enable recovery and verification emails, configure `RESEND_API_KEY` and a verified `EMAIL_FROM` address in the Render service, then redeploy. The sender uses Resend's email API. Do not commit these values. The existing admin email is `sumitsagar1542005+incubyte-admin@gmail.com`; the personal address is available for a customer account. The admin password stays in the existing secret and cannot be displayed in plain text.

JWTs expire after the configured interval. The API validates requests, hashes passwords, applies auth rate limiting, restricts CORS to configured origins, redacts authorization headers from request logs, and hides internal errors from clients. The frontend stores JWTs in `localStorage`, which is convenient for this assignment but exposed to script injection; a production product should consider secure HTTP-only cookies and a reviewed CSRF strategy. The six seeded models use bundled, model-specific vehicle photos with [source and license credits](apps/web/public/photo-credits.html); other models show a neutral icon. Web fonts use external hosts and may be unavailable offline. Reservations hold stock without taking payment. They require dealership follow-up; payment and fulfillment are outside this kata.

Troubleshooting: if the API fails at startup, confirm `apps/api/.env`, database availability, and a 32+ character `JWT_SECRET`. If migration fails, confirm the database credentials and SSL settings in Neon. If browser requests fail, check `VITE_API_BASE_URL` and `FRONTEND_URL` for exact origins. If Prisma Client is missing, run `npm exec -w @inventory/api prisma generate`.

## Screenshots

Browser captures: [login](screenshots/login.png) from the local smoke run, and [inventory](screenshots/inventory.png) and [admin](screenshots/admin.png) from the deployed site with the real Neon database.

## My AI Usage

OpenAI Codex assisted with repository setup, implementation, tests, documentation and debugging in this task. I checked its output using TypeScript, build, lint and test commands; `test-report.md` records the observed outcomes and gaps. The initial inventory rule tests were written before implementation, but their failing run was not captured; this is not presented as a complete red-green-refactor record. The owner should add their own honest reflection about how AI affected their workflow before submission. Available raw prompt evidence and the history limitation are in `PROMPTS.md`.
