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
vi.mock("@/lib/session", () => ({ getSession: async () => ({ principal: { id: "me" } }) }));

const { castGotyVoteAction, nominateGotyAction, replaceGotyAction, withdrawGotyAction } = await import("./goty");

const nom = (id: number, gameId: number) => ({ id, year: 2026, user_id: "me", gamedb_game_id: gameId, nominated_at: "2027-01-02T00:00:00Z" });
const refusedOld = [422, { error: "not_released_in_year" }] as Answer;

beforeEach(() => {
  calls.length = 0;
  answers = [];
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
