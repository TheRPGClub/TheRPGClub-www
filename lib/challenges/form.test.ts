import { describe, expect, it } from "vitest";

import {
  createRequest,
  draftFromChallenge,
  editRequest,
  emptyDraft,
  includeGame,
  poolDefinition,
  removeSource,
  toggleGame,
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
        target: 3,
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
          included_game_ids: [],
          excluded_game_ids: [],
          target: 3,
        },
      },
    });
  });

  it("sends an Always Open Challenge with its end date and no Season", () => {
    const body = createRequest(
      draft({
        schedule: "always_open",
        endsOn: "2027-03-03",
        target: "all",
        hostedByClub: true,
      }),
    );
    expect(body.data).toMatchObject({
      schedule: "always_open",
      season: null,
      ends_on: "2027-03-03",
      hosted_by_club: true,
    });
    expect(body.data.pool?.target).toBe("all");
  });

  it("keeps the games added and left out by hand", () => {
    const d = draft({
      included: [{ game_id: 5, title: "Bravely Default" }],
      excluded: [{ game_id: 9, title: "Mobius" }],
    });
    expect(createRequest(d).data.pool).toMatchObject({
      included_game_ids: [5],
      excluded_game_ids: [9],
    });
  });
});

describe("editRequest", () => {
  it("sends every setting while the rules are open", () => {
    const body = editRequest(draft({ target: 4 }), {
      locked: false,
      closedForGood: false,
    });
    expect(body.data).toMatchObject({
      name: "Fall of Final Fantasy",
      challenge_format: "pool",
      pool: { target: 4 },
    });
    expect(body.data).not.toHaveProperty("hosted_by_club");
  });

  it("sends only the name, description and end date once the rules are locked", () => {
    const body = editRequest(draft({ schedule: "always_open", endsOn: "2027-01-31" }), {
      locked: true,
      closedForGood: false,
    });
    expect(body).toEqual({
      data: {
        name: "Fall of Final Fantasy",
        description: "Any Final Fantasy.",
        ends_on: "2027-01-31",
      },
    });
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
    expect(validateDraft(draft(), 41)).toEqual({});
  });

  it("names what is missing", () => {
    const errors = validateDraft(draft({ name: " ", sources: [] }), null);
    expect(errors.name).toBe("Give the Challenge a name.");
    expect(errors.sources).toBe("Add a franchise, a collection or a game.");
  });

  it("refuses a target above the Pool's size or below one", () => {
    expect(validateDraft(draft({ target: 50 }), 41).target).toBe("The Pool has only 41 games.");
    expect(validateDraft(draft({ target: 0 }), 41).target).toBe("Clear at least 1 game.");
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

describe("the Pool's games", () => {
  it("previews the definition without the games left out, so they can be put back", () => {
    const d = draft({
      excluded: [{ game_id: 9, title: "Mobius" }],
      included: [{ game_id: 5, title: "Bravely" }],
    });
    expect(poolDefinition(d, { withExcluded: false })).toEqual({
      franchise_ids: [12],
      collection_ids: [7],
      included_game_ids: [5],
      excluded_game_ids: [],
    });
  });

  it("leaves a source's game out, puts it back, and drops a game added by hand", () => {
    const game = { game_id: 9, title: "Mobius" };
    const out = toggleGame(draft(), game);
    expect(out.excluded).toEqual([game]);
    expect(toggleGame(out, game).excluded).toEqual([]);
    const added = includeGame(draft(), { game_id: 5, title: "Bravely" });
    expect(toggleGame(added, { game_id: 5, title: "Bravely" }).included).toEqual([]);
  });

  it("adds a game by hand once, taking it off the left-out list", () => {
    const d = draft({ excluded: [{ game_id: 5, title: "Bravely" }] });
    const added = includeGame(includeGame(d, { game_id: 5, title: "Bravely" }), { game_id: 5, title: "Bravely" });
    expect(added.included).toHaveLength(1);
    expect(added.excluded).toEqual([]);
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
        target: 2,
        franchises: [{ franchise_id: 4, name: "Dragon Quest" }],
        collections: [],
        included_games: [{ game_id: 1, title: "Slime Mori Mori" }],
        excluded_games: [],
      },
    } as unknown as Challenge;
    expect(draftFromChallenge(challenge)).toMatchObject({
      format: "pool",
      name: "Winter of Dragon Quest",
      hostedByClub: true,
      schedule: "seasonal",
      seasonStart: "12-01",
      seasonEnd: "02-28",
      target: 2,
      sources: [{ kind: "franchise", id: 4, name: "Dragon Quest" }],
      included: [{ game_id: 1, title: "Slime Mori Mori" }],
    });
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
