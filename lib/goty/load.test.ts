import { beforeEach, describe, expect, it, vi } from "vitest";

// The API as /goty's reads see it: a status per path, 404 for the rest.
let answers: Record<string, [number, unknown]> = {};
vi.mock("@/lib/api", () => ({
  apiFetch: async (path: string) => {
    const [status, body] = answers[path] ?? [404, {}];
    return new Response(JSON.stringify(body), { status });
  },
}));

const { loadGotyPage } = await import("./load");

const LIST = "/api/v1/goty_votes?per=100";
const CURRENT = "/api/v1/goty_votes/current";

beforeEach(() => {
  answers = {};
});

describe("loadGotyPage", () => {
  it("shows the running vote in the January overlap, not next year's upcoming one", async () => {
    answers[LIST] = [200, { data: [{ year: 2027, phase: "upcoming" }, { year: 2026, phase: "voting" }, { year: 2025, phase: "decided" }] }];
    answers[CURRENT] = [200, { data: { year: 2026, phase: "voting" } }];
    answers["/api/v1/goty_votes/2026/nominations?per=500"] = [200, { data: [{ id: 1 }] }];
    answers["/api/v1/goty_votes/2025"] = [200, { data: { year: 2025, phase: "decided" } }];
    const data = await loadGotyPage();
    expect(data.current?.year).toBe(2026);
    expect(data.nominations).toHaveLength(1);
    expect(data.history.map((v) => v.year)).toEqual([2025]);
  });

  it("reads no nominations for an upcoming vote", async () => {
    answers[LIST] = [200, { data: [{ year: 2027, phase: "upcoming" }] }];
    answers[CURRENT] = [200, { data: { year: 2027, phase: "upcoming", club_releases: [] } }];
    const data = await loadGotyPage();
    expect(data.current?.club_releases).toEqual([]);
    expect(data.nominations).toEqual([]);
  });

  it("falls back to no current vote on a 404, keeping the history", async () => {
    answers[LIST] = [200, { data: [{ year: 2025, phase: "decided" }] }];
    answers["/api/v1/goty_votes/2025"] = [200, { data: { year: 2025, phase: "decided" } }];
    const data = await loadGotyPage();
    expect(data.current).toBeNull();
    expect(data.history.map((v) => v.year)).toEqual([2025]);
  });
});
