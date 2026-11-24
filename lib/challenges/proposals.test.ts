import { describe, expect, it } from "vitest";

import { deciderLine, decidesProposals, proposalsBadge, proposalViews } from "@/lib/challenges/proposals";
import type { Challenge, ChallengePoolProposal } from "@/lib/challenges/types";

const proposal = (over: Partial<ChallengePoolProposal> = {}): ChallengePoolProposal => ({
  id: 1,
  challenge_id: 2,
  game: { game_id: 14, title: "Final Fantasy XIV" },
  proposer: { user_id: "5", username: "tavi", global_name: "Tavi" },
  note: "  The online one, for once. ",
  status: "pending",
  created_at: "2026-11-24T08:00:00Z",
  updated_at: "2026-11-24T08:00:00Z",
  ...over,
});

describe("decidesProposals and proposalsBadge", () => {
  it("reads the API's pending_proposals, null for members", () => {
    expect(decidesProposals({ pending_proposals: null })).toBe(false);
    expect(decidesProposals({ pending_proposals: 0 })).toBe(true);
  });

  it("counts proposals and list notices waiting", () => {
    expect(proposalsBadge({ pending_proposals: 0, list_notices: [] })).toBeNull();
    expect(proposalsBadge({ pending_proposals: 2, list_notices: [{ id: 1, created_at: "" }] })).toBe(3);
    expect(proposalsBadge({ pending_proposals: null, list_notices: null })).toBeNull();
  });
});

describe("proposalViews", () => {
  const challenge = { pool: { optional_target: 0, excluded_games: [{ game_id: 14, title: "Final Fantasy XIV" }] } };

  it("keeps pending proposals, marks a Left out game and trims the note", () => {
    const views = proposalViews(
      [proposal(), proposal({ id: 2, status: "declined" }), proposal({ id: 3, note: " " })],
      challenge,
      new Date("2026-11-24T20:00:00Z"),
    );
    expect(views.map((v) => v.id)).toEqual([1, 3]);
    expect(views[0]).toMatchObject({ leftOut: true, note: "The online one, for once.", when: "today" });
    expect(views[0].proposer.name).toBe("Tavi");
    expect(views[1].note).toBeNull();
  });
});

describe("deciderLine", () => {
  it("names the Host, or the club's staff", () => {
    const host = { user_id: "1", username: "rowan", global_name: "Rowan" };
    expect(deciderLine({ hosted_by_club: false, host } as Pick<Challenge, "hosted_by_club" | "host">)).toBe(
      "Rowan, the Host, decides.",
    );
    expect(deciderLine({ hosted_by_club: true, host: null })).toBe("The club's staff decide.");
  });
});
