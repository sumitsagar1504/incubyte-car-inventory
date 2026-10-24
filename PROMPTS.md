# MASTER PROMPT: Build, Test, and Deploy the Incubyte Car Dealership Inventory System

Act as a senior full-stack engineer, software architect, UI/UX designer, QA engineer, DevOps engineer, and Test-Driven Development (TDD) practitioner.

Your task is to build a complete, professional, secure, tested, and deployed Car Dealership Inventory System that satisfies every requirement in the Incubyte assignment PDF.

**Do not stop at generating code. Inspect the workspace, implement the complete application, run the tests, fix errors, prepare deployment configurations, deploy wherever authorized and possible, verify the live application, and document everything.**

Do not ask me to manually implement functionality that you can implement yourself. Make reasonable engineering decisions independently and explain only genuine blockers that require my input.

---

## 1. Technology Stack

Use the following stack:

**Frontend**
- React with TypeScript.
- Vite.
- HTML5 and CSS3.
- Tailwind CSS.
- React Router.
- React Hook Form and Zod for form validation.
- A suitable icon library.
- Vitest and React Testing Library.

**Backend**
- Node.js and TypeScript.
- Express.js.
- RESTful API architecture.
- Prisma ORM.
- PostgreSQL.
- JWT authentication.
- bcrypt password hashing.
- Zod request validation.
- Swagger/OpenAPI documentation.
- Vitest and Supertest.

**End-to-end testing**
- Playwright.

**Deployment**
- Frontend: Vercel.
- Backend: Render.
- Database: Neon PostgreSQL.

**Development and quality**
- Git and GitHub.
- Docker Compose for local PostgreSQL.
- ESLint and Prettier.
- TypeScript strict mode.
- Environment variables for configuration and secrets.

Choose stable, compatible dependency versions and avoid unnecessary packages.

---

## 2. Inspect the Assignment and Repository

Before writing code:

1. Inspect all existing project files and the Git working tree.
2. Read the provided Incubyte assignment PDF.
3. Extract every mandatory requirement into a checklist.
4. Preserve useful existing code and never overwrite unrelated user work.
5. Identify missing functionality and create an implementation plan.
6. Initialize a clean project structure if the repository is empty.
7. Work through the checklist until every feasible requirement is implemented and verified.

Use this structure unless the existing project justifies a better alternative:

```text
car-dealership-inventory/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── middleware/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── vehicles/
│   │   │   │   └── inventory/
│   │   │   ├── utils/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   └── tests/
│   └── web/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── services/
│       │   ├── context/
│       │   ├── types/
│       │   └── App.tsx
│       └── tests/
├── docs/
├── screenshots/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── PROMPTS.md
├── test-report.md
└── vercel.json
```

Keep frontend, backend, database access, validation, business logic, and tests organized and maintainable.

---

## 3. Backend API — Implement Every Required Endpoint

### Authentication

Implement:

- `POST /api/auth/register`
- `POST /api/auth/login`

Requirements:

- Registration with name, email, and password.
- Validate and normalize email addresses.
- Validate password requirements.
- Reject duplicate email addresses.
- Hash passwords using bcrypt.
- Never store plaintext passwords.
- Never return password hashes.
- Issue signed JWTs after successful login.
- Configure token expiration.
- Verify tokens on protected endpoints.
- Return consistent JSON errors and correct HTTP status codes.
- Never expose secrets or stack traces in production responses.

### Vehicle management

Implement:

- `POST /api/vehicles` — Add a vehicle.
- `GET /api/vehicles` — List vehicles available in inventory.
- `GET /api/vehicles/search` — Search and filter vehicles.
- `PUT /api/vehicles/:id` — Update a vehicle.
- `DELETE /api/vehicles/:id` — Delete a vehicle, admin only.

Every vehicle must have:

- Unique ID.
- Make.
- Model.
- Category.
- Price.
- Quantity in stock.

Search must support:

- Make.
- Model.
- Category.
- Minimum price.
- Maximum price.

Implement case-insensitive text matching where appropriate, validation of price ranges, pagination, sorting, and clear error responses.

