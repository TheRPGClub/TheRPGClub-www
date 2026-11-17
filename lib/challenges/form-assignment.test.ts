import { describe, expect, it } from "vitest";

import { createRequest, draftFromChallenge, editRequest, emptyDraft, validateDraft } from "@/lib/challenges/form";
import type { Challenge } from "@/lib/challenges/types";

// The Assignment (Secret Santa) branch of the create and edit form: its
// calendar, and the schedule it must keep (Always Open, no end date).

const santa = () => ({
  ...emptyDraft(),
  format: "assignment" as const,
  name: " Secret Santa ",
  description: "Pick for each other.",
  hostedByClub: true,
});

describe("an Assignment Challenge's request", () => {
  it("defaults to the Secret Santa calendar", () => {
    expect(createRequest(santa()).data.assignment).toEqual({
      signup_cutoff: "12-01",
      pick_deadline: "12-15",
      reveal: "12-25",
    });
  });

  it("sends its calendar, Always Open with no end date and no Pool", () => {
    const draft = {
      ...santa(),
      signupCutoff: "12-20",
      pickDeadline: "01-05",
      reveal: "01-15",
      schedule: "seasonal" as const,
      endsOn: "2027-01-01",
      sources: [{ kind: "franchise" as const, id: 1, name: "Final Fantasy" }],
    };
    expect(createRequest(draft)).toEqual({
      data: {
        name: "Secret Santa",
        description: "Pick for each other.",
        challenge_format: "assignment",
        schedule: "always_open",
        season: null,
        ends_on: null,
        hosted_by_club: true,
        assignment: { signup_cutoff: "12-20", pick_deadline: "01-05", reveal: "01-15" },
      },
    });
  });

  it("sends the calendar on an unlocked edit, and not once the rules are locked", () => {
    const draft = { ...santa(), signupCutoff: "11-30" };
    expect(editRequest(draft, { locked: false, closedForGood: false }).data.assignment).toMatchObject({
      signup_cutoff: "11-30",
    });
    expect(editRequest(draft, { locked: true, closedForGood: false }).data).toEqual({
      name: "Secret Santa",
      description: "Pick for each other.",
      ends_on: null,
    });
  });
});

describe("an Assignment Challenge's checks", () => {
  it("passes the Secret Santa calendar", () => {
    expect(validateDraft(santa(), null)).toEqual({});
  });

  it("refuses a calendar out of order on its days", () => {
    expect(validateDraft({ ...santa(), pickDeadline: "12-30" }, null).calendar).toMatch(/after/);
  });

  it("doesn't ask a Pool of it", () => {
    expect(validateDraft({ ...santa(), sources: [], target: 0 }, null)).toEqual({});
  });
});

describe("an Assignment Challenge read back", () => {
  it("fills the calendar from the Challenge", () => {
    const challenge = {
      id: 2,
      name: "Secret Santa",
      description: "",
      challenge_format: "assignment",
      hosted_by_club: true,
      schedule: "always_open",
      open: true,
      hidden: false,
      assignment: { signup_cutoff: "12-02", pick_deadline: "12-16", reveal: "12-24", edition: null },
      created_at: "2026-11-01T00:00:00Z",
      updated_at: "2026-11-01T00:00:00Z",
    } satisfies Challenge;
    expect(draftFromChallenge(challenge)).toMatchObject({
      format: "assignment",
      signupCutoff: "12-02",
      pickDeadline: "12-16",
      reveal: "12-24",
    });
  });
});
