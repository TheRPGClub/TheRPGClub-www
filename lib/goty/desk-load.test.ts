import { beforeEach, describe, expect, it, vi } from "vitest";

// The API as the desk's reads see it: a status (or a thrown fetch) per path.
let answers: Record<string, [number, unknown] | "throw"> = {};
vi.mock("@/lib/api", () => ({
  apiFetch: async (path: string) => {
    const answer = answers[path] ?? [404, {}];
    if (answer === "throw") throw new Error("ECONNREFUSED");
    return new Response(JSON.stringify(answer[1]), { status: answer[0] });
  },
}));

const { loadGotyDesk } = await import("./desk-load");

const LIST = "/api/v1/goty_votes?per=100";
const VOTE = "/api/v1/goty_votes/2026";
const NOMS = "/api/v1/goty_votes/2026/nominations?per=500";

beforeEach(() => {
  answers = {
    [LIST]: [200, { data: [{ year: 2026, phase: "nominating" }] }],
    [VOTE]: [200, { data: { year: 2026, phase: "nominating" } }],
    [NOMS]: [200, { data: [] }],
  };
});

describe("loadGotyDesk", () => {
  it("reads the year in full", async () => {
    expect(await loadGotyDesk()).toMatchObject({ state: "ready", vote: { year: 2026 }, years: [2026], nominations: [] });
  });

  it("is empty when there is no GOTY Vote, or the Feature is Off (404)", async () => {
    answers[LIST] = [200, { data: [] }];
    expect(await loadGotyDesk()).toEqual({ state: "empty" });
    answers[LIST] = [404, { error: "not_found" }];
    expect(await loadGotyDesk()).toEqual({ state: "empty" });
  });

  it("tells an outage from an empty desk", async () => {
    answers[LIST] = "throw";
    expect(await loadGotyDesk()).toEqual({ state: "unreachable" });
    answers[LIST] = [200, { data: [{ year: 2026, phase: "nominating" }] }];
    answers[VOTE] = [503, {}];
    expect(await loadGotyDesk()).toEqual({ state: "unreachable" });
    answers[VOTE] = [200, { data: { year: 2026 } }];
    answers[NOMS] = "throw";
    expect(await loadGotyDesk()).toEqual({ state: "unreachable" });
  });
});
