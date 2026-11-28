import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  gotmHistoryHref,
  parseGotmHistoryFilters,
  type GotmHistoryFilters,
} from "@/lib/api/gotm-rounds";
import type { Game, GotmRound, GotmRoundBlock } from "@/lib/api/types";
import { GotmHistory } from "./gotm-history";

const FILTERS: GotmHistoryFilters = { kind: "both", year: null, sort: "desc", page: 1 };

function block(monthYear: string, titles: string[], nominations?: number): GotmRoundBlock {
  return {
    month_year: monthYear,
    voting_results_message_id: null,
    nominations_count: nominations,
    games: titles.map((title, i) => ({
      game_index: i,
      gamedb_game_id: 100 + i,
      reddit_url: null,
      thread_id: null,
      game: { title, art_url: `https://img.test/${i}.jpg`, cover_url: null } as unknown as Game,
    })),
  };
}

const R144: GotmRound = {
  round_number: 144,
  closed: true,
  gotm: block("November 2026", ["Resonance: A Plague Tale Legacy"], 4),
  nr_gotm: block("November 2026", ["Castlevania: Dominus Collection"], 4),
};
const R137: GotmRound = {
  round_number: 137,
  closed: true,
  gotm: block("April 2026", ["Avowed"], 4),
  nr_gotm: block("April 2026", [], 3),
};
const R120: GotmRound = {
  round_number: 120,
  closed: true,
  gotm: block("November 2024", ["Metaphor: ReFantazio"], 0),
  nr_gotm: block("November 2024", ["Astro Bot"]),
};

function render(
  rounds: GotmRound[] | null,
  filters: Partial<GotmHistoryFilters> = {},
  years: number[] = [2026, 2024],
) {
  const result = rounds && {
    rounds,
    meta: { page: 1, pages: 1, count: rounds.length, per: 10, prev: null, next: null, years },
  };
  return renderToStaticMarkup(
    <GotmHistory filters={{ ...FILTERS, ...filters }} result={result} badge={null} />,
  );
}

