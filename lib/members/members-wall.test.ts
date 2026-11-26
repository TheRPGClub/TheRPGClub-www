import { beforeEach, describe, expect, it, vi } from "vitest";

import type { User } from "@/lib/api/types";

// The API as the page sees it: path -> [status, body].
const answers = new Map<string, [number, unknown]>();
// The page reads the members through the shared (club-wide) cache.
vi.mock("@/lib/api/shared", () => ({
  fetchMembers: async (query: string) => {
    const [status, body] = answers.get(`/api/v1/users?${query}`) ?? [404, null];
    return status === 200 ? (body as { data: unknown[] }).data : null;
  },
}));

const { fetchWallTiers } = await import("@/lib/members/members-wall");
const { memberDisplayName, searchTiers, wallTiers } = await import("@/lib/members/member-tiers");

const user = (id: string, extra: Partial<User> = {}): User =>
  ({ user_id: id, username: `u${id}`, global_name: null, is_bot: false, server_left_at: null, ...extra }) as User;

beforeEach(() => answers.clear());

describe("memberDisplayName", () => {
  it("prefers the global name, then the username, then the id", () => {
    expect(memberDisplayName(user("1", { global_name: "Bob" }))).toBe("Bob");
    expect(memberDisplayName(user("2"))).toBe("u2");
    expect(memberDisplayName(user("3", { username: null } as Partial<User>))).toBe("3");
  });
});

describe("wallTiers", () => {
  const tiers = wallTiers([
    user("1", { role_regular: true }),
    user("2", { role_moderator: true, role_regular: true }),
    user("3"),
    user("4", { role_admin: true, is_bot: true }),
    user("5", { role_regular: true, server_left_at: "2026-01-01T00:00:00Z" }),
    user("6", { role_admin: true, role_dev: true }),
    user("7", { role_dev: true, role_member: true }),
    user("8", { role_member: true }),
    user("9", { role_newcomer: true }),
  ]);

  it("puts each current member once, in the tier of their highest role, highest tier first", () => {
    expect(tiers.map((t) => [t.title, t.members.map((m) => m.userId)])).toEqual([
      ["Admins", ["6"]],
      ["Moderators", ["2"]],
      ["Devs", ["7"]],
      ["Regulars", ["1"]],
      ["Members", ["8"]],
      ["Newcomers", ["9"]],
    ]);
  });

  it("lists every role a member holds, highest first", () => {
    expect(tiers[0].members[0].roles).toEqual(["Admin", "Dev"]);
    expect(tiers[2].members[0].roles).toEqual(["Dev", "Member"]);
  });

  it("leaves out an empty tier", () => {
    expect(wallTiers([user("1", { role_member: true })]).map((t) => t.title)).toEqual(["Members"]);
  });
});

describe("searchTiers", () => {
  const tiers = wallTiers([
    user("1", { role_admin: true, global_name: "Vex" }),
    user("2", { role_regular: true, username: "halcyon_days" }),
  ]);

  it("keeps members whose name or username holds the query, dropping empty tiers", () => {
    expect(searchTiers(tiers, " HALC ").map((t) => [t.title, t.members.map((m) => m.userId)])).toEqual([
      ["Regulars", ["2"]],
    ]);
    expect(searchTiers(tiers, "")).toBe(tiers);
  });
});

describe("fetchWallTiers", () => {
  it("reads the tiers from the members list", async () => {
    answers.set("/api/v1/users?per=500", [200, { data: [user("1", { role_regular: true })] }]);
    expect((await fetchWallTiers())?.map((t) => t.title)).toEqual(["Regulars"]);
  });

  it("is null when the API fails", async () => {
    expect(await fetchWallTiers()).toBeNull();
  });
});
