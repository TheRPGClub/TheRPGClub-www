import { beforeEach, describe, expect, it, vi } from "vitest";

// The API as the member's GOTY actions see it: each call recorded and
// answered in turn ("throw" for an unreachable API).
type Answer = [number, unknown] | "throw";
const calls: { path: string; method?: string; body: unknown }[] = [];
let answers: Answer[] = [];
vi.mock("@/lib/api", () => ({
  apiFetch: async (path: string, init?: RequestInit) => {
    calls.push({ path, method: init?.method, body: init?.body ? JSON.parse(String(init.body)) : null });
    const answer = answers.shift() ?? [200, { data: null }];
    if (answer === "throw") throw new Error("ECONNREFUSED");
    return new Response(JSON.stringify(answer[1]), { status: answer[0] });
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
let session: unknown = { principal: { id: "me" } };
vi.mock("@/lib/session", () => ({ getSession: async () => session }));

const { castGotyVoteAction, gotyEligibilityAction, nominateGotyAction, replaceGotyAction, withdrawGotyAction } = await import(
  "./goty"
);

const nom = (id: number, gameId: number) => ({ id, year: 2026, user_id: "me", gamedb_game_id: gameId, nominated_at: "2027-01-02T00:00:00Z" });
const refusedOld = [422, { error: "not_released_in_year" }] as Answer;

beforeEach(() => {
  calls.length = 0;
  answers = [];
  session = { principal: { id: "me" } };
});

describe("replaceGotyAction", () => {
  it("withdraws the old nomination and nominates the new one", async () => {
    answers = [[200, { deleted: true }], [201, { data: nom(8, 20) }]];
    expect(await replaceGotyAction(2026, 5, 10, 20)).toEqual({ ok: true, data: nom(8, 20) });
    expect(calls.map((c) => `${c.method} ${c.path}`)).toEqual([
      "DELETE /api/v1/goty_votes/2026/nominations/5",
      "POST /api/v1/goty_votes/2026/nominations",
    ]);
  });

  it("puts the old game back when the new one is refused, under its new id", async () => {
    answers = [[200, { deleted: true }], refusedOld, [201, { data: nom(9, 10) }]];
    const result = await replaceGotyAction(2026, 5, 10, 20);
    expect(result).toEqual({ ok: false, error: "Only games first released in 2026 can be nominated.", restored: nom(9, 10) });
    expect(calls[2].body).toEqual({ data: { gamedb_game_id: 10 } });
  });

  it("says the old nomination is lost when it can't be put back", async () => {
    answers = [[200, { deleted: true }], refusedOld, "throw"];
    const result = await replaceGotyAction(2026, 5, 10, 20);
    expect(result.ok).toBe(false);
    expect(result.restored).toBeNull();
    expect(result.error).toMatch(/^Only games first released in 2026 can be nominated\. Your old nomination was withdrawn and couldn't be put back/);
  });
});

describe("an unreachable API", () => {
  it("is a failure, not a throw, for every write", async () => {
    const down = { ok: false, error: "Couldn't reach the club's server. Try again." };
    answers = ["throw"];
    expect(await nominateGotyAction(2026, 10)).toEqual(down);
    answers = ["throw"];
    expect(await withdrawGotyAction(2026, 5)).toEqual(down);
    answers = ["throw"];
    expect(await castGotyVoteAction(2026, "gotm", 10)).toEqual(down);
  });

  it("is a failure when the answer can't be read", async () => {
    answers = [[200, undefined]]; // an empty body
    const res = await castGotyVoteAction(2026, "gotm", 10);
    expect(res.ok).toBe(false);
  });
});

const check = (game_id: number, eligible: boolean) => ({
  game_id,
  year: 2026,
  eligible,
  reason: eligible ? null : "not_released_in_year",
  released_on: eligible ? "2026-03-01" : "2019-03-01",
  date_precision: "day",
  source: "release",
});

describe("gotyEligibilityAction", () => {
  it("asks once for the whole result set and keys the answers by game", async () => {
    // Out of order and missing 99 (an unknown id the API leaves out).
    answers = [[200, { data: [check(7, false), check(12, true)] }]];
    const result = await gotyEligibilityAction(2026, [12, 7, 99, 12]);
    expect(calls.map((c) => c.path)).toEqual(["/api/v1/games/goty_eligibility?year=2026&game_ids=12,7,99"]);
    expect(result).toEqual({ 12: check(12, true), 7: check(7, false) });
  });

  it("caps the request at the API's 50 ids", async () => {
    answers = [[200, { data: [] }]];
    await gotyEligibilityAction(2026, Array.from({ length: 60 }, (_, i) => i + 1));
    expect(calls).toHaveLength(1);
    const ids = new URL(calls[0].path, "http://x").searchParams.get("game_ids")!.split(",");
    expect(ids).toHaveLength(50);
  });

  it("sends only positive whole ids", async () => {
    answers = [[200, { data: [] }]];
    await gotyEligibilityAction(2026, [0, -3, 1.5, 4, Number.NaN]);
    expect(calls.map((c) => c.path)).toEqual(["/api/v1/games/goty_eligibility?year=2026&game_ids=4"]);
  });

  it("leaves every game pickable when the check fails, logging a refusal", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    answers = [[422, { error: "invalid_game_ids" }]];
    expect(await gotyEligibilityAction(2026, [1, 2])).toEqual({});
    expect(log).toHaveBeenCalledWith(
      "GOTY eligibility batch refused (422)",
      expect.objectContaining({ year: 2026, ids: [1, 2], body: { error: "invalid_game_ids" } }),
    );
    log.mockRestore();
    answers = [[503, {}]];
    expect(await gotyEligibilityAction(2026, [1, 2])).toEqual({});
    answers = ["throw"];
    expect(await gotyEligibilityAction(2026, [1, 2])).toEqual({});
  });

  it("asks nothing when signed out, for a bad year or for no games", async () => {
    session = null;
    expect(await gotyEligibilityAction(2026, [1])).toEqual({});
    session = { principal: { id: "me" } };
    expect(await gotyEligibilityAction(12, [1])).toEqual({});
    expect(await gotyEligibilityAction(2026, [1.5])).toEqual({});
    expect(await gotyEligibilityAction(2026, [0, -1])).toEqual({});
    expect(calls).toEqual([]);
  });
});