describe("GotmHistory", () => {
  it("links every round to its Round Page", () => {
    const html = render([R144, R137, R120]);
    expect(html).toContain('href="/gotm/144"');
    expect(html).toContain('href="/gotm/137"');
    expect(html).toContain('href="/gotm/120"');
  });

  it("carries the page's filters onto each Round Page link", () => {
    const html = render([R144], { kind: "gotm", year: 2026, page: 2 });
    expect(html).toContain('href="/gotm/144?kind=gotm&amp;year=2026&amp;page=2"');
  });

  it("shows the combined nominated count, and none before Nominations were recorded", () => {
    const html = render([R144, R120]);
    expect(html).toContain("8 nominated");
    expect(html.match(/nominated/g)).toHaveLength(1);
  });

  it("counts one Category's Nominations when narrowed to it", () => {
    const html = render([R137], { kind: "nr_gotm" });
    expect(html).toContain("No NR-GOTM winner");
    expect(html).toContain("3 nominated");
    expect(html).not.toContain("Avowed");
  });

  // The banner grid that follows the numeral and its tags.
  const MIXED = "sm:grid-cols-2";
  const ACROSS = "sm:grid-flow-col";

  it("sets the round numeral on the banners' corner, the month and nominated tag beside it", () => {
    const html = render([R144]);
    expect(html).toMatch(/<span data-slot="gotm-round-number" class="font-headline[^"]*sm:text-\[5\.75rem\][^"]*"><span class="sr-only">Round <\/span>144<\/span>/);
    expect(html).toContain("Nov 2026");
    expect(html.indexOf(">144<")).toBeLessThan(html.indexOf("8 nominated"));
    expect(html.indexOf("8 nominated")).toBeLessThan(html.indexOf("<h3"));
  });

  it("a GOTM-only round gives its one winner the full width, no empty NR-GOTM banner", () => {
    const html = render([R137]);
    expect(html).toContain("Avowed");
    expect(html.match(/<h3/g)).toHaveLength(1);
    expect(html).not.toContain("No NR-GOTM winner");
    expect(html).toContain("7 nominated");
    expect(html).toContain(ACROSS);
    expect(html).not.toContain(MIXED);
  });

  it("gives each winner of a GOTM-only round its own banner, side by side", () => {
    const html = render([{ ...R137, gotm: block("April 2026", ["Avowed", "Split Fiction"], 4) }]);
    expect(html.match(/<h3/g)).toHaveLength(2);
    expect(html).toMatch(/<h3[^>]*><span class="block">Avowed<\/span><\/h3>/);
    expect(html).toMatch(/<h3[^>]*><span class="block">Split Fiction<\/span><\/h3>/);
    expect(html).not.toContain("+ Split Fiction");
    expect(html).toContain(ACROSS);
    expect(html).not.toContain("No NR-GOTM winner");
  });

  it("an NR-GOTM-only round takes the width with its caption on the left", () => {
    const html = render([{ ...R137, gotm: block("April 2026", [], 2), nr_gotm: block("April 2026", ["Astro Bot"], 3) }]);
    expect(html).toContain("Astro Bot");
    expect(html).toContain("bg-nr");
    expect(html).not.toContain("No GOTM winner");
    expect(html).not.toContain("text-right");
    expect(html).toContain(ACROSS);
    expect(html).toContain("5 nominated");
  });

  it("splits a mixed round into halves, co-winners on the + line", () => {
    const html = render([{ ...R144, gotm: block("November 2026", ["Alpha", "Beta"], 4) }]);
    expect(html).toContain(MIXED);
    expect(html).not.toContain(ACROSS);
    expect(html.match(/<h3/g)).toHaveLength(2);
    expect(html).toContain("+ Beta");
    // NR-GOTM's caption sits right beside the rule, from sm up.
    expect(html).toContain("sm:text-right");
  });

  it("narrowed to one Category, gives each of its winners a banner, no + line", () => {
    const html = render([{ ...R144, gotm: block("November 2026", ["Alpha", "Beta"], 4) }], { kind: "gotm" });
    expect(html.match(/<h3/g)).toHaveLength(2);
    expect(html).not.toContain("+ Beta");
    expect(html).not.toContain("Castlevania");
    expect(html).toContain(ACROSS);
    expect(html).toContain("4 nominated");
  });

  it("does not link a round still being decided and tags it Deciding", () => {
    const html = render([{ ...R144, closed: false }, R137]);
    expect(html).not.toContain('href="/gotm/144"');
    expect(html).toContain('href="/gotm/137"');
    expect(html.match(/Deciding/g)).toHaveLength(1);
    // The tag runs beside the month, before the nominated tag.
    expect(html.indexOf("Deciding")).toBeLessThan(html.indexOf("8 nominated"));
  });

  it("heads every year group, the first one on page 1 included", () => {
    const html = render([R144, R137, R120]);
    expect(html).toMatch(/<h2[^>]*>2026<\/h2>/);
    expect(html).toMatch(/<h2[^>]*>2024<\/h2>/);
    expect(render([R144], { year: 2026 })).toMatch(/<h2[^>]*>2026<\/h2>/);
  });

  it("keeps the rows in the second column when the year rail has nothing to show", () => {
    const html = render([], {}, []);
    expect(html).not.toContain('aria-label="Year"');
    expect(html).toMatch(/class="[^"]*lg:col-start-2[^"]*"/);
  });

  it("breaks headlines at the subtitle colon", () => {
    expect(render([R120])).toMatch(/Metaphor:<\/span><span [^>]*class="[^"]*text-highlight[^"]*">ReFantazio/);
  });

  it("marks only the newest round's winners with the starburst, on the roll's first page", () => {
    const html = render([R144, R120]);
    expect(html.match(/<polygon/g)).toHaveLength(2);
    expect(render([R144, R120], { page: 2 })).not.toContain("<polygon");
    expect(render([R144, R120], { year: 2026 })).not.toContain("<polygon");
  });

  it("offers the Category switch and year rail but no search", () => {
    const html = render([R144], { kind: "gotm" });
    expect(html).toContain('aria-label="Category"');
    expect(html).toContain('aria-label="Year"');
    expect(html).toMatch(/<a aria-current="page"[^>]*href="\/gotm\?kind=gotm">/);
    expect(html).toContain('href="/gotm?kind=gotm&amp;year=2024"');
    expect(html).not.toContain('name="q"');
    expect(html).not.toContain("<input");
  });

  it("tells an outage from an empty archive", () => {
    expect(render(null)).toContain("Couldn&#x27;t load the GOTM history");
    expect(render([])).toContain("No GOTM rounds yet.");
    expect(render([], { year: 2019 })).toContain("No rounds match those filters.");
  });
});

describe("GOTM History filters", () => {
  it("ignores a search term in the URL and never sends one on", () => {
    const filters = parseGotmHistoryFilters({ q: "Silksong", kind: "gotm" });
    expect(filters).toEqual({ kind: "gotm", year: null, sort: "desc", page: 1 });
    expect(gotmHistoryHref(filters)).toBe("/gotm?kind=gotm");
  });
});