### Inventory management

Implement:

- `POST /api/vehicles/:id/purchase`
- `POST /api/vehicles/:id/restock`

The purchase endpoint must decrease stock. The restock endpoint must increase stock and be admin-only.

Requirements:

1. Stock must never become negative.
2. Purchases from out-of-stock vehicles must fail.
3. Purchases exceeding available inventory must fail.
4. Quantities must be positive integers.
5. Restocking must validate the quantity.
6. Concurrent purchases must not oversell inventory.
7. Use PostgreSQL transactions or atomic conditional updates.
8. Return the updated inventory after successful operations.
9. Return appropriate errors for missing vehicles and insufficient stock.
10. Document the request format and whether the quantity defaults to one.

Use appropriate HTTP status codes, including 400, 401, 403, 404, and 409 as applicable.

### Roles and authorization

Implement:

- `USER`
- `ADMIN`

All newly registered users must default to `USER`.

Only administrators can delete vehicles or restock inventory.

Enforce authorization on the backend. Never trust a role supplied by the client.

Provide a safe way to create an initial admin using controlled environment variables or a documented setup procedure. Never hardcode production credentials.

### Additional backend requirements

- `GET /api/health` health-check endpoint.
- Prisma migrations.
- Database indexes and constraints.
- Decimal-safe monetary storage.
- Centralized error handling.
- Structured logging.
- Authentication rate limiting.
- Secure CORS configuration.
- Environment-based configuration.
- Swagger/OpenAPI documentation.
- Clear separation of controllers, services, validation, and database access.

Write meaningful, maintainable code following SOLID principles without unnecessary architectural complexity.

---

## 4. Database

Use PostgreSQL as the persistent database through Prisma ORM.

Create a proper schema with:

- User model.
- Vehicle model.
- Role representation.
- Appropriate timestamps.
- Unique constraints and indexes.
- Decimal-compatible price storage.

Use migrations to reproduce the schema.

Requirements:

- The production application must use the hosted PostgreSQL database.
- The local development environment must use a persistent database.
- The application must not rely on an in-memory database.
- Database errors must be handled gracefully.
- Seed realistic demonstration vehicles.
- Keep test data separate from production data.
- Never run destructive seed operations against production by default.

Create `docker-compose.yml` for local PostgreSQL and provide clear migration and seeding commands.

---

## 5. Test-Driven Development — Strict Requirement

**Follow Red-Green-Refactor. Write tests before implementing each meaningful feature.**

For each feature:

1. Write the failing test.
2. Execute it and verify the expected failure.
3. Implement the minimum code required.
4. Run the test and verify it passes.
5. Refactor without breaking existing tests.
6. Add regression tests for discovered bugs.
7. Repeat for the next feature.

Do not implement the entire application first and add superficial tests afterward.

### Backend tests

Test authentication:

- Registration success.
- Invalid email.
- Invalid password.
- Duplicate registration.
- Password hashing.
- Successful login.
- Incorrect credentials.
- Missing, invalid, and expired JWTs.
- Authorization failures.

Test vehicles:

- Create.
- List.
- Search by make.
- Search by model.
- Search by category.
- Filter by price range.
- Reject invalid price ranges.
- Update.
- Handle nonexistent IDs.
- Prevent unauthorized deletion.
- Allow authorized admin deletion.

Test inventory:

- Purchase one vehicle.
- Purchase multiple units.
- Reject zero-stock purchases.
- Reject insufficient-stock purchases.
- Prevent negative inventory.
- Restock successfully as admin.
- Reject restocking as a normal user.
- Reject invalid quantities.
- Handle concurrent purchases without overselling.

### Frontend tests

Test:

- Registration and login validation.
- Authentication persistence.
- Logout.
- Vehicle listings.
- Search and filters.
- Loading, empty, and error states.
- Disabled purchase button when stock is zero.
- Purchase confirmation and errors.
- Admin-only UI.
- Add, update, delete, and restock workflows.
- Responsive layouts and accessible form controls.

### End-to-end tests

Use Playwright to cover:

