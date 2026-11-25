import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { GotmHistoryFilters } from "@/lib/api/gotm-rounds";
import type { GotmRoundDetail } from "@/lib/api/types";
import { RoundPage } from "./round-page";
import { RoundPageSkeleton } from "./round-page-skeleton";
import {
  category,
  nomination,
  noWinnerRound,
  preNominationRound,
  roundDetail,
  unvotedRound,
  votedRound,
  winner,
} from "@/lib/gotm-round.fixtures";

const noFilters: GotmHistoryFilters = { kind: "both", year: null, sort: "desc", page: 1 };

// Static markup with entities decoded and tags stripped, for reading copy.
function render(round: GotmRoundDetail | null, filters = noFilters) {
  const html = renderToStaticMarkup(
    <RoundPage roundNumber={round?.round_number ?? 144} round={round} filters={filters} />,
  );
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
  return { html, text };
}

const order = (text: string, ...titles: string[]) =>
  titles.map((t) => text.lastIndexOf(t)).every((at, i, all) => at >= 0 && (i === 0 || at > all[i - 1]));

describe("RoundPage", () => {
  it("a voted round lists winners first, then by votes, with counts and a total", () => {
    const { text } = render(votedRound());
    expect(text).toContain("Round 144");
    expect(text).toContain("November 2026");
    expect(order(text, "Resonance: A Plague Tale Legacy", "Clair Obscur: Expedition 33", "Hollow Knight: Silksong", "Ghost of Yotei")).toBe(true);
    expect(text).toContain("GOTM · 4 nominees");
    expect(text).toContain("22 votes cast");
    expect(text).toMatch(/9 votes/);
    expect(text).toMatch(/Nominated by jaguar/);
  });

  it("a runoff adds the 'Won in a runoff' line with its counts", () => {
    const { text } = render(votedRound());
    expect(text).toContain("Won in a runoff · 6–5");
    expect(text).toContain("Castlevania: Dominus Collection and Kingdoms of the Dump tied on 5");
    expect(text).toContain("Runoff 6");
    expect(text).toContain("won runoff 6–5");
  });

  it("a round without a vote shows no counts, in nomination order", () => {
    const { text } = render(unvotedRound());
    expect(text).not.toMatch(/\bvotes?\b/);
    expect(text).not.toContain("runoff");
    expect(text).toContain("In nomination order");
    expect(order(text, "Kingdom Come: Deliverance II", "Avowed", "Dragon Quest VII Reimagined")).toBe(true);
  });

  it("shows the full reason and links a nominator, but not a placeholder one", () => {
    const { html, text } = render(unvotedRound());
    expect(text).toContain("Why Avowed.");
    expect(html).toContain('href="/members/u-turtle"');
    expect(text).toContain("Unknown member");
    expect(html).not.toContain("/members/poll-import");
  });

  it("a round before Nominations were recorded shows its winners and the note", () => {
    const { text } = render(preNominationRound());
    expect(text).toContain("Metaphor:");
    expect(text).toContain("Astro Bot");
    expect(text).toContain("Nominations weren't recorded for this round.");
    expect(text).not.toContain("Nominated by");
    expect(text).not.toContain("nominees");
  });

  it("a Category nobody won says so, with its Nominations", () => {
    const { text } = render(noWinnerRound());
    expect(text).toContain("No NR-GOTM winner this round");
    expect(text).toContain("2 nominated");
    expect(text).toContain("Split Fiction");
    expect(text).toContain("Death Stranding");
  });

  it("shows every co-winner", () => {
    const { text } = render(
      roundDetail({
        gotm: category({ winners: [winner("Alpha", null, 1), winner("Beta", nomination("Beta", "xergg"), 0)] }),
      }),
    );
    expect(order(text, "Beta", "Alpha")).toBe(true);
  });

  it("steps to neighbouring rounds and back to the history with its filters", () => {
    const filters: GotmHistoryFilters = { ...noFilters, kind: "gotm", year: 2026, page: 2 };
    const { html, text } = render(unvotedRound(), filters);
    expect(html).toContain('href="/gotm?kind=gotm&amp;year=2026&amp;page=2"');
    expect(html).toContain('href="/gotm/134?kind=gotm&amp;year=2026&amp;page=2"');
    expect(html).toContain('href="/gotm/136?kind=gotm&amp;year=2026&amp;page=2"');
    expect(text).toContain("Previous round");
  });

  it("the newest round has no next link", () => {
    const { html, text } = render(votedRound());
    expect(html).not.toContain('href="/gotm/145');
    expect(text).toContain("Newest round");
  });

  it("says so when the round couldn't be read", () => {
    const { html, text } = render(null);
    expect(text).toContain("Couldn't load this round.");
    expect(html).toContain('href="/gotm"');
  });

  it("has a loading skeleton", () => {
    expect(renderToStaticMarkup(<RoundPageSkeleton />)).toContain('data-slot="skeleton"');
  });
});
