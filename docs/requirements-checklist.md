# Assignment requirements checklist

Source: Incubyte assignment PDF supplied with this task. The pasted user request adds more detailed implementation, QA, and deployment targets.

## API and database

- [x] Node.js, TypeScript, Express REST API and persistent PostgreSQL schema via Prisma.
- [x] Register, login and JWT protected endpoints.
- [x] Create, list, search, update and admin delete vehicles.
- [x] Purchase and admin restock with atomic conditional stock decrement.
- [x] Vehicle ID, make, model, category, decimal price, quantity.
- [x] Migration and local PostgreSQL Compose configuration.
- [ ] Verify migration and API against a running PostgreSQL instance.

## Frontend

- [x] React, HTML5, CSS3 and Tailwind single page application.
- [x] Login, registration, inventory dashboard, search/filter, purchase and admin management.
- [x] Zero-stock purchase control disabled.
- [x] Responsive layout.
- [ ] Capture inventory and admin screenshots against live data.

## Process and deliverables

- [x] Backend and frontend tests written and executed; initial inventory tests were authored before implementation, but the red execution was not captured. Measured backend statement coverage is 83.56% using mocked database operations.
- [ ] Complete red-green-refactor commit history; the history cannot be reconstructed truthfully.
- [x] Playwright login/registration navigation smoke test and actual login screenshot.
- [ ] Full PostgreSQL integration and end-to-end purchase/admin execution.
- [x] README with local setup and My AI Usage section.
- [x] PROMPTS.md with available raw prompt and disclosed history limitation.
- [x] Test report with actual observed results.
- [ ] Public Git repository and verified deployment; external account access is unavailable in this workspace.
