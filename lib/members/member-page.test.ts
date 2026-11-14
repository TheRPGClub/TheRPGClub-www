import { beforeEach, describe, expect, it, vi } from "vitest";

// The API as the member pages see it: path -> [status, body].
const answers = new Map<string, [number, unknown]>();
vi.mock("@/lib/api", () => ({
  apiFetch: async (path: string) => {
    const [status, body] = answers.get(path) ?? [404, null];
    return new Response(body == null ? null : JSON.stringify(body), { status });
  },
}));

const { fetchMember, fetchMemberList, loadMemberList, pageNumber } = await import(
  "@/lib/members/member-page"
);

beforeEach(() => answers.clear());

describe("pageNumber", () => {
  it("reads a page number, page one for anything else", () => {
    expect(pageNumber("3")).toBe(3);
    expect(pageNumber(undefined)).toBe(1);
    expect(pageNumber("0")).toBe(1);
    expect(pageNumber("-2")).toBe(1);
    expect(pageNumber("x")).toBe(1);
  });
});

describe("fetchMember", () => {
  it("is the member, or null when the API can't find them", async () => {
    answers.set("/api/v1/users/7", [200, { data: { user_id: "7" } }]);
    expect(await fetchMember("7")).toEqual({ user_id: "7" });
    expect(await fetchMember("8")).toBeNull();
  });
});

describe("fetchMemberList", () => {
  it("is the page of rows with the server's count, pages and page size", async () => {
    answers.set("/api/v1/users/7/backlog?per=24&page=2", [
      200,
      { data: [{ id: 1 }, { id: 2 }], meta: { count: 30, pages: 2, per: 20 } },
    ]);
    expect(await fetchMemberList("/api/v1/users/7/backlog?per=24&page=2")).toEqual({
      ok: true,
      entries: [{ id: 1 }, { id: 2 }],
      total: 30,
      totalPages: 2,
      per: 20,
    });
  });

  it("is an empty first page when the read fails", async () => {
    expect(await fetchMemberList("/api/v1/users/7/backlog")).toEqual({
      ok: false,
      entries: [],
      total: 0,
      totalPages: 1,
      per: null,
    });
  });
});

describe("loadMemberList", () => {
  it("reads the member and one page of their list", async () => {
    answers.set("/api/v1/users/7", [200, { data: { user_id: "7" } }]);
    answers.set("/api/v1/users/7/favorites?per=24&page=1", [200, { data: [{ id: 1 }] }]);
    const page = await loadMemberList("7", "favorites", 24, 1);
    expect(page?.user).toEqual({ user_id: "7" });
    expect(page?.list.entries).toEqual([{ id: 1 }]);
    expect(page?.list.total).toBe(1);
  });

  it("is null when the member can't be read", async () => {
    expect(await loadMemberList("8", "favorites", 24, 1)).toBeNull();
  });
});
