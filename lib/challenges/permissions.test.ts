import { describe, expect, it } from "vitest";

import type { SessionMembership } from "@/lib/auth-types";
import { canEditChallenge, canHostDelete } from "@/lib/challenges/permissions";

const member = {
  moderator: false,
  admin: false,
  dev: false,
} as SessionMembership;
const mod = { ...member, moderator: true };
const mine = {
  hosted_by_club: false,
  host: { user_id: "me", username: "me" },
  run_count: 0,
};
const club = { hosted_by_club: true, host: null, run_count: 0 };

describe("Challenge tools", () => {
  it("lets the Host edit their own and Moderators edit any", () => {
    expect(canEditChallenge(mine, { id: "me", membership: member })).toBe(true);
    expect(canEditChallenge(mine, { id: "you", membership: mod })).toBe(true);
    expect(canEditChallenge(mine, { id: "you", membership: member })).toBe(false);
    expect(canEditChallenge(club, { id: "you", membership: mod })).toBe(true);
    expect(canEditChallenge(club, { id: "me", membership: member })).toBe(false);
  });

  it("lets the Host delete only while nobody has a Run", () => {
    expect(canHostDelete(mine, { id: "me", membership: member })).toBe(true);
    expect(canHostDelete({ ...mine, run_count: 2 }, { id: "me", membership: member })).toBe(false);
  });
});
