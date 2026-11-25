import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { gotyVote, nomination } from "@/lib/goty/test-fixtures";
import type { GotyVote } from "@/lib/goty/types";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/app/actions/goty", () => ({
  nominateGotyAction: vi.fn(),
  withdrawGotyAction: vi.fn(),
  replaceGotyAction: vi.fn(),
  castGotyVoteAction: vi.fn(),
  gotyEligibilityAction: vi.fn(async () => ({})),
}));

const { GotyPage } = await import("./goty-page");

const NOW = Date.parse("2027-01-16T17:00:00Z");

function render(current: GotyVote | null, { history = [] as GotyVote[], nominations = [] as ReturnType<typeof nomination>[] } = {}) {
  return renderToStaticMarkup(<GotyPage data={{ current, nominations, history, now: NOW }} viewerId="me" badge={null} />);
}

describe("GotyPage", () => {
  it("says there is no GOTY Vote yet", () => {
    expect(render(null)).toContain("No GOTY Vote yet");
  });

  it("upcoming: the countdown and the three Awards", () => {
    const html = render(gotyVote({ phase: "upcoming", voting_open: false }), {});
    expect(html).toContain("until nominations open");
    expect(html).toContain("Every GOTM winner from the 2026 rounds");
    expect(html).toContain("Members nominate up to 3 games first released in 2026");
    expect(html).not.toContain("Reminder");
  });

  it("nominating: the viewer's hand, the search and every nomination, no reasons", () => {
    const html = render(gotyVote({ phase: "nominating", nominations_open: true, voting_open: false }), {
      nominations: [nomination(1, 10, "me", "Rowan"), nomination(2, 11, "a", "Tavi")],
    });
    expect(html).toContain("Your three for Game of the Year");
    expect(html).toContain("1 of 3");
    expect(html).toContain("Open slot");
    expect(html).toContain('aria-label="Search games"');
    expect(html).toContain("2 games so far");
    expect(html).toContain("Your pick");
    expect(html).not.toMatch(/reason/i);
  });

  it("voting: the envelopes and the Game of the Year ballot with Vote buttons", () => {
    const html = render(gotyVote({}, { game_of_the_year: { own_votes: [1], cap: 2 } }));
    expect(html).toContain('role="tablist"');
    expect(html).toContain("your votes");
    expect(html).toContain("Vote for up to");
    expect(html).toContain('aria-label="Voted: Game 1"');
    expect(html).toContain('aria-label="Vote: Game 2"');
    expect(html).toContain("Next: GOTM of the Year");
  });

  it("voting: an uncontested Award has nothing to vote on", () => {
    const html = render(gotyVote({}, { game_of_the_year: { ballot: [{ game_id: 9, title: "Quiet Moon" }] } }));
    expect(html).toContain("Uncontested");
    expect(html).toContain("There is nothing to vote on here.");
  });

  it("runoff: only the tied games, one vote each", () => {
    const html = render(
      gotyVote(
        { phase: "runoff", voting_open: false, runoff_open: true, runoff_opens_at: "2027-01-18T05:00:00Z", runoff_closes_at: "2027-01-19T04:59:59Z" },
        {
          gotm: { winner: { gamedb_game_id: 1, decided_by: "vote", game: { game_id: 1, title: "Game 1" } } },
          nr_gotm: { winner: { gamedb_game_id: 2, decided_by: "vote", game: { game_id: 2, title: "Game 2" } } },
          game_of_the_year: {
            runoff_ballot: [3, 4],
            pending_tie: [3, 4],
            tally: { counts_hidden: false, runoff_counts_hidden: true, games: [{ gamedb_game_id: 3, votes: 11, runoff_votes: 0 }, { gamedb_game_id: 4, votes: 11, runoff_votes: 0 }] },
          },
        },
      ),
    );
    expect(html).toContain("Hours of runoff left");
    expect(html).toContain("Tied");
    expect(html).toContain('aria-label="Vote: Game 3"');
    expect(html).not.toContain('aria-label="Vote: Game 1"');
    expect(html).toContain("Decided: Game 1");
  });

  it("decided: a cover story per Award with its tally, and the year in the history", () => {
    const won = { winner: { gamedb_game_id: 1, decided_by: "vote" as const, game: { game_id: 1, title: "Game 1" } }, result: [{ gamedb_game_id: 1, votes: 14, runoff_votes: 0, voters: [] }, { gamedb_game_id: 2, votes: 3, runoff_votes: 0, voters: [] }] };
    const vote = gotyVote({ phase: "decided", voting_open: false, decided_at: "2027-01-19T06:00:00Z" }, { gotm: won, nr_gotm: { ballot: [] }, game_of_the_year: won });
    const html = render(vote, { history: [vote] });
    expect(html).toContain("GOTM of the Year 2026");
    expect(html).toContain("Final tally · top 2 of 4");
    expect(html).toContain("won by vote");
    expect(html).toContain("NR-GOTM of the Year 2026 was not given");
    expect(html).toContain("Winners by year");
    expect(html).toContain("No candidates that year.");
  });
});
