# Test report — 24 October 2026

## Environment

Windows, Node.js/npm, TypeScript, Vitest, Playwright Chromium. Workspace: `D:\Inventory _system`. Docker, `psql`, and a running local PostgreSQL service were not detected. The API tests use a mocked Prisma database boundary and do not prove database connectivity or migration correctness. No production services or URLs were available.

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

## Not executed or verified

- PostgreSQL migration, seed, persistence and integration tests: no local PostgreSQL or Docker available.
- Concurrent purchase behavior against a real PostgreSQL database: conditional update logic is tested with mocks only.
- End-to-end registration, purchase and admin management flows: require a real database and initial admin.
- Production deployment and live endpoint verification: Vercel, Render, Neon and GitHub accounts are not connected in this workspace.
- Inventory and admin screenshots with actual database data.

## Remaining issues

The initial red test run and an incremental red-green-refactor commit trail were not captured. `PROMPTS.md` contains the available raw master prompt; complete AI responses and other chat logs need the owner's export. External vehicle images may fail in restricted browsers; the login and hero artwork is local and renders correctly.
