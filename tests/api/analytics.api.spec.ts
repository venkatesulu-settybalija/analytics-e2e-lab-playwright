import { test, expect } from "../../src/fixtures/lab.fixture.js";
import { env } from "../../src/config/env.js";

test.describe("Analytics API", () => {
  test("list feeds and toggle one item", async ({ analyticsApi }) => {
    const initial = await analyticsApi.listFeeds();
    expect(initial.items.length).toBeGreaterThan(0);

    const target = initial.items[0];
    const updated = await analyticsApi.toggleFeed(target.id, !target.enabled);
    expect(updated.enabled).toBe(!target.enabled);
  });

  test("dashboard summary matches feed state and trend shape", async ({ analyticsApi }) => {
    const feeds = await analyticsApi.listFeeds();
    const activeFeeds = feeds.items.filter((f) => f.enabled).length;
    const summary = await analyticsApi.dashboardSummary();
    expect(summary.kpis.activeFeeds).toBe(activeFeeds);
    expect(summary.kpis.totalEvents).toBe(activeFeeds * 120 + 80);
    expect(summary.trend).toHaveLength(7);
    expect(summary.timeRange.days).toBe(7);
    expect(summary.timeRange.granularity).toBe("day");
    expect(summary.timeRange.labels).toHaveLength(summary.trend.length);
  });

  test("dashboard summary accepts day windows beyond the default curve", async ({ analyticsApi }) => {
    const s14 = await analyticsApi.dashboardSummary({ days: 14 });
    expect(s14.trend).toHaveLength(14);
    expect(s14.timeRange.labels).toHaveLength(14);

    const s30w = await analyticsApi.dashboardSummary({ days: 30, granularity: "week" });
    expect(s30w.trend).toHaveLength(Math.ceil(30 / 7));
    expect(s30w.timeRange.granularity).toBe("week");
  });

  test("datasets catalogue lists physical and virtual entries", async ({ analyticsApi }) => {
    const ds = await analyticsApi.listDatasets();
    expect(ds.items.some((x) => x.id === "feeds" && x.kind === "physical")).toBe(true);
    expect(ds.items.some((x) => x.id === "events_daily" && x.kind === "virtual")).toBe(true);
  });

  test("SQL Lab runs read-only selects on feeds", async ({ analyticsApi, analyticsApiViewer }) => {
    const star = await analyticsApi.sqlLab("select * FROM feeds;");
    expect(star.rows.length).toBeGreaterThan(0);
    expect(star.columns.map((c) => c.name).sort()).toEqual(["enabled", "id", "source", "updatedAt"].sort());

    const count = await analyticsApi.sqlLab("SELECT count(*) FROM feeds");
    expect(count.rows[0].count).toBe(star.rows.length);

    await analyticsApiViewer.sqlLab("SELECT source FROM feeds");
  });

  test("SQL Lab rejects non-select statements", async ({ analyticsApi }) => {
    const res = await analyticsApi.sqlLabRaw("DELETE FROM feeds");
    expect(res.status()).toBe(400);
  });

  test("create feed returns 201 and appears in list", async ({ analyticsApi }) => {
    const created = await analyticsApi.createFeed("shipments");
    expect(created.source).toBe("shipments");
    const list = await analyticsApi.listFeeds();
    expect(list.items.some((x) => x.id === created.id)).toBe(true);
  });

  test("create feed rejects empty source", async ({ analyticsApi }) => {
    const res = await analyticsApi.createFeedRaw("   ");
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { message?: string };
    expect(body.message).toContain("required");
  });

  test("create feed rejects duplicate source (case-insensitive)", async ({ analyticsApi }) => {
    const second = await analyticsApi.createFeedRaw("ORDERS");
    expect(second.status()).toBe(400);
  });

  test("viewer can read feeds but cannot mutate", async ({ analyticsApiViewer, analyticsApi }) => {
    const list = await analyticsApiViewer.listFeeds();
    expect(list.items.length).toBeGreaterThan(0);

    const patch = await analyticsApiViewer.patchFeedRaw(list.items[0].id, { enabled: false });
    expect(patch.status()).toBe(403);

    const post = await analyticsApiViewer.createFeedRaw("forbidden");
    expect(post.status()).toBe(403);

    const adminList = await analyticsApi.listFeeds();
    expect(adminList.items.some((x) => x.source === "forbidden")).toBe(false);
  });

  test("login returns role for admin and viewer", async ({ request }) => {
    const admin = await request.post(`${env.BASE_URL}/api/auth/login`, {
      data: { username: env.USER, password: env.PASS },
    });
    expect(admin.status()).toBe(200);
    expect((await admin.json()).role).toBe("admin");

    const viewer = await request.post(`${env.BASE_URL}/api/auth/login`, {
      data: { username: env.VIEWER_USER, password: env.VIEWER_PASS },
    });
    expect(viewer.status()).toBe(200);
    expect((await viewer.json()).role).toBe("viewer");
  });
});