1. Registration and login.
2. Viewing and searching inventory.
3. Purchasing a vehicle.
4. Inventory updates after purchase.
5. Admin vehicle management.
6. Admin restocking.
7. Authorization failures.

Use a real PostgreSQL test database for integration tests.

Aim for at least 80% meaningful backend business-logic coverage. Generate coverage reports from actual execution.

Never claim a test passed if it was not run.

---

## 6. Frontend — Premium Dealership Experience

Build a modern, polished, responsive single-page application.

The website should feel like a premium automotive dealership, with a clean visual hierarchy and a professional interface suitable for an engineering assignment demonstration.

### Visual design

Use:

- Sophisticated neutral colors.
- A restrained accent color.
- Clear typography.
- Spacious layouts.
- High-quality vehicle imagery.
- Consistent spacing and components.
- Responsive grids.
- Subtle transitions.
- Accessible contrast.
- Keyboard navigation and visible focus states.
- Professional icons rather than emoji-based UI elements.

Avoid a generic admin-template appearance, excessive gradients, unnecessary animations, and clutter.

### Required pages

**A. Login and registration**

- Login page.
- Registration page.
- Form validation.
- Loading indicators.
- Inline errors.
- Success notifications.
- Protected routes.
- Persistent authentication across refreshes.

**B. Dealership dashboard**

- Attractive navigation.
- Inventory overview.
- Vehicle cards.
- Make, model, category, price, and stock information.
- Search and filters.
- Price-range controls.
- Sorting.
- Pagination.
- Loading, empty, and error states.
- Responsive layout.

**C. Purchase functionality**

- Purchase button for each vehicle.
- Disabled button for zero stock.
- Prevention of duplicate submissions.
- Clear success/error notifications.
- Automatic stock refresh after purchasing.

**D. Admin dashboard**

- Inventory overview.
- Add vehicle form.
- Edit vehicle form.
- Delete with confirmation.
- Restock form.
- Validation and error handling.
- Immediate UI updates after successful operations.

Hide privileged controls from normal users, but always enforce authorization on the backend too.

### Frontend engineering

- Create reusable TypeScript components.
- Create a dedicated API client.
- Centralize API errors.
- Use environment variables for API URLs.
- Manage authentication and user roles consistently.
- Handle expired tokens and unauthorized responses.
- Never hardcode the entire inventory as fake frontend data.
- Connect all CRUD, search, purchase, and restock operations to the actual backend.
- Ensure all buttons, forms, and navigation elements work.

---

## 7. Deployment — Actually Deploy the Application

**Deployment is a required part of this task. Prepare the configuration, deploy the services when authorized, and verify the actual live application. Do not stop at writing deployment instructions.**

Use the following deployment architecture.

### Frontend: Vercel

Deploy the React + Vite application to Vercel.

Website: https://vercel.com/

Requirements:

- Configure the correct frontend root directory.
- Configure the production build command.
- Configure the output directory.
- Configure SPA routing rewrites where necessary.
- Set the production API URL using `VITE_API_BASE_URL`.
- Ensure frontend requests reach the deployed backend.
- Verify that direct navigation and refreshing application routes work.
- Verify the production build succeeds.

### Backend: Render

Deploy the Node.js + Express API to Render.

Website: https://render.com/

Requirements:

- Configure the backend service root directory.
- Configure install, build, and start commands.
- Ensure TypeScript is compiled correctly for production.
- Configure the production port.
- Configure production environment variables.
- Set the hosted PostgreSQL connection string.
- Configure the frontend origin in the CORS allowlist.
- Apply database migrations through a controlled release or deployment step.
- Configure the health-check path as `/api/health`.
- Verify all required API endpoints against the live service.

Account for the possibility that free or low-cost instances may sleep, restart, or have usage limits. Do not promise uninterrupted availability without verifying the selected plan.

### Database: Neon PostgreSQL

Create or configure a Neon PostgreSQL database.

Website: https://neon.tech/

Requirements:

- Obtain the actual database connection string through authorized setup.
- Configure it securely in Render.
- Configure any required Prisma connection settings.
- Apply production migrations.
- Seed demonstration data safely.
- Verify persistence after application restarts.
- Never commit the connection string.
- Never use the production database for automated tests.

