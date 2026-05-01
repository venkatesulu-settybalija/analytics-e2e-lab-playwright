import { defineConfig, devices } from "@playwright/test";

const appPort = process.env.APP_PORT ?? "3100";
const baseURL = process.env.BASE_URL ?? `http://127.0.0.1:${appPort}`;

export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  /* Single in-memory API store shared by all connections — run one worker to avoid cross-test races. */
  fullyParallel: true,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "reports/html" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run app:start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      APP_ENABLE_RESET: "true",
      APP_PORT: appPort,
    },
  },
  projects: [
    { name: "api", testMatch: /api\/.*\.spec\.ts$/ },
    {
      name: "ui",
      testMatch: /ui\/.*\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
