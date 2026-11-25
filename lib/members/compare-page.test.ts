import { describe, expect, it } from "vitest";

import type { CommonCompletionMeta, User } from "@/lib/api/types";
import { compareMembers, completionOverlap } from "@/lib/members/compare-page";

const meta = (overlap?: CommonCompletionMeta["overlap"]) =>
  ({ left_user_id: "1", right_user_id: "2", overlap }) as CommonCompletionMeta;

describe("completionOverlap", () => {
  it("reads the API's distinct-game overlap", () => {
    expect(completionOverlap(meta({ only_left: 2, both: 1, only_right: 3 }))).toEqual({
      onlyLeft: 2,
      both: 1,
      onlyRight: 3,
    });
  });

  it("is left out when the API doesn't send it, or the read failed", () => {
    expect(completionOverlap(meta())).toBeNull();
    expect(completionOverlap(null)).toBeNull();
  });
});

const user = (user_id: string, global_name: string | null, extra: Partial<User> = {}) =>
  ({ user_id, global_name, username: `u${user_id}`, is_bot: false, server_left_at: null, ...extra }) as User;

describe("compareMembers", () => {
  const all = [
    user("1", "Ann"),
    user("2", null),
    user("3", "bob"),
    user("4", "Bot", { is_bot: true }),
    user("5", "Gone", { server_left_at: "2026-01-01" }),
  ];

  it("offers every active member but the page's own, by name", () => {
    expect(compareMembers(all, "1", "3")).toEqual({
      members: [
        { user_id: "3", name: "bob" },
        { user_id: "2", name: "u2" },
      ],
      rightName: "bob",
    });
  });

  it("keeps someone picked through a link who isn't in the list selectable", () => {
    expect(compareMembers(all, "1", "5")).toEqual({
      members: [
        { user_id: "5", name: "Gone" },
        { user_id: "3", name: "bob" },
        { user_id: "2", name: "u2" },
      ],
      rightName: "Gone",
    });
    expect(compareMembers(all, "1", "99").members[0]).toEqual({ user_id: "99", name: "99" });
  });

  it("adds no one when there is no one to compare with, or it is the owner", () => {
    expect(compareMembers(all, "1", null).members).toHaveLength(2);
    expect(compareMembers(all, "1", "1").members).toHaveLength(2);
  });
});
