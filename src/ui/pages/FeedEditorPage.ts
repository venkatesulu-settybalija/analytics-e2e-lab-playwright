import { Locator, Page, expect } from "@playwright/test";

export class FeedEditorPage {
  readonly refreshButton: Locator;
  readonly newSourceInput: Locator;
  readonly newSubmit: Locator;
  readonly formError: Locator;
  readonly viewerBanner: Locator;

  constructor(private readonly page: Page) {
    this.refreshButton = page.locator('[data-testid="feed-refresh"]');
    this.newSourceInput = page.locator('[data-testid="new-feed-source-input"]');
    this.newSubmit = page.locator('[data-testid="new-feed-submit"]');
    this.formError = page.locator('[data-testid="feed-form-error"]');
    this.viewerBanner = page.locator('[data-testid="viewer-readonly-banner"]');
  }

  async goto() {
    await this.page.goto("/feed.html");
  }

  enabledCell(id: string) {
    return this.page.locator(`[data-testid="feed-enabled-${id}"]`);
  }

  sourceInput(id: string) {
    return this.page.locator(`[data-testid="feed-source-input-${id}"]`);
  }

  editError(id: string) {
    return this.page.locator(`[data-testid="feed-edit-error-${id}"]`);
  }

  toggle(id: string) {
    return this.page.locator(`[data-testid="feed-toggle-${id}"]`);
  }

  saveSource(id: string) {
    return this.page.locator(`[data-testid="feed-save-${id}"]`);
  }

  async toggleFeed(id: string) {
    await this.toggle(id).click();
  }

  async submitNewFeed(source: string) {
    await this.newSourceInput.fill(source);
    await this.newSubmit.click();
  }

  async expectAnyRowVisible() {
    await expect(this.page.locator('tbody [data-testid^="feed-row-"]').first()).toBeVisible();
  }
}
