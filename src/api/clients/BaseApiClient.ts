import { APIRequestContext } from "@playwright/test";

export class BaseApiClient {
  constructor(protected readonly request: APIRequestContext, protected token: string) {}

  protected headers() {
    return { Authorization: `Bearer ${this.token}` };
  }
}
