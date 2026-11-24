import { describe, expect, it } from "vitest";

import {
  createRequest,
  draftFromChallenge,
  editRequest,
  emptyDraft,
  poolDefinition,
  removeSource,
  sourcePreviewDefinition,
  validateDraft,
  type ChallengeDraft,
} from "@/lib/challenges/form";
import type { Challenge } from "@/lib/challenges/types";

const ff = {
  kind: "franchise" as const,
  id: 12,
  name: "Final Fantasy",
  game_count: 44,
};
const tactics = {
  kind: "collection" as const,
  id: 7,
  name: "Final Fantasy Tactics",
  game_count: 4,
};

const draft = (over: Partial<ChallengeDraft> = {}): ChallengeDraft => ({
  ...emptyDraft(),
  name: "  Fall of Final Fantasy ",
  description: "Any Final Fantasy.",
  sources: [ff, tactics],
  ...over,
});

describe("createRequest", () => {
  it("sends a Seasonal Pool Challenge with its Season and no end date", () => {
    const body = createRequest(
      draft({
        schedule: "seasonal",
        seasonStart: "09-22",
        seasonEnd: "12-20",
        endsOn: "2027-01-01",
        optionalTarget: 3,
      }),
    );
    expect(body).toEqual({
      data: {
        name: "Fall of Final Fantasy",
        description: "Any Final Fantasy.",
        challenge_format: "pool",
        schedule: "seasonal",
        season: { start: "09-22", end: "12-20" },
        ends_on: null,
        hosted_by_club: false,
        pool: {
          franchise_ids: [12],
          collection_ids: [7],
          core_game_ids: [],
          optional_game_ids: [],
          excluded_game_ids: [],
          optional_target: 3,
        },
      },
    });
  });

  it("sends an Always Open Challenge with its end date and no Season", () => {
    const body = createRequest(
      draft({
        schedule: "always_open",
        endsOn: "2027-03-03",
        hostedByClub: true,
      }),
    );
    expect(body.data).toMatchObject({
      schedule: "always_open",
      season: null,
      ends_on: "2027-03-03",
      hosted_by_club: true,
    });
    expect(body.data.pool?.optional_target).toBe(0);
  });

  it("sends the Core Games, the hand-picked Optional Games and those left out", () => {
    const d = draft({
      core: [{ game_id: 1, title: "Final Fantasy" }],
      optional: [{ game_id: 5, title: "Bravely Default" }],
      excluded: [{ game_id: 9, title: "Mobius" }],
    });
    expect(createRequest(d).data.pool).toMatchObject({
      core_game_ids: [1],
      optional_game_ids: [5],
      excluded_game_ids: [9],
    });
  });
});

describe("editRequest", () => {
  it("sends every setting while the rules are open", () => {
    const body = editRequest(draft({ optionalTarget: 4 }), {
      locked: false,
      closedForGood: false,
    });
    expect(body.data).toMatchObject({
      name: "Fall of Final Fantasy",
      challenge_format: "pool",
      pool: { optional_target: 4 },
    });
    expect(body.data).not.toHaveProperty("hosted_by_club");
  });

  it("sends the name, description, end date and the Pool once the rules are locked", () => {
    const body = editRequest(
      draft({ schedule: "always_open", endsOn: "2027-01-31", core: [{ game_id: 1, title: "FF" }], optionalTarget: 2 }),
      { locked: true, closedForGood: false },
    );
    expect(body).toEqual({
      data: {
        name: "Fall of Final Fantasy",
        description: "Any Final Fantasy.",
        ends_on: "2027-01-31",
        pool: {
          franchise_ids: [12],
          collection_ids: [7],
          core_game_ids: [1],
          optional_game_ids: [],
          excluded_game_ids: [],
          optional_target: 2,
        },
      },
    });
  });

  it("sends no Pool for another Format once locked", () => {
    const body = editRequest(draft({ format: "slots", sources: [] }), { locked: true, closedForGood: false });
    expect(body.data).not.toHaveProperty("pool");
  });

  it("leaves the end date alone on a Seasonal or Closed-for-good Challenge", () => {
    expect(
      editRequest(draft({ schedule: "seasonal" }), {
        locked: true,
        closedForGood: false,
      }).data,
    ).not.toHaveProperty("ends_on");
    expect(
      editRequest(draft({ schedule: "always_open" }), {
        locked: true,
        closedForGood: true,
      }).data,
    ).not.toHaveProperty("ends_on");
  });
});

