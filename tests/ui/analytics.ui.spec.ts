import { readFileSync } from "node:fs";
import { test, expect } from "../../src/fixtures/lab.fixture.js";
import { env } from "../../src/config/env.js";

test.describe("Analytics UI", () => {
  test("dashboard KPIs and chart align with API summary", async ({ loginPage, dashboardPage, analyticsApi }) => {
    await loginPage.goto();
    await loginPage.login(env.USER, env.PASS);

    const summary = await analyticsApi.dashboardSummary();
    await dashboardPage.goto();
    await dashboardPage.expectKpisMatchTotals(summary.kpis.activeFeeds, summary.kpis.totalEvents);
    await dashboardPage.expectLoaded(summary.trend);
  });

  test("dashboard time window adjusts bar count", async ({ loginPage, dashboardPage, analyticsApi }) => {
    await loginPage.goto();
    await loginPage.login(env.USER, env.PASS);
    await dashboardPage.goto();

    const wide = await analyticsApi.dashboardSummary({ days: 30 });
    await dashboardPage.selectTimeWindowDays(30);
    await dashboardPage.expectLoaded(wide.trend);
    expect(wide.timeRange.labels.at(0)).toContain("Day");
  });

  test("dashboard downloads CSV with KPI and series rows", async ({ page, loginPage, dashboardPage, analyticsApi }) => {
    await loginPage.goto();
    await loginPage.login(env.USER, env.PASS);
    const summary = await analyticsApi.dashboardSummary();
    await dashboardPage.goto();
    await dashboardPage.expectLoaded(summary.trend);

    const downloadPromise = page.waitForEvent("download");
    await dashboardPage.downloadCsv.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/analytics-lab-dashboard-.*\.csv$/);
    const path = await download.path();
    expect(path).toBeTruthy();
    const text = readFileSync(path!, "utf8");
    expect(text).toContain("kind,name,value");
    expect(text).toContain(`kpi,active_feeds,${summary.kpis.activeFeeds}`);
    expect(text).toContain(`kpi,total_events,${summary.kpis.totalEvents}`);
    expect(text).toContain("series,");
  });

  test("dashboard saves and loads a preset from localStorage", async ({
    page,
    loginPage,
    dashboardPage,
    analyticsApi,
  }) => {
    await loginPage.goto();
    await loginPage.login(env.USER, env.PASS);
    await dashboardPage.goto();
    await page.evaluate(() => localStorage.removeItem("analyticsLabDashboards"));

    await dashboardPage.selectTimeWindowDays(14);
    await dashboardPage.selectGranularity("week");
    await dashboardPage.selectViz("bar");
    await dashboardPage.presetName.fill("e2e-weekly");
    await dashboardPage.presetSave.click();
    await expect(dashboardPage.presetError).toBeHidden();

    await dashboardPage.selectTimeWindowDays(7);
    await dashboardPage.selectGranularity("day");
    await expect(dashboardPage.daysSelect).toHaveValue("7");

    await dashboardPage.presetSelect.selectOption("e2e-weekly");
    await dashboardPage.presetLoad.click();
    await expect(dashboardPage.presetError).toBeHidden();

    await expect(dashboardPage.daysSelect).toHaveValue("14");
    await expect(dashboardPage.granularitySelect).toHaveValue("week");

    const expected = await analyticsApi.dashboardSummary({ days: 14, granularity: "week" });
    await dashboardPage.expectLoaded(expected.trend);
  });

  test("feed editor toggles a row", async ({ loginPage, feedPage }) => {
    await loginPage.goto();
    await loginPage.login(env.USER, env.PASS);

    await feedPage.goto();
    await feedPage.expectAnyRowVisible();

    const before = await feedPage.enabledCell("feed-1").innerText();
    await feedPage.toggleFeed("feed-1");
    await expect(feedPage.enabledCell("feed-1")).not.toHaveText(before);
  });

  test("feed form shows validation for empty source", async ({ loginPage, feedPage }) => {
    await loginPage.goto();
    await loginPage.login(env.USER, env.PASS);
    await feedPage.goto();
    await feedPage.submitNewFeed("   ");
    await expect(feedPage.formError).toBeVisible();
    await expect(feedPage.formError).toContainText("required");
  });

  test("save source shows validation for duplicate name", async ({ loginPage, feedPage }) => {
    await loginPage.goto();
    await loginPage.login(env.USER, env.PASS);
    await feedPage.goto();
    await feedPage.sourceInput("feed-2").fill("orders");
    await feedPage.saveSource("feed-2").click();
    await expect(feedPage.editError("feed-2")).toBeVisible();
    await expect(feedPage.editError("feed-2")).toContainText("Duplicate");
  });

  test("explore renders datasets and SQL Lab results", async ({ loginPage, explorePage }) => {
    await loginPage.goto();
    await loginPage.login(env.USER, env.PASS);
    await explorePage.goto();
    await explorePage.expectDatasetsVisible();

    await explorePage.runQuery("SELECT source, enabled FROM feeds");
    await expect(explorePage.error).toBeHidden();
    await explorePage.expectResultCell(0, 0, "orders");
    await explorePage.expectResultCell(1, 0, "payments");
  });

  test("viewer sees readonly banner and no editor controls", async ({ loginPage, feedPage }) => {
    await loginPage.goto();
    await loginPage.login(env.VIEWER_USER, env.VIEWER_PASS);
    await feedPage.goto();
    await expect(feedPage.viewerBanner).toBeVisible();
    await expect(feedPage.newSubmit).toBeHidden();
    await expect(feedPage.toggle("feed-1")).toHaveCount(0);
  });
});
