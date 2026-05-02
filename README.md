# Analytics E2E Lab (Playwright)

Playwright automation for the **shared analytics demo app** published as [`@venkatesulu-settybalija/analytics-demo-app`](https://github.com/venkatesulu-settybalija/analytics-demo-app) (no database, no Docker). This repo contains **tests and framework code only** — the Express + static UI live in that package.

## Demo app (via dependency)

- Login, **feed editor**, **dashboard** (KPIs, time window + day/week grain, charts, **CSV export**, **saved views** in `localStorage`)
- **Explore** + **SQL Lab lite** (read-only `SELECT` on `feeds`)
- APIs: auth with **roles** (`admin` / `viewer`), feeds, `GET /api/datasets`, `POST /api/sqllab/run`, `GET /api/dashboard/summary`, `GET /api/auth/me`
- Default users: `demo` / `demo123` (admin), `viewer` / `viewer123` (read-only)

## This repo

- Playwright **API** and **UI** projects
- POM (`src/ui/pages`), fixtures (`src/fixtures/lab.fixture.ts`), API clients (`src/api/clients`)
- GitHub Actions runs `npm test` on push/PR

## Run

```bash
npm install
npx playwright install chromium
npm test
```

API only:

```bash
npm run test:api
```

`npm run app:start` runs the **`analytics-demo-app`** binary from `node_modules` with `APP_ENABLE_RESET=true` (for manual runs). Playwright’s `webServer` uses the same script.

Override credentials via `.env.example`. Set `APP_PORT` / `BASE_URL` if `3100` is taken.

**Workers:** `workers: 1` — shared in-memory server state.

## Pinning the demo app

`package.json` pins `github:venkatesulu-settybalija/analytics-demo-app#v1.0.1`. Bump the tag when the demo app releases a new version.
