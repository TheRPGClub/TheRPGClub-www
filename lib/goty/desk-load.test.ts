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
const CURRENT = "/api/v1/goty_votes/current";

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

  it("opens on the Current GOTY Vote; an explicit year still wins", async () => {
    answers[LIST] = [200, { data: [{ year: 2027, phase: "upcoming" }, { year: 2026, phase: "nominating" }] }];
    answers[CURRENT] = [200, { data: { year: 2026, phase: "nominating" } }];
    answers["/api/v1/goty_votes/2027"] = [200, { data: { year: 2027, phase: "upcoming" } }];
    answers["/api/v1/goty_votes/2027/nominations?per=500"] = [200, { data: [] }];
    expect(await loadGotyDesk()).toMatchObject({ state: "ready", vote: { year: 2026 }, years: [2027, 2026] });
    expect(await loadGotyDesk("2027")).toMatchObject({ state: "ready", vote: { year: 2027 } });
    expect(await loadGotyDesk("1999")).toMatchObject({ state: "ready", vote: { year: 2026 } });
  });

  it("falls back to the newest year when none is current (404)", async () => {
    answers[LIST] = [200, { data: [{ year: 2026, phase: "decided" }] }];
    expect(await loadGotyDesk()).toMatchObject({ state: "ready", vote: { year: 2026 } });
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
    answers[LIST] = [200, { data: [] }];
    answers[CURRENT] = [503, {}];
    expect(await loadGotyDesk()).toEqual({ state: "unreachable" });
    delete answers[CURRENT];
    answers[LIST] = [200, { data: [{ year: 2026, phase: "nominating" }] }];
    answers[VOTE] = [503, {}];
    expect(await loadGotyDesk()).toEqual({ state: "unreachable" });
    answers[VOTE] = [200, { data: { year: 2026 } }];
    answers[NOMS] = "throw";
    expect(await loadGotyDesk()).toEqual({ state: "unreachable" });
  });
});
