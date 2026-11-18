import { describe, expect, it } from "vitest";
import type { IsoDay } from "@/lib/challenges/dates";
import { editionClientProps } from "@/lib/challenges/edition-client";
import type { EditionPage } from "@/lib/challenges/edition-page";
import type { ChallengeEdition, EditionAssignment, EditionMember } from "@/lib/challenges/types";

// The guard on the Edition page's client props: what a client component
// receives reaches the browser, so the staff-served picks (who gives what to
// whom) must never be among them before their time, whoever is reading.

const member = (id: string, name: string): EditionMember => ({
  user_id: id,
  username: name.toLowerCase().replace(" ", "-"),
  global_name: name,
  left_out: false,
  withdrawn: false,
});

const VIEWER = member("1", "Night Owl");
const OTHER = member("2", "Lore Keeper");

// What staff are served from the draw on: every pick with its Santa.
const ASSIGNMENTS: EditionAssignment[] = [
  {
    recipient: VIEWER,
    game: { game_id: 10, title: "Lost Odyssey" },
    picked_randomly: false,
    santa: OTHER,
    run: { id: 1, status: "active", progress: { in_progress: 0, cleared: 0, target: 1 } },
  },
  {
    recipient: OTHER,
    game: { game_id: 20, title: "Chrono Trigger" },
    picked_randomly: false,
    santa: VIEWER,
    run: { id: 2, status: "active", progress: { in_progress: 0, cleared: 0, target: 1 } },
  },
];

const edition = (extra: Partial<ChallengeEdition> = {}): ChallengeEdition => ({
  id: 7,
  year: 2026,
  phase: "picking",
  challenge: { id: 2, name: "Secret Santa" },
  signup_opens_on: "2025-12-26",
  signup_cutoff_on: "2026-12-01",
  pick_deadline_on: "2026-12-15",
  reveal_on: "2026-12-25",
  ends_on: "2027-12-25",
  signup_open: false,
  signed_up_count: 2,
  signed_up: true,
  members: [VIEWER, OTHER],
  assignments: ASSIGNMENTS,
  viewer: { backlog_count: 12, eligible: true },
  ...extra,
});

type ShownPage = EditionPage & { edition: ChallengeEdition };

const page = (shown: ChallengeEdition, today: IsoDay, extra: Partial<Omit<EditionPage, "edition">> = {}): ShownPage => ({
  editions: [shown, edition({ id: 6, year: 2025, phase: "ended" })],
  edition: shown,
  newer: null,
  read: true,
  part: "drawn",
  santa: {
    edition_id: shown.id,
    recipient: OTHER,
    pick: { game: { game_id: 20, title: "Chrono Trigger" }, picked_randomly: false },
    picks_open: true,
  },
  calendar: { cutoff: "12-01", deadline: "12-15", reveal: "12-25" },
  viewerId: VIEWER.user_id,
  today,
  ...extra,
});

// Every key anywhere in a value.
function keysOf(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(keysOf);
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => [k, ...keysOf(v)]);
  }
  return [];
}

describe("editionClientProps", () => {
  it("gives a staff viewer's client props no Santa and not their own gift while Santas pick", () => {
    const props = editionClientProps(page(edition(), "2026-12-08"));
    const json = JSON.stringify(props);
    expect(keysOf(props)).not.toContain("santa");
    expect(keysOf(props)).not.toContain("assignments");
    expect(json).not.toContain("Lost Odyssey");
    // Their own pick, for the member they pick for, is theirs to see.
    expect(props.business.pickFor).toEqual({ recipient: "Lore Keeper", picked: "Chrono Trigger" });
  });

  it("names the viewer's own game from the reveal on, still without any Santa", () => {
    const props = editionClientProps(page(edition({ phase: "revealed" }), "2027-01-10", { santa: null }));
    expect(keysOf(props)).not.toContain("santa");
    expect(JSON.stringify(props)).not.toContain("Chrono Trigger");
    expect(props.business.yourGame).toBe("Lost Odyssey");
  });

  it("keeps the Santas off client props once the Edition ends, too", () => {
    const props = editionClientProps(page(edition({ phase: "ended" }), "2027-12-26", { santa: null }));
    expect(keysOf(props)).not.toContain("santa");
    expect(JSON.stringify(props)).not.toContain("lore-keeper");
  });

  it("hands the switcher only each Edition's id and year", () => {
    const props = editionClientProps(page(edition(), "2026-12-08"));
    expect(props.switcher).toEqual({
      challengeId: 2,
      current: 7,
      editions: [
        { id: 7, year: 2026 },
        { id: 6, year: 2025 },
      ],
    });
  });

  it("reads the viewer's backlog from the Edition while sign-up is open", () => {
    const signup = edition({
      phase: "signup",
      signup_open: true,
      signed_up: false,
      members: [OTHER],
      assignments: null,
      viewer: { backlog_count: 3, eligible: false },
    });
    const props = editionClientProps(page(signup, "2026-11-17", { part: "out", santa: null }));
    expect(props.business).toMatchObject({ phase: "signup", backlogCount: 3, eligible: false, signupOpen: true });
  });
});
