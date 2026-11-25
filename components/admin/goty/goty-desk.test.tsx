import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { GotyAward, GotyNomination, GotyVote } from "@/lib/api/goty";

vi.mock("@/app/actions/goty-desk", () => ({
  moveGotyDatesAction: vi.fn(),
  resolveGotyTieAction: vi.fn(),
  removeGotyNominationAction: vi.fn(),
}));

const { GotyDesk } = await import("./goty-desk");

const OPENS = Date.parse("2027-01-15T17:00:00Z");
const DAY = 86_400_000;

const award = (over: Partial<GotyAward> = {}): GotyAward => ({
  award: "game_of_the_year",
  name: "Game of the Year",
  ballot: [
    { game_id: 1, title: "Metaphor: ReFantazio" },
    { game_id: 2, title: "Clair Obscur" },
  ],
  cap: 1,
  runoff_ballot: [],
  pending_tie: [],
  own_votes: [],
  own_runoff_votes: [],
  tally: { counts_hidden: false, runoff_counts_hidden: false, games: [] },
  ...over,
});

const vote = (over: Partial<GotyVote> = {}): GotyVote => ({
  year: 2026,
  name: "GOTY Vote 2026",
  nominations_open_at: "2027-01-01T05:00:00Z",
  voting_opens_at: new Date(OPENS).toISOString(),
  voting_closes_at: "2027-01-18T04:59:59Z",
  phase: "nominating",
  nominations_open: true,
  voting_open: false,
  runoff_open: false,
  pending_ties: {},
  runoff_ties: {},
  awards: [award()],
  ...over,
});

const nomination: GotyNomination = {
  id: 9,
  year: 2026,
  user_id: "2",
  gamedb_game_id: 1,
  nominated_at: "2027-01-02T10:00:00Z",
  user: { user_id: "2", username: "mara", global_name: "Mara", is_bot: false, role_admin: false, role_moderator: false, role_regular: true },
  game: { game_id: 1, title: "Metaphor: ReFantazio" },
};

const render = (v: GotyVote, now: number) =>
  renderToStaticMarkup(
    <GotyDesk vote={v} years={[2026]} nominations={[nomination]} viewerId="1" viewerName="Admin" now={now} />,
  );

describe("GotyDesk", () => {
  it("while nominating: removable nominations, the nominations' opening locked", () => {
    const html = render(vote(), OPENS - 3 * DAY);
    expect(html).toContain("GOTY Vote 2026 · Nominations open · 1 nomination · voting opens in 3 days");
    expect(html).toContain("Remove the nomination of Metaphor: ReFantazio by Mara");
    expect(html).toContain("Save dates");
    expect(html).toContain("Nominations have opened, so their opening stays.");
    expect(html.match(/type="datetime-local"/g)).toHaveLength(3);
    expect(html.match(/disabled=""[^>]*type="datetime-local"|type="datetime-local"[^>]*disabled=""/g)).toHaveLength(1);
    expect(html).not.toContain("tie break");
  });

  it("before nominations open: every date open", () => {
    const html = render(vote({ phase: "upcoming", nominations_open: false }), Date.parse("2026-12-20T00:00:00Z"));
    expect(html).not.toMatch(/disabled=""[^>]*type="datetime-local"|type="datetime-local"[^>]*disabled=""/);
  });

  it("is keyed by year, so switching years starts the desk afresh", () => {
    const props = { years: [2026, 2025], nominations: [], viewerId: "1", viewerName: "Admin", now: OPENS };
    expect(GotyDesk({ vote: vote(), ...props }).key).toBe("2026");
    expect(GotyDesk({ vote: vote({ year: 2025 }), ...props }).key).toBe("2025");
  });

  it("while voting: the nominations are in and only the close moves", () => {
    const html = render(vote({ phase: "voting", voting_open: true, nominations_open: false }), OPENS + DAY);
    expect(html).not.toContain("Remove the nomination");
    expect(html).toContain("can no longer be removed");
    expect(html).toContain("only the close can move");
    expect(html.match(/disabled=""/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it("in a tie: a tie break for the tied Award", () => {
    const tied = award({ pending_tie: [1, 2], runoff_ballot: [1, 2] });
    const html = render(vote({ phase: "tie", pending_ties: { game_of_the_year: [1, 2] }, awards: [tied] }), OPENS + 5 * DAY);
    expect(html).toContain("Game of the Year tie break");
    expect(html).toContain("The runoff tied again.");
    expect(html).toContain("Pick the winner");
    expect(html).toContain("can&#x27;t move");
  });

  it("decided: the dates are history", () => {
    const html = render(vote({ phase: "decided", decided_at: "2027-01-18T05:00:00Z" }), OPENS + 9 * DAY);
    expect(html).toContain("is decided, so its dates are history");
    expect(html).not.toContain("Save dates");
    expect(html).toContain("Not given this year");
  });

  it("decided: names each winner and how it was decided", () => {
    const won = award({ winner: { gamedb_game_id: 2, decided_by: "admin", game: { game_id: 2, title: "Clair Obscur" } } });
    const html = render(vote({ phase: "decided", decided_at: "2027-01-18T05:00:00Z", awards: [won] }), OPENS + 9 * DAY);
    expect(html).toContain("Clair Obscur</span><span");
    expect(html).toContain("by an admin");
  });
});
