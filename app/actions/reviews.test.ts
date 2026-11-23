import { beforeEach, describe, expect, it, vi } from "vitest";

// The API as the review actions see it: every call recorded, one answer.
const calls: { path: string; method?: string; body: unknown }[] = [];
let answer: [number, unknown] = [200, { data: { review_id: 5 } }];
vi.mock("@/lib/api", () => ({
  apiFetch: async (path: string, init?: RequestInit) => {
    calls.push({ path, method: init?.method, body: init?.body ? JSON.parse(String(init.body)) : null });
    return new Response(JSON.stringify(answer[1]), { status: answer[0] });
  },
}));
const revalidated: string[] = [];
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidated.push(p) }));

const { createReviewAction, saveDraftAction, publishReviewAction } = await import(
  "@/app/actions/reviews"
);

beforeEach(() => {
  calls.length = 0;
  revalidated.length = 0;
  answer = [200, { data: { review_id: 5 } }];
});

const input = { title: "Hi", rating: 80, body: null, facets: null };

describe("createReviewAction", () => {
  it("publishes the quick take in the same call", async () => {
    const result = await createReviewAction("111", 7, input, { publish: true });
    expect(result.ok).toBe(true);
    expect(calls[0]).toMatchObject({ path: "/api/v1/users/111/reviews", method: "POST" });
    expect(calls[0].body).toMatchObject({ data: { gamedb_game_id: 7, rating: 80, publish: true } });
  });

  it("refuses a quick take with no score before calling the API", async () => {
    const result = await createReviewAction("111", 7, { ...input, rating: null }, { publish: true });
    expect(result.ok).toBe(false);
    expect(calls).toEqual([]);
  });

  it("starts a Draft with no score", async () => {
    const result = await createReviewAction("111", 7, { ...input, rating: null }, { publish: false });
    expect(result.ok).toBe(true);
    expect(calls[0].body).toMatchObject({ data: { rating: null, publish: false } });
  });
});

describe("saveDraftAction", () => {
  it("patches the Draft without revalidating any page", async () => {
    const result = await saveDraftAction(5, { ...input, rating: null });
    expect(result.ok).toBe(true);
    expect(calls[0]).toMatchObject({ path: "/api/v1/reviews/5", method: "PATCH" });
    expect(calls[0].body).toMatchObject({ data: { rating: null, title: "Hi" } });
    expect(revalidated).toEqual([]);
  });

  it("reports a refused save", async () => {
    answer = [422, { error: "Validation failed" }];
    const result = await saveDraftAction(5, input);
    expect(result).toEqual({ ok: false, error: "Validation failed" });
  });
});

describe("publishReviewAction", () => {
  it("publishes and revalidates where the review now shows", async () => {
    const result = await publishReviewAction("111", 5, 7);
    expect(result.ok).toBe(true);
    expect(calls[0]).toMatchObject({ path: "/api/v1/reviews/5/publish", method: "POST" });
    expect(revalidated).toEqual(
      expect.arrayContaining(["/games/7", "/members/111/reviews", "/reviews", "/reviews/5"]),
    );
  });

  it("puts rating_required in words", async () => {
    answer = [422, { error: "rating_required", message: "A score is required to publish a review." }];
    const result = await publishReviewAction("111", 5, 7);
    expect(result).toEqual({ ok: false, error: "Give it an overall score before publishing." });
  });
});
