import { APIResponse, expect } from "@playwright/test";
import { BaseApiClient } from "./BaseApiClient.js";
import { env } from "../../config/env.js";

export class AnalyticsApi extends BaseApiClient {
  async listFeeds() {
    const res = await this.request.get(`${env.BASE_URL}/api/feed`, { headers: this.headers() });
    expect(res.status()).toBe(200);
    return (await res.json()) as { items: Array<{ id: string; enabled: boolean; source: string }> };
  }

  async toggleFeed(id: string, enabled: boolean) {
    const res = await this.patchFeedRaw(id, { enabled });
    expect(res.status()).toBe(200);
    return (await res.json()) as { id: string; enabled: boolean };
  }

  async createFeed(source: string) {
    const res = await this.createFeedRaw(source);
    expect(res.status()).toBe(201);
    return (await res.json()) as { id: string; source: string; enabled: boolean };
  }

  async updateFeedSource(id: string, source: string) {
    const res = await this.patchFeedRaw(id, { source });
    expect(res.status()).toBe(200);
    return (await res.json()) as { id: string; source: string };
  }

  async dashboardSummary(opts?: { days?: number; granularity?: "day" | "week" }) {
    const qs =
      opts && (opts.days !== undefined || opts.granularity !== undefined)
        ? new URLSearchParams({
            ...(opts.days !== undefined ? { days: String(opts.days) } : {}),
            ...(opts.granularity !== undefined ? { granularity: opts.granularity } : {}),
          }).toString()
        : "";

    const res = await this.request.get(
      `${env.BASE_URL}/api/dashboard/summary${qs ? `?${qs}` : ""}`,
      {
        headers: this.headers(),
      },
    );
    expect(res.status()).toBe(200);
    return (await res.json()) as {
      kpis: { activeFeeds: number; totalEvents: number };
      trend: number[];
      timeRange: { days: number; granularity: string; labels: string[] };
    };
  }

  async listDatasets() {
    const res = await this.request.get(`${env.BASE_URL}/api/datasets`, { headers: this.headers() });
    expect(res.status()).toBe(200);
    return (await res.json()) as {
      items: Array<{ id: string; name: string; kind: string; rowCountEstimate: number }>;
      hints: number;
    };
  }

  async sqlLab(query: string) {
    const res = await this.sqlLabRaw(query);
    expect(res.status()).toBe(200);
    return (await res.json()) as {
      columns: Array<{ name: string; type: string }>;
      rows: Record<string, unknown>[];
      rowCount: number;
    };
  }

  sqlLabRaw(query: string): Promise<APIResponse> {
    return this.request.post(`${env.BASE_URL}/api/sqllab/run`, {
      headers: { ...this.headers(), "Content-Type": "application/json" },
      data: { query },
    });
  }

  createFeedRaw(source: unknown): Promise<APIResponse> {
    return this.request.post(`${env.BASE_URL}/api/feed`, {
      headers: { ...this.headers(), "Content-Type": "application/json" },
      data: { source },
    });
  }

  patchFeedRaw(id: string, data: Record<string, unknown>): Promise<APIResponse> {
    return this.request.patch(`${env.BASE_URL}/api/feed/${id}`, {
      headers: { ...this.headers(), "Content-Type": "application/json" },
      data,
    });
  }
}