describe("validateDraft", () => {
  it("accepts a complete draft", () => {
    expect(validateDraft(draft({ optionalTarget: 3 }), 41)).toEqual({});
    expect(validateDraft(draft({ core: [{ game_id: 1, title: "FF" }] }), 0)).toEqual({});
  });

  it("names what is missing", () => {
    const errors = validateDraft(draft({ name: " ", sources: [] }), null);
    expect(errors.name).toBe("Give the Challenge a name.");
    expect(errors.sources).toBe("Add a Core Game, or ask for at least 1 Optional Game.");
  });

  it("refuses a target above the Optional Games", () => {
    expect(validateDraft(draft({ optionalTarget: 13 }), 12).target).toBe(
      "Only 12 Optional Games. Lower the target or add more.",
    );
    expect(validateDraft(draft({ optionalTarget: 13 }), null).target).toBeUndefined();
  });

  it("refuses a Season of the same day and an end date in the wrong shape", () => {
    expect(
      validateDraft(
        draft({
          schedule: "seasonal",
          seasonStart: "03-01",
          seasonEnd: "03-01",
        }),
        null,
      ).season,
    ).toBe("A Season ends on another day than it starts.");
    expect(validateDraft(draft({ schedule: "always_open", endsOn: "3 March" }), null).endsOn).toBe("Pick an end date.");
  });
});

describe("the Pool's definitions", () => {
  it("previews the sources and hand-picked Optional Games only", () => {
    const d = draft({
      core: [{ game_id: 1, title: "FF" }],
      excluded: [{ game_id: 9, title: "Mobius" }],
      optional: [{ game_id: 5, title: "Bravely" }],
    });
    expect(sourcePreviewDefinition(d)).toEqual({
      franchise_ids: [12],
      collection_ids: [7],
      core_game_ids: [],
      optional_game_ids: [5],
      excluded_game_ids: [],
    });
    expect(poolDefinition(d)).toMatchObject({ core_game_ids: [1], excluded_game_ids: [9] });
  });

  it("removes a source", () => {
    expect(removeSource(draft(), ff).sources).toEqual([tactics]);
  });
});

describe("draftFromChallenge", () => {
  it("reads an existing Pool Challenge back into the form", () => {
    const challenge = {
      id: 3,
      name: "Winter of Dragon Quest",
      description: "From the first snow.",
      challenge_format: "pool",
      hosted_by_club: true,
      schedule: "seasonal",
      season: { start: "12-01", end: "02-28", crosses_new_year: true },
      ends_on: null,
      pool: {
        optional_target: 2,
        core_count: 1,
        franchises: [{ franchise_id: 4, name: "Dragon Quest" }],
        collections: [],
        core_games: [{ game_id: 3, title: "Dragon Quest III", cover_url: "c" }],
        optional_games: [
          { game_id: 1, title: "Slime Mori Mori", source: "hand", new: false },
          { game_id: 2, title: "Builders", source: "franchise", new: true },
        ],
        excluded_games: [],
        game_list: { id: 8, name: "Slimes", visible: true, can_add: true },
      },
    } as unknown as Challenge;
    expect(draftFromChallenge(challenge)).toMatchObject({
      format: "pool",
      name: "Winter of Dragon Quest",
      hostedByClub: true,
      schedule: "seasonal",
      seasonStart: "12-01",
      seasonEnd: "02-28",
      optionalTarget: 2,
      sources: [{ kind: "franchise", id: 4, name: "Dragon Quest" }],
      core: [{ game_id: 3, title: "Dragon Quest III", cover_url: "c" }],
      optional: [{ game_id: 1, title: "Slime Mori Mori", cover_url: null }],
      gameList: { id: 8, name: "Slimes" },
    });
    expect(draftFromChallenge(challenge).savedOptional).toHaveLength(2);
  });
});

// www#109: the Slots range rides with the rule fields.
describe("a Slots Challenge", () => {
  const slots = (over: Partial<ChallengeDraft> = {}) =>
    draft({ format: "slots", sources: [], slots: { first: "birth_year", last: "current_year", countsPastPlay: true }, ...over });

  it("creates with its range and Counts past play, and no Pool", () => {
    expect(createRequest(slots()).data).toEqual({
      name: "Fall of Final Fantasy",
      description: "Any Final Fantasy.",
      challenge_format: "slots",
      schedule: "always_open",
      season: null,
      ends_on: null,
      hosted_by_club: false,
      slots: { first_year: "birth_year", last_year: "current_year", counts_past_play: true },
    });
  });

  it("edits its range while no Run has started", () => {
    const body = editRequest(slots({ slots: { first: 1990, last: 1999, countsPastPlay: false } }), {
      locked: false,
      closedForGood: false,
    });
    expect(body.data.slots).toEqual({ first_year: 1990, last_year: 1999, counts_past_play: false });
  });

  it("needs no Pool, and checks its years", () => {
    expect(validateDraft(slots(), null, 2026)).toEqual({});
    expect(validateDraft(slots({ slots: { first: 2001, last: 1999, countsPastPlay: false } }), null, 2026)).toEqual({
      slotsFirst: "The first year can't come after the last year.",
    });
  });

  it("reads a saved Slots Challenge back", () => {
    const challenge = {
      id: 4,
      name: "Nineties Kid",
      description: "",
      challenge_format: "slots",
      hosted_by_club: false,
      schedule: "always_open",
      ends_on: null,
      slots: { first_year: 1990, last_year: 1999, counts_past_play: false },
    } as unknown as Challenge;
    expect(draftFromChallenge(challenge).slots).toEqual({ first: 1990, last: 1999, countsPastPlay: false });
  });
});
