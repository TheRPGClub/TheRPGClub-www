import { beforeEach, describe, expect, it, vi } from "vitest";

// The API as the GOTY desk actions see it: every call recorded, one answer.
const calls: { path: string; method?: string; body: unknown }[] = [];
let answer: [number, unknown] = [200, { data: { year: 2026 } }];
vi.mock("@/lib/api", () => ({
  apiFetch: async (path: string, init?: RequestInit) => {
    calls.push({ path, method: init?.method, body: init?.body ? JSON.parse(String(init.body)) : null });
    return new Response(JSON.stringify(answer[1]), { status: answer[0] });
  },
}));
const revalidated: string[] = [];
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidated.push(p) }));
let session: unknown = { principal: { id: "1" }, membership: { admin: true } };
vi.mock("@/lib/session", () => ({ getSession: async () => session }));

const { moveGotyDatesAction, resolveGotyTieAction, removeGotyNominationAction } = await import(
  "@/app/actions/goty-desk"
);

beforeEach(() => {
  calls.length = 0;
  revalidated.length = 0;
  answer = [200, { data: { year: 2026 } }];
  session = { principal: { id: "1" }, membership: { admin: true } };
});

describe("moveGotyDatesAction", () => {
  it("patches only the dates given and refreshes the desk and /goty", async () => {
    const result = await moveGotyDatesAction(2026, { voting_opens_at: "2027-01-22T17:00:00.000Z" });
    expect(result).toMatchObject({ ok: true, data: { year: 2026 } });
    expect(calls[0]).toMatchObject({
      path: "/api/v1/goty_votes/2026",
      method: "PATCH",
      body: { data: { voting_opens_at: "2027-01-22T17:00:00.000Z" } },
    });
    expect(revalidated).toEqual(["/admin/goty", "/goty"]);
  });

  it("refuses an empty or broken draft before calling the API", async () => {
    expect((await moveGotyDatesAction(2026, {})).ok).toBe(false);
    expect((await moveGotyDatesAction(2026, { voting_closes_at: "soon" })).ok).toBe(false);
    expect(calls).toEqual([]);
  });

  it("reads the API's refusal in its own words", async () => {
    answer = [422, { error: "voting_opened", message: "voting for GOTY Vote 2026 has opened, so voting_opens_at can't move" }];
    const result = await moveGotyDatesAction(2026, { voting_opens_at: "2027-01-22T17:00:00.000Z" });
    expect(result).toEqual({ ok: false, error: "Voting for GOTY Vote 2026 has opened, so voting_opens_at can't move." });
    expect(revalidated).toEqual([]);
  });
});

describe("resolveGotyTieAction", () => {
  it("posts the one winner to the Award's resolve_tie", async () => {
    const result = await resolveGotyTieAction(2026, "game_of_the_year", 7);
    expect(result.ok).toBe(true);
    expect(calls[0]).toMatchObject({
      path: "/api/v1/goty_votes/2026/awards/game_of_the_year/resolve_tie",
      method: "POST",
      body: { data: { gamedb_game_id: 7 } },
    });
  });

  it("refuses an unknown Award or no pick", async () => {
    expect((await resolveGotyTieAction(2026, "best_boss" as never, 7)).ok).toBe(false);
    expect((await resolveGotyTieAction(2026, "gotm", 0)).ok).toBe(false);
    expect(calls).toEqual([]);
  });
});

describe("removeGotyNominationAction", () => {
  it("sends someone else's removal with its reason and returns the announce job", async () => {
    answer = [200, { deleted: true, meta: { announce_job_id: 42 } }];
    const result = await removeGotyNominationAction(2026, 5, "2", "  Released in 2025  ");
    expect(result).toEqual({ ok: true, jobId: 42 });
    expect(calls[0]).toMatchObject({
      path: "/api/v1/goty_votes/2026/nominations/5?reason=Released%20in%202025",
      method: "DELETE",
    });
  });

  it("needs a reason for someone else's, of 250 characters at most", async () => {
    expect(await removeGotyNominationAction(2026, 5, "2", " ")).toMatchObject({ ok: false, error: /Give a reason/ });
    expect(await removeGotyNominationAction(2026, 5, "2", "x".repeat(251))).toMatchObject({ ok: false });
    expect(calls).toEqual([]);
  });

  it("removes the viewer's own with no reason and no announcement", async () => {
    answer = [200, { deleted: true, meta: { announce_job_id: null } }];
    const result = await removeGotyNominationAction(2026, 5, "1", "");
    expect(result).toEqual({ ok: true, jobId: null });
    expect(calls[0].path).toBe("/api/v1/goty_votes/2026/nominations/5");
  });

  it("is Admin-only", async () => {
    session = { principal: { id: "1" }, membership: { moderator: true } };
    expect(await removeGotyNominationAction(2026, 5, "2", "why")).toMatchObject({ ok: false, error: /Only Admins/ });
    expect(calls).toEqual([]);
  });

  it("words a window refusal and a gone nomination", async () => {
    answer = [422, { error: "nominations_closed", message: "Game of the Year nominations for 2026 can no longer be withdrawn: voting has opened" }];
    expect(await removeGotyNominationAction(2026, 5, "2", "why")).toMatchObject({ ok: false, error: /voting has opened/ });
    answer = [404, { error: "not_found" }];
    expect(await removeGotyNominationAction(2026, 5, "2", "why")).toMatchObject({ error: "That nomination is already gone." });
  });
});
