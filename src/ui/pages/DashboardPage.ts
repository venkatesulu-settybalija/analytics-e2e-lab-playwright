import { Locator, Page, expect } from "@playwright/test";

export class DashboardPage {
  readonly activeFeeds: Locator;
  readonly totalEvents: Locator;
  readonly trend: Locator;
  readonly reloadButton: Locator;
  readonly daysSelect: Locator;
  readonly granularitySelect: Locator;
  readonly vizSelect: Locator;
  readonly downloadCsv: Locator;
  readonly presetName: Locator;
  readonly presetSave: Locator;
  readonly presetSelect: Locator;
  readonly presetLoad: Locator;
  readonly presetError: Locator;

  constructor(private readonly page: Page) {
    this.activeFeeds = page.locator('[data-testid="kpi-active-feeds"]');
    this.totalEvents = page.locator('[data-testid="kpi-total-events"]');
    this.trend = page.locator('[data-testid="trend-chart"]');
    this.reloadButton = page.locator('[data-testid="dashboard-reload"]');
    this.daysSelect = page.locator('[data-testid="dash-days"]');
    this.granularitySelect = page.locator('[data-testid="dash-granularity"]');
    this.vizSelect = page.locator('[data-testid="dash-viz"]');
    this.downloadCsv = page.locator('[data-testid="dashboard-download-csv"]');
    this.presetName = page.locator('[data-testid="dashboard-preset-name"]');
    this.presetSave = page.locator('[data-testid="dashboard-preset-save"]');
    this.presetSelect = page.locator('[data-testid="dashboard-preset-select"]');
    this.presetLoad = page.locator('[data-testid="dashboard-preset-load"]');
    this.presetError = page.locator('[data-testid="dashboard-preset-error"]');
  }

  async goto() {
    await this.page.goto("/dashboard.html");
  }

  async expectLoaded(expectedTrendPoints: readonly number[]) {
    await expect(this.activeFeeds).not.toHaveText("-");
    await expect(this.totalEvents).not.toHaveText("-");
    const bars = this.trend.locator(".bar");
    await expect(bars).toHaveCount(expectedTrendPoints.length);
    for (let i = 0; i < expectedTrendPoints.length; i++) {
      const bar = this.page.locator(`[data-testid="trend-bar-${i}"]`);
      await expect(bar).toHaveAttribute("data-value", String(expectedTrendPoints[i]));
    }
  }

  async selectTimeWindowDays(days: number) {
    await this.daysSelect.selectOption(String(days));
  }

  async selectGranularity(granularity: "day" | "week") {
    await this.granularitySelect.selectOption(granularity);
  }

  async selectViz(viz: "bar" | "line") {
    await this.vizSelect.selectOption(viz);
  }

  async expectKpisMatchTotals(activeFeeds: number, totalEvents: number) {
    await expect(this.activeFeeds).toHaveText(String(activeFeeds));
    await expect(this.totalEvents).toHaveText(String(totalEvents));
  }
}
