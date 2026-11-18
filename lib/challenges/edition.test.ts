import { describe, expect, it } from "vitest";
import {
  editionCounts,
  editionDoors,
  editionNumerals,
  editionRefusal,
  leftOutLine,
  pickEdition,
  yourPart,
} from "@/lib/challenges/edition";
import type { ChallengeEdition, EditionAssignment, EditionMember } from "@/lib/challenges/types";

const member = (id: string, name: string, extra: Partial<EditionMember> = {}): EditionMember => ({
  user_id: id,
  username: name.toLowerCase(),
  global_name: name,
  left_out: false,
  withdrawn: false,
  ...extra,
});

const MEMBERS = [member("1", "Night Owl"), member("2", "Dice Goblin"), member("3", "Couch Coop", { left_out: true })];

const edition = (extra: Partial<ChallengeEdition> = {}): ChallengeEdition => ({
  id: 7,
  year: 2026,
  phase: "signup",
  challenge: { id: 2, name: "Secret Santa" },
  signup_opens_on: "2025-12-26",
  signup_cutoff_on: "2026-12-01",
  pick_deadline_on: "2026-12-15",
  reveal_on: "2026-12-25",
  ends_on: "2027-12-25",
  signup_open: true,
  signed_up_count: 3,
  signed_up: false,
  members: MEMBERS,
  ...extra,
});

const assignment = (recipient: EditionMember, extra: Partial<EditionAssignment> = {}): EditionAssignment => ({
  recipient,
  game: { game_id: Number(recipient.user_id) * 10, title: `Game ${recipient.user_id}` },
  picked_randomly: false,
  santa: null,
  run: { id: Number(recipient.user_id), status: "active", progress: { in_progress: 0, cleared: 0, target: 1 } },
  ...extra,
});

describe("yourPart", () => {
  it("reads the viewer's place in the Edition", () => {
    expect(yourPart(edition(), "9")).toBe("out");
    expect(yourPart(edition({ signed_up: true }), "1")).toBe("signed-up");
    expect(yourPart(edition({ phase: "picking" }), "1")).toBe("drawn");
    expect(yourPart(edition({ phase: "picking" }), "3")).toBe("left-out");
    const withdrew = [member("1", "Night Owl", { withdrawn: true })];
    expect(yourPart(edition({ phase: "picking", members: withdrew }), "1")).toBe("withdrawn");
  });
});

describe("editionNumerals", () => {
  it("counts days to sign up and members signed up", () => {
    expect(editionNumerals(edition(), "2026-11-17")).toEqual([
      { value: 14, label: "Days to sign up", hi: true },
      { value: 3, label: "Signed up" },
    ]);
  });

  it("counts days to pick and the members drawn while picks are secret", () => {
    expect(editionNumerals(edition({ phase: "picking" }), "2026-12-08")).toEqual([
      { value: 7, label: "Days to pick", hi: true },
      { value: 2, label: "Drawn" },
    ]);
  });

  it("counts the picks made when staff can see them", () => {
    const assignments = [assignment(MEMBERS[0]), assignment(MEMBERS[1], { game: null })];
    expect(editionNumerals(edition({ phase: "picking", assignments }), "2026-12-08")[1]).toEqual({
      value: 1,
      label: "Picked",
    });
  });

  it("counts the picks from the API's picked_count, for every member", () => {
    const picking = edition({ phase: "picking", picked_count: 1 });
    expect(editionNumerals(picking, "2026-12-08")[1]).toEqual({ value: 1, label: "Picked" });
  });

  it("counts down to the reveal once picks are closed", () => {
    const closed = edition({ phase: "picking", picks_closed_at: "2026-12-15T05:00:00Z" });
    expect(editionNumerals(closed, "2026-12-20")[0]).toEqual({ value: 5, label: "Days to the reveal", hi: true });
  });

  it("counts Finished and In Progress after the reveal, Finished and Expired at the end", () => {
    const assignments = [
      assignment(MEMBERS[0], { run: { id: 1, status: "finished", progress: { cleared: 1 } } }),
      assignment(MEMBERS[1], { run: { id: 2, status: "active", progress: { in_progress: 1 } } }),
    ];
    expect(editionNumerals(edition({ phase: "revealed", assignments }), "2027-03-03")).toEqual([
      { value: 1, label: "Finished", hi: true },
      { value: 1, label: "In Progress" },
    ]);
    const ended = assignments.map((a, i) => (i === 1 ? { ...a, run: { ...a.run!, status: "expired" as const } } : a));
    expect(editionNumerals(edition({ phase: "ended", assignments: ended }), "2027-12-26")).toEqual([
      { value: 1, label: "Finished", hi: true },
      { value: 1, label: "Expired" },
    ]);
  });
});