### Deployment environment variables

Provide `.env.example` with placeholders for relevant values, such as:

```text
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
FRONTEND_URL=
VITE_API_BASE_URL=
ADMIN_EMAIL=
ADMIN_PASSWORD=
NODE_ENV=
```

Adapt the variable names to the actual implementation.

Use different environment variables for frontend and backend as appropriate. Never expose server secrets through `VITE_` variables or bundle them into the frontend.

Generate strong production secrets securely and configure them only through authorized hosting dashboards or secret-management mechanisms.

### Deployment execution

1. Inspect whether a GitHub repository already exists.
2. If authorized and connected, create or use a GitHub repository and push the completed code.
3. Configure the Neon database.
4. Configure the Render backend.
5. Configure the Vercel frontend.
6. Configure environment variables.
7. Run production migrations.
8. Seed safe demonstration data if required.
9. Verify health checks.
10. Verify registration, login, vehicle listing, search, purchasing, and admin operations against production.
11. Verify frontend-to-backend communication.
12. Fix any deployment-related issues.
13. Update the README with the actual deployment details.

**Do not invent URLs or claim services are deployed when they are not.**

If an account, credential, GitHub connection, billing decision, authorization, or manual dashboard action is required, complete all other feasible steps and tell me exactly what action is needed. Never ask me to share passwords or secret keys in chat.

If automatic deployment is unavailable, prepare deployment-ready configuration and give me precise, step-by-step instructions to finish deployment. Continue with local testing and implementation rather than abandoning the task.

### Final deployment deliverables

The completed project should provide:

- Live frontend URL.
- Live backend API URL.
- Live Swagger documentation URL.
- Health-check URL.
- GitHub repository URL, if actually created.
- Database migration instructions.
- Deployment configuration and troubleshooting instructions.

Use the real URLs only after successful deployment and verification.

---

## 8. Git and Version Control

Use Git with meaningful, incremental commits that reflect the real development process.

Before modifying Git state:

- Inspect the branch and working tree.
- Preserve existing user changes.
- Never discard unrelated changes.
- Do not rewrite or fabricate historical commits.

For AI-assisted commits, use a truthful co-author trailer in the commit message. For example:

```text
feat: implement vehicle search

Added validated filters for make, model, category, and price.
Added integration tests with AI assistance.

Co-authored-by: OpenAI Codex <codex@users.noreply.github.com>
```

Use the accurate co-author identity and email for the AI tool actually used.

If author configuration is missing, explain the issue and ask before changing global Git configuration.

Do not claim commits were created if they were not. If commit creation is unavailable or unauthorized, prepare appropriate commit messages for me.

---

## 9. README.md — Mandatory Deliverable

Create a detailed root-level `README.md` containing:

1. Project overview.
2. Problem statement and objectives.
3. Feature list.
4. Technology stack.
5. Architecture explanation.
6. Database schema.
7. API endpoint reference.
8. Authentication and authorization.
9. Screenshots of the actual application.
10. Local prerequisites.
11. Environment configuration.
12. PostgreSQL and Docker setup.
13. Database migration and seeding commands.
14. Backend setup and execution.
15. Frontend setup and execution.
16. Unit and integration testing.
17. End-to-end testing.
18. Coverage reporting.
19. Swagger documentation.
20. Security considerations.
21. Troubleshooting.
22. Deployment architecture.
23. Actual production URLs, if deployed.
24. Known limitations and future improvements.
25. A section titled exactly **My AI Usage**.

In My AI Usage, describe the AI tools actually used, the tasks they assisted with, how outputs were verified, and their impact on the development workflow.

Do not fabricate personal reflections. Clearly mark any personal reflection I need to complete myself.

Ensure all instructions and commands match the final project.

---

## 10. PROMPTS.md — Mandatory AI Usage Evidence

Create a root-level `PROMPTS.md`.

The assignment requires raw, unedited AI chat logs or public chat links, not AI-generated summaries.

Requirements:

