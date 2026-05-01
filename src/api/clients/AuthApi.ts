import { APIRequestContext, expect } from "@playwright/test";
import { env } from "../../config/env.js";

export class AuthApi {
  constructor(private readonly request: APIRequestContext) {}

  async login(username: string = env.USER, password: string = env.PASS): Promise<{ token: string; role: string }> {
    const res = await this.request.post(`${env.BASE_URL}/api/auth/login`, {
      data: { username, password },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { token: string; role: string };
    return body;
  }

  async loginToken(username: string = env.USER, password: string = env.PASS): Promise<string> {
    const session = await this.login(username, password);
    return session.token;
  }
}
