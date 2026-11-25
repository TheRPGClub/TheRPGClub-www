import { beforeEach, describe, expect, it, vi } from "vitest";

// unstable_cache as a plain map keyed only on its key parts (what Next keys
// on, besides the function's own source): a throw caches nothing.
const store = new Map<string, unknown>();
vi.mock("next/cache", () => ({
  unstable_cache:
    (fn: () => Promise<unknown>, keyParts: string[]) =>
    async () => {
      const key = keyParts.join("|");
      if (store.has(key)) return store.get(key);
      const value = await fn();
      store.set(key, value);
      return value;
    },
}));

let token: string | undefined;
const reads: { token: string | undefined; path: string }[] = [];
let status = 200;
vi.mock("@/lib/api", () => ({
  apiToken: async () => token,
  apiFetchAs: async (t: string | undefined, path: string) => {
    reads.push({ token: t, path });
    return Response.json({ data: [{ platform_id: 1, platform_name: "SNES" }] }, { status });
  },
}));

const { fetchPlatforms } = await import("@/lib/api/shared");

beforeEach(() => {
  store.clear();
  reads.length = 0;
  status = 200;
  token = "member-a";
});

describe("shared club-wide reads", () => {
  it("are read once for the club, not once per member", async () => {
    expect(await fetchPlatforms()).toEqual([{ platform_id: 1, platform_name: "SNES" }]);
    token = "member-b";
    expect(await fetchPlatforms()).toHaveLength(1);

    expect(reads).toEqual([{ token: "member-a", path: "/api/v1/platforms?per=500" }]);
  });

  it("don't cache a failed read", async () => {
    status = 500;
    expect(await fetchPlatforms()).toBeNull();
    status = 200;
    expect(await fetchPlatforms()).toHaveLength(1);

    expect(reads).toHaveLength(2);
  });

  it("are null signed out, without reading", async () => {
    token = undefined;

    expect(await fetchPlatforms()).toBeNull();
    expect(reads).toHaveLength(0);
  });
});