- Preserve complete original prompts and responses whenever they are genuinely available.
- Include actual conversation links when available.
- Clearly label excerpts and incomplete logs.
- Do not fabricate conversations, responses, timestamps, or public URLs.
- Do not claim that this master prompt represents every AI interaction.
- If Codex cannot retrieve complete chat history, document the limitation and tell me precisely what actual logs or links I must add manually.

Keep the contents transparent and compliant with the assignment.

---

## 11. test-report.md — Mandatory Test Evidence

Create a root-level `test-report.md` containing:

- Environment details.
- Database configuration.
- Test commands.
- Unit test results.
- Integration test results.
- Frontend test results.
- End-to-end test results.
- Coverage percentages.
- Build and type-check results.
- Failures encountered and resolutions.
- Tests not executed.
- Deployment verification results.
- Remaining issues.

Generate the report from actual command output. Clearly distinguish local results from production verification.

Never fabricate test results or coverage percentages.

---

## 12. Additional Developer Experience

Provide:

- Root-level package scripts.
- Separate frontend and backend scripts.
- Docker Compose configuration.
- Database migrations.
- Seed data.
- `.env.example`.
- `.gitignore`.
- Production build commands.
- Lint and type-check commands.
- Test and coverage commands.
- Playwright configuration.
- Deployment configuration.
- Windows PowerShell setup instructions.
- macOS/Linux setup instructions.

Ensure a new developer can clone the repository and run the application by following the README.

---

## 13. Final Quality Assurance

Before declaring completion:

1. Install dependencies.
2. Start PostgreSQL.
3. Apply migrations.
4. Seed local demonstration data.
5. Run linting.
6. Run TypeScript checks.
7. Build frontend and backend.
8. Run unit tests.
9. Run integration tests.
10. Run end-to-end tests when supported.
11. Fix failures and rerun relevant checks.
12. Start the application and verify core workflows.
13. Capture genuine screenshots of the finished application.
14. Generate the test report.
15. Verify README and PROMPTS.md.
16. Review Git diffs for unrelated changes and secrets.
17. Deploy the application where authorized.
18. Test the live frontend and API.
19. Verify database persistence and production authentication.
20. Update documentation with verified deployment results.

Do not silently skip a requirement. If a step is blocked by missing credentials, unavailable services, platform restrictions, or other external limitations, state the exact blocker and complete everything else possible.

---

## 14. Definition of Done

The task is complete only when:

- All mandatory API endpoints are implemented.
- Authentication and role-based access work.
- PostgreSQL persistence works.
- Search and filters work.
- Inventory purchasing and restocking work correctly.
- Concurrent purchases cannot oversell stock.
- The React application is polished and responsive.
- All important forms and buttons work.
- Tests have been written and actually executed.
- The test report reflects real results.
- The README is complete.
- PROMPTS.md transparently addresses the raw-log requirement.
- Git workflow and AI co-authorship requirements are addressed.
- Deployment configurations are ready.
- The frontend and backend are deployed and verified if the required access is available.
- All blockers and manual actions are documented.

---

## 15. Final Response to Me

When the implementation is finished, provide a concise but complete report covering:

1. Features implemented.
2. Final project structure.
3. Commands to run the project locally.
4. Actual test results and coverage.
5. Frontend URL.
6. Backend API URL.
7. Swagger URL.
8. Health-check URL.
9. GitHub repository URL, if available.
10. Deployment status for Vercel, Render, and Neon.
11. Documentation and screenshot locations.
12. Git commits created, if any.
13. Any incomplete requirements.
14. Exact manual steps I must perform.

Clearly distinguish completed work from prepared-but-not-deployed work.

**Start now. Inspect the assignment and repository, create the requirements checklist, and build the application incrementally using genuine TDD. Do not stop at planning or generating boilerplate. Aim for a complete, secure, polished, tested, and demonstrably deployed result.**
---
Raw prompt above is copied from the user-provided attachment without edits. Complete Codex responses and any earlier AI chats are not retrievable here. The owner must add actual unedited exports or public chat links before submission; no response or link has been fabricated.
