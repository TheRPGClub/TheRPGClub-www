import { beforeEach, describe, expect, it, vi } from "vitest";

// The API as chooseThemeAction sees it: each call recorded, one answer
// ("throw" for an unreachable API).
const calls: { path: string; method?: string; body: unknown }[] = [];
let answer: number | "throw" = 200;
vi.mock("@/lib/api", () => ({
  apiFetch: async (path: string, init?: RequestInit) => {
    calls.push({ path, method: init?.method, body: init?.body ? JSON.parse(String(init.body)) : null });
    if (answer === "throw") throw new Error("ECONNREFUSED");
    return new Response("{}", { status: answer });
  },
}));
const refresh = vi.fn();
vi.mock("next/cache", () => ({ refresh }));
let session: unknown = { principal: { discord_id: "1" } };
vi.mock("@/lib/session", () => ({ getSession: async () => session }));

const { chooseThemeAction } = await import("./member-theme");

beforeEach(() => {
  calls.length = 0;
  answer = 200;
  refresh.mockClear();
  session = { principal: { discord_id: "1" } };
});

describe("chooseThemeAction", () => {
  it("stores a Theme by its key and refreshes so the layout re-renders", async () => {
    expect(await chooseThemeAction("aero")).toEqual({ ok: true });
    expect(calls).toEqual([{ path: "/api/v1/me/theme", method: "PUT", body: { theme: "aero" } }]);
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("sends null for Monthly Issue, the club default", async () => {
    await chooseThemeAction("monthly-issue");
    expect(calls[0].body).toEqual({ theme: null });
  });

  it.each([
    [403, "That Theme isn't open to you right now."],
    [422, "The club has no Theme by that name."],
    [401, "Sign in again to change your Theme."],
    [500, "Your Theme wasn't saved. Try again."],
  ])("says why a %i wasn't saved, without refreshing", async (status, error) => {
    answer = status;
    expect(await chooseThemeAction("aero")).toEqual({ ok: false, error });
    expect(refresh).not.toHaveBeenCalled();
  });

  it("is a failure, not a throw, when the API is unreachable", async () => {
    answer = "throw";
    expect(await chooseThemeAction("aero")).toEqual({ ok: false, error: "Couldn't reach the club's server. Nothing changed." });
  });

  it("calls nothing without a session or a key", async () => {
    session = null;
    expect((await chooseThemeAction("aero")).ok).toBe(false);
    session = { principal: { discord_id: "1" } };
    expect((await chooseThemeAction("  ")).ok).toBe(false);
    expect(calls).toEqual([]);
  });
});