describe("editionDoors", () => {
  it("seats every member signed up, and offers the viewer's door while they can join", () => {
    const { doors, yourSeat } = editionDoors(edition(), "9", "2026-11-17");
    expect(doors.map((d) => [d.number, d.name, d.state])).toEqual([
      [1, "Night Owl", "seat"],
      [2, "Dice Goblin", "seat"],
      [3, "Couch Coop", "seat"],
    ]);
    expect(yourSeat).toBe(true);
    expect(editionDoors(edition({ signed_up: true }), "1", "2026-11-17").yourSeat).toBe(false);
    expect(editionDoors(edition({ signup_open: false }), "9", "2026-12-01").yourSeat).toBe(false);
  });

  it("keeps only the members drawn while picking, without saying who picks for whom", () => {
    const { doors } = editionDoors(edition({ phase: "picking" }), "1", "2026-12-08");
    expect(doors.map((d) => [d.name, d.state, d.caption, d.mine])).toEqual([
      ["Night Owl", "drawn", null, true],
      ["Dice Goblin", "drawn", null, false],
    ]);
  });

  it("seals a door whose Santa picked, when the picks can be seen", () => {
    const assignments = [assignment(MEMBERS[0]), assignment(MEMBERS[1], { game: null })];
    const { doors } = editionDoors(edition({ phase: "picking", assignments }), "1", "2026-12-08");
    expect(doors.map((d) => [d.state, d.caption, d.game])).toEqual([
      ["picked", "Picked for", null],
      ["waiting", "Waiting", null],
    ]);
  });

  it("seals a door from the member's picked flag, without the picks themselves", () => {
    const members = [member("1", "Night Owl", { picked: true }), member("2", "Dice Goblin", { picked: false })];
    const { doors } = editionDoors(edition({ phase: "picking", members, picked_count: 1 }), "1", "2026-12-08");
    expect(doors.map((d) => [d.state, d.caption, d.game])).toEqual([
      ["picked", "Picked for", null],
      ["waiting", "Waiting", null],
    ]);
  });

  it("seals every door once picks are closed", () => {
    const closed = edition({ phase: "picking", picks_closed_at: "2026-12-15T05:00:00Z" });
    expect(editionDoors(closed, "1", "2026-12-20").doors.every((d) => d.state === "picked")).toBe(true);
  });

  it("opens each door on its game after the reveal, in sign-up order", () => {
    const assignments = [
      assignment(MEMBERS[1], { picked_randomly: true }),
      assignment(MEMBERS[0], { run: { id: 1, status: "finished", progress: {} } }),
    ];
    const { doors } = editionDoors(edition({ phase: "revealed", assignments }), "1", "2027-03-03");
    expect(doors.map((d) => [d.name, d.state, d.game?.title, d.tag?.label ?? null, d.foot])).toEqual([
      ["Night Owl", "open", "Game 1", "Finished", null],
      ["Dice Goblin", "open", "Game 2", null, "Random pick"],
    ]);
  });

  it("keeps Santas off the doors until the Edition ends, even when staff are served them", () => {
    const assignments = [
      assignment(MEMBERS[0], { santa: MEMBERS[1], run: { id: 1, status: "active", progress: { in_progress: 1 } } }),
      assignment(MEMBERS[1], { santa: MEMBERS[0], picked_randomly: true }),
    ];
    const { doors } = editionDoors(edition({ phase: "revealed", assignments }), "1", "2027-03-03");
    expect(doors.map((d) => [d.foot, d.tag?.label ?? null])).toEqual([
      [null, "In Progress"],
      ["Random pick", null],
    ]);
  });

  it("reads a hidden random-pick flag (null) as no random pick", () => {
    const assignments = [assignment(MEMBERS[0], { picked_randomly: null })];
    const { doors } = editionDoors(edition({ phase: "revealed", assignments }), "1", "2027-01-10");
    expect(doors[0].foot).toBeNull();
  });

  it("signs each door with its Santa when the Edition ends", () => {
    const assignments = [
      assignment(MEMBERS[0], { santa: MEMBERS[1], run: { id: 1, status: "expired", progress: {} } }),
      assignment(MEMBERS[1], { santa: MEMBERS[0], picked_randomly: true }),
    ];
    const { doors } = editionDoors(edition({ phase: "ended", assignments }), "1", "2027-12-26");
    expect(doors.map((d) => [d.foot, d.tag?.label ?? null])).toEqual([
      ["From Dice Goblin", "Expired"],
      ["Random pick\nSanta: Night Owl", null],
    ]);
  });
});

describe("editionCounts and leftOutLine", () => {
  it("names the members the draw left out", () => {
    expect(editionCounts(edition({ phase: "picking" })).drawn).toBe(2);
    expect(leftOutLine(edition({ phase: "picking" }))).toBe(
      "Couch Coop was left out: under 5 games in their backlog at the draw.",
    );
    expect(leftOutLine(edition({ members: MEMBERS.slice(0, 2) }))).toBeNull();
  });
});

describe("pickEdition", () => {
  const next = edition({ id: 8, year: 2027, signup_cutoff_on: "2027-12-01" });
  const last = edition({ id: 7, phase: "revealed" });

  it("shows the Edition asked for", () => {
    expect(pickEdition([next, last], 7, "2027-11-20")?.id).toBe(7);
  });

  it("shows last year's games while the next sign-up is far off, and the sign-up as it nears", () => {
    expect(pickEdition([next, last], null, "2027-03-03")?.id).toBe(7);
    expect(pickEdition([next, last], null, "2027-11-20")?.id).toBe(8);
    expect(pickEdition([next, last], 99, "2027-11-20")?.id).toBe(8);
    expect(pickEdition([], null, "2027-11-20")).toBeNull();
  });
});

describe("editionRefusal", () => {
  it("says how many games a member is short", () => {
    expect(editionRefusal({ status: 422, code: "backlog_too_small", body: { error: "backlog_too_small", minimum: 5, backlog_count: 3 } })).toBe(
      "You need at least 5 games in your backlog to sign up (you have 3).",
    );
  });

  it("shows the API's own words, else a sentence per code", () => {
    expect(editionRefusal({ status: 409, code: "signup_closed", message: "Sign-up closed on 1 December 2026." })).toBe(
      "Sign-up closed on 1 December 2026.",
    );
    expect(editionRefusal({ status: 409, code: "picks_closed" })).toMatch(/Picks have closed/);
    expect(editionRefusal({ status: 401 })).toMatch(/Sign in again/);
    expect(editionRefusal({ status: 500 })).toMatch(/Try again/);
  });
});
