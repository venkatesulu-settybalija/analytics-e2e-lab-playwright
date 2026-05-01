# Analytics E2E Lab

Local-first analytics demo app (no database, no Docker) with an automation framework on top.

## Includes

- Express app with static multi-page UI:
  - Login
  - Feed editor
  - Dashboard with KPI cards, configurable time window (+ day/week grain), bucket labels, bar vs line chart, **CSV export** of KPIs + series, and **saved views** persisted in `localStorage` (browser-only “dashboards”)
  - Explore screen with **dataset catalogue** (`feeds`, synthetic `events_daily`) and **SQL Lab lite** (read-only `SELECT` on `feeds`)
- API routes for auth (returns `role`), feed management, `GET /api/datasets`, `POST /api/sqllab/run`, parameterized `GET /api/dashboard/summary?days=&granularity=`, and `GET /api/auth/me`
- **Roles**: `admin` (default `demo` / `demo123`) can create, edit, and toggle feeds; `viewer` (`viewer` / `viewer123`) is read-only for mutations
- GitHub Actions workflow runs `npm test` on push/PR
- Playwright test architecture with:
  - POM (`src/ui/pages`)
  - Fixture composition (`src/fixtures/lab.fixture.ts`)
  - API clients (`src/api/clients`)
  - API and UI projects

## Run

```bash
npm install
npx playwright install chromium
npm test
```

For just API tests:

```bash
npm run test:api
```

Override credentials with environment variables (see `.env.example`). `npm run app:start` enables `APP_ENABLE_RESET=true` so `POST /api/__reset` works when you reuse the local server with Playwright.

Set `APP_PORT` (and optionally `BASE_URL`) if port `3100` is already taken; Playwright’s `baseURL` and `src/config/env.ts` default to that port when unset.

Playwright is configured with `workers: 1` because every test hits the same in-memory demo process; keeping one worker avoids flaky shared-state races.
