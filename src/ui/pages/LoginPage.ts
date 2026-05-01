import { Locator, Page, expect } from "@playwright/test";

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly status: Locator;

  constructor(private readonly page: Page) {
    this.username = page.locator("#username");
    this.password = page.locator("#password");
    this.submit = page.locator("#login-btn");
    this.status = page.locator('[data-testid="login-status"]');
  }

  async goto() {
    await this.page.goto("/");
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
    await expect(this.status).toContainText("Login success");
  }
}
