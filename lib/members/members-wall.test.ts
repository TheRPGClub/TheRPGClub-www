import { beforeEach, describe, expect, it, vi } from "vitest";

import type { User } from "@/lib/api/types";

// The API as the wall sees it: path -> [status, body].
const answers = new Map<string, [number, unknown]>();
// The wall reads the members through the shared (club-wide) cache.
vi.mock("@/lib/api/shared", () => ({
  fetchMembers: async (query: string) => {
    const [status, body] = answers.get(`/api/v1/users?${query}`) ?? [404, null];
    return status === 200 ? (body as { data: unknown[] }).data : null;
  },
}));

const { fetchWallMembers, memberDisplayName, parseShow, wallView } = await import(
  "@/lib/members/members-wall"
);

const user = (id: string, extra: Partial<User> = {}): User =>
  ({ user_id: id, username: `u${id}`, global_name: null, is_bot: false, server_left_at: null, ...extra }) as User;

beforeEach(() => answers.clear());

describe("parseShow", () => {
  it("reads staff and regulars, everyone otherwise", () => {
    expect(parseShow("staff")).toBe("staff");
    expect(parseShow("regulars")).toBe("regulars");
    expect(parseShow(undefined)).toBe("everyone");
    expect(parseShow("admins")).toBe("everyone");
  });
});

describe("memberDisplayName", () => {
  it("prefers the global name, then the username, then the id", () => {
    expect(memberDisplayName(user("1", { global_name: "Bob" }))).toBe("Bob");
    expect(memberDisplayName(user("2"))).toBe("u2");
    expect(memberDisplayName(user("3", { username: null } as Partial<User>))).toBe("3");
  });
});

describe("fetchWallMembers", () => {
  it("keeps current members with a club role, staff first, the API's order within a role", async () => {
    answers.set("/api/v1/users?per=500", [
      200,
      {
        data: [
          user("1", { role_regular: true }),
          user("2", { role_moderator: true, role_regular: true }),
          user("3"),
          user("4", { role_admin: true, is_bot: true }),
          user("5", { role_regular: true, server_left_at: "2026-01-01T00:00:00Z" }),
          user("6", { role_admin: true }),
          user("7", { role_regular: true }),
        ],
      },
    ]);
    const members = await fetchWallMembers();
    expect(members?.map((m) => [m.user.user_id, m.role])).toEqual([
      ["6", "admin"],
      ["2", "moderator"],
      ["1", "regular"],
      ["7", "regular"],
    ]);
  });

  it("is null when the API fails", async () => {
    expect(await fetchWallMembers()).toBeNull();
  });
});

describe("wallView", () => {
  const members = [
    { user: user("6"), role: "admin" as const },
    { user: user("2"), role: "moderator" as const },
    { user: user("1"), role: "regular" as const },
  ];

  it("counts each choice and shows the chosen one", () => {
    expect(wallView(members, "staff")).toEqual({
      counts: { everyone: 3, staff: 2, regulars: 1 },
      shown: members.slice(0, 2),
    });
    expect(wallView(members, "regulars").shown).toEqual(members.slice(2));
    expect(wallView(members, "everyone").shown).toEqual(members);
  });
});
