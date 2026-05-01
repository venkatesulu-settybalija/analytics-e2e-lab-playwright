import { test as base, expect } from "@playwright/test";
import { AuthApi } from "../api/clients/AuthApi.js";
import { AnalyticsApi } from "../api/clients/AnalyticsApi.js";
import { env } from "../config/env.js";
import { LoginPage } from "../ui/pages/LoginPage.js";
import { FeedEditorPage } from "../ui/pages/FeedEditorPage.js";
import { DashboardPage } from "../ui/pages/DashboardPage.js";
import { ExplorePage } from "../ui/pages/ExplorePage.js";

async function resetState(request: import("@playwright/test").APIRequestContext) {
  const res = await request.post(`${env.BASE_URL}/api/__reset`);
  expect(res.status()).toBe(204);
}

export const test = base.extend<{
  _cleanup: void;
  analyticsApi: AnalyticsApi;
  analyticsApiViewer: AnalyticsApi;
  loginPage: LoginPage;
  feedPage: FeedEditorPage;
  dashboardPage: DashboardPage;
  explorePage: ExplorePage;
}>({
  _cleanup: [
    async ({ request }, use) => {
      await use(undefined);
      await resetState(request);
    },
    { auto: true },
  ],
  analyticsApi: async ({ request }, use) => {
    const token = await new AuthApi(request).loginToken(env.USER, env.PASS);
    await use(new AnalyticsApi(request, token));
  },
  analyticsApiViewer: async ({ request }, use) => {
    const token = await new AuthApi(request).loginToken(env.VIEWER_USER, env.VIEWER_PASS);
    await use(new AnalyticsApi(request, token));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  feedPage: async ({ page }, use) => {
    await use(new FeedEditorPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  explorePage: async ({ page }, use) => {
    await use(new ExplorePage(page));
  },
});

export { expect };
