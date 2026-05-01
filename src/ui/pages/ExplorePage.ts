import { Locator, Page, expect } from "@playwright/test";

export class ExplorePage {
  readonly queryInput: Locator;
  readonly runButton: Locator;
  readonly error: Locator;
  readonly resultTable: Locator;
  readonly datasetsList: Locator;

  constructor(private readonly page: Page) {
    this.queryInput = page.locator('[data-testid="sqllab-query"]');
    this.runButton = page.locator('[data-testid="sqllab-run"]');
    this.error = page.locator('[data-testid="sqllab-error"]');
    this.resultTable = page.locator('[data-testid="sqllab-result"]');
    this.datasetsList = page.locator('[data-testid="datasets-list"]');
  }

  async goto() {
    await this.page.goto("/explore.html");
  }

  async expectDatasetsVisible() {
    await expect(this.datasetsList.locator('[data-testid="dataset-feeds"]')).toBeVisible();
    await expect(this.datasetsList.locator('[data-testid="dataset-events_daily"]')).toBeVisible();
  }

  async runQuery(sql: string) {
    await this.queryInput.fill(sql);
    await this.runButton.click();
  }

  async expectResultCell(row: number, col: number, text: string) {
    const cell = this.page.locator(`[data-testid="sqllab-cell-${row}-${col}"]`);
    await expect(cell).toHaveText(text);
  }
}
