# Test report — 24 October 2026

## Environment

Windows, Node.js/npm, TypeScript, Vitest, Playwright Chromium. Workspace: `D:\Inventory _system`. Docker, `psql`, and a running local PostgreSQL service were not detected. The unit and HTTP tests use a mocked Prisma database boundary. A Neon PostgreSQL 16 production database and live deployed services were subsequently used for manual smoke verification.

## Commands and observed results

| Command | Result |
| --- | --- |
| `npm install --cache .npm-cache` | Completed. npm reported 10 total dependency advisories after the final install. |
| `npm run lint` | Passed after adding TypeScript ESLint configuration. |
| `npm run typecheck` | Passed for API and web. |
| `npm run build -w @inventory/api` | Passed; Prisma Client generated and TypeScript compiled. |
| `npm run build -w @inventory/web` | Passed; Vite produced `apps/web/dist`. |
| `npm run coverage -w @inventory/api` | 21 backend tests passed in 2 files; overall statements/lines **83.56%**, branches **76.47%**, functions **69.23%**. API module coverage is mocked at the database boundary. |
| `npm run test -w @inventory/web` | 2 React Testing Library tests passed. One earlier run failed due to missing test cleanup; fixed and rerun. |
| `npx playwright test --config=playwright.smoke.config.ts --reporter=list` | 1 browser smoke test passed after Chromium installation, using a separately running Vite server. It verified registration and login page navigation and captured `screenshots/login.png`. |

The first Playwright attempt failed because Chromium was not installed. A later run with the default multi-server configuration captured a screenshot but did not exit cleanly on Windows; it was interrupted. The separate-server smoke run exited successfully. This smoke test does not exercise the database or authenticated workflows.

## Coverage detail

The 83.56% overall backend statement result includes application files, the unexecuted seed script, and server startup. Auth module statements: 94%. Vehicle module statements: 94.2%. The pure inventory rule module: 100%. These percentages are from actual Vitest v8 execution and are not PostgreSQL integration coverage.

## Security audit

`npm audit --omit=dev --json --cache .npm-cache` reported three high findings through the Prisma CLI / `@prisma/config` / `deepmerge-ts` dependency chain, with a suggested Prisma 7.10.1 major upgrade. No critical finding appeared in that production audit output. The broader install summary reported 10 findings (5 moderate, 3 high, 2 critical). Dependency upgrades and retesting remain necessary before a production launch. No automatic breaking major upgrade was applied.

## Production deployment and live checks

On 24 October 2026, the repository was pushed to GitHub. Neon migration `20261024000000_initial` applied successfully and the seed created six vehicles plus one admin. The Vercel production URL returned HTTP 200 for `/` and `/login`; its JavaScript bundle contained the Render API origin. The Render API returned HTTP 200 for `/api/health`, `/api/docs/`, and `/api/openapi.json`.

A live API smoke run against Neon verified registration with the `USER` role, user and admin login, authenticated inventory listing (six seed vehicles), make search, temporary vehicle creation, purchase reducing quantity from two to one, admin restock to two, rejection of user restock with HTTP 403, and admin deletion of the temporary vehicle. Two temporary registration accounts were deleted from the database after the runs. A Chromium run then signed in as admin through the public Vercel URL, observed six inventory cards and six admin rows, and captured `screenshots/inventory.png` and `screenshots/admin.png`.

The first Render build and an automatic retry failed because `NODE_ENV=production` omitted TypeScript type packages during `npm ci`. Updating the build command to `npm ci --include=dev && npm run build -w @inventory/api` resolved it; deployment `dep-dbe6kk4s728c73b60mk0` succeeded.

## Not executed or verified

- A concurrent purchase race against real PostgreSQL; the conditional update is covered by mocked tests and one live purchase.
- Persistence after a Render service restart.
- A full user browser purchase flow; purchase and authorization were verified at the live API, while inventory and admin rendering were verified in Chromium.

## Remaining issues

On 25 October 2026, the six seed-vehicle cards were changed from make-only external URLs to bundled photos matched by exact make and model. Each image was checked visually against its Wikimedia Commons file page, and attribution was added at `/photo-credits.html`. The web build passed. The live Vercel deployment returned HTTP 200 for all six image assets and the credits page, and Chromium confirmed that every card loaded the matching local path and photo.

The initial red test run and an incremental red-green-refactor commit trail were not captured. `PROMPTS.md` contains the available raw master prompt; complete AI responses and other chat logs need the owner's export.
## Customer experience upgrade — 25 October 2026

The public inventory, model-specific galleries, favorites and comparison, reservation and cancellation flow, responsive filters, admin workspace, and optional account email flows were implemented. The additive Neon migration was applied. The existing admin account was moved to the user's chosen Gmail +incubyte-admin alias.

Verification completed:
- API tests: 28 passed.
- Web tests: 3 passed.
- Chromium end-to-end tests: 2 passed (guest browsing/gallery/favorites and mobile filters).
- Lint, TypeScript checks, and production build passed.
- A temporary customer account reserved and cancelled a vehicle against Neon; the one-unit hold and stock restoration were verified, and test records were removed.
- Local Chromium admin sign-in and six-vehicle inventory were visually inspected.

Password reset and email verification endpoints are implemented but outbound email remains unavailable until RESEND_API_KEY and EMAIL_FROM are configured in Render.
