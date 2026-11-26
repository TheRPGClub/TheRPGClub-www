import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { GotmHistoryFilters } from "@/lib/api/gotm-rounds";
import type { GotmRoundDetail } from "@/lib/api/types";
import type { DiscordLinkConfig } from "@/lib/gotm-links";
import { RoundPage } from "./round-page";
import { RoundPageSkeleton } from "./round-page-skeleton";
import {
  category,
  member,
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
function render(round: GotmRoundDetail | null, filters = noFilters, discord?: DiscordLinkConfig) {
  const html = renderToStaticMarkup(
    <RoundPage roundNumber={round?.round_number ?? 144} round={round} filters={filters} discord={discord} />,
  );
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
  return { html, text };
}

// The hero's layouts: a mixed round's halves, or one Category across.
const MIXED = "md:grid-cols-2";
const ACROSS = "md:grid-flow-col";

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

  it("says only 'Runoff' when no game in the runoff won", () => {
    const round = votedRound();
    const [castlevania] = round.nr_gotm.winners;
    round.nr_gotm.winners = [{ ...castlevania, nomination: { ...castlevania.nomination!, runoff_votes: null } }];
    const { text } = render(round);
    expect(text).not.toContain("Won in a runoff");
    expect(text).toContain("Runoff · 5");
  });

  it("names a game's other nominators under its nominator, reasons folded away", () => {
    const co = (name: string, reason: string | null) => ({
      user_id: `u-${name}`,
      user: member(name),
      reason,
      nominated_at: "2026-11-03T12:00:00Z",
    });
    const round = roundDetail({
      gotm: category({
        voted: true,
        winners: [winner("Avowed", nomination("Avowed", "turtle", { votes: 5 }))],
        nominations: [
          nomination("Split Fiction", "mask", {
            votes: 4,
            co_nominations: [co("jaguar", "Co-op night."), co("xergg", null)],
          }),
        ],
      }),
    });
    const { html, text } = render(round);
    expect(text).toContain("also nominated by jaguar and xergg");
    expect(html).toContain('href="/members/u-jaguar"');
    expect(html).toMatch(/<details[^>]*>[\s\S]*Their reasons[\s\S]*Co-op night\./);
    expect(text).toContain("4 votes");
  });

  it("links each winner's Reddit post and Discord thread and the Category's voting results", () => {
    const round = votedRound();
    round.gotm.winners[0] = { ...round.gotm.winners[0], reddit_url: "https://reddit.example/144", thread_id: "777" };
    round.gotm.voting_results_message_id = "888";
    round.nr_gotm = category({ voting_results_message_id: "999", nominations: [nomination("Split Fiction", "mask")] });
    const discord = { guildId: "1", announcementsChannelId: "2" };

    const { html } = render(round, noFilters, discord);
    expect(html).toContain('href="https://reddit.example/144"');
    expect(html).toContain('href="https://discord.com/channels/1/777"');
    expect(html).toContain('href="https://discord.com/channels/1/2/888"');
    // A Category nobody won still links its voting results.
    expect(html).toContain('href="https://discord.com/channels/1/2/999"');

    // Without the Discord config only Reddit shows.
    const plain = render(round).html;
    expect(plain).toContain('href="https://reddit.example/144"');
    expect(plain).not.toContain("discord.com");
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

  it("a Category nobody won spans the hero with the other; its column says so, with its Nominations", () => {
    const { html, text } = render(noWinnerRound());
    expect(text).toContain("No NR-GOTM winner this round");
    expect(text.match(/No NR-GOTM winner/g)).toHaveLength(1);
    expect(text).toContain("NR-GOTM · 2 nominees");
    expect(text).toContain("Split Fiction");
    expect(text).toContain("Death Stranding");
    expect(html).toContain(ACROSS);
    expect(html).not.toContain(MIXED);
    expect(html.match(/<article/g)).toHaveLength(1);
  });

  it("an NR-GOTM-only round spans the hero with its caption on the left", () => {
    const { html, text } = render(
      roundDetail({
        gotm: category({ winners: [], nominations: [nomination("Avowed", "turtle")] }),
        nr_gotm: category({ winners: [winner("Astro Bot", nomination("Astro Bot", "mask"))] }),
      }),
    );
    expect(text).toContain("Astro Bot");
    expect(text).toContain("GOTM · 1 nominee");
    expect(html.match(/<article/g)).toHaveLength(1);
    expect(html).toContain(ACROSS);
    expect(html).not.toMatch(/<article[\s\S]*text-right[\s\S]*<\/article>/);
  });

  it("gives each winner of a one-Category round its own full panel, side by side", () => {
    const { html, text } = render(
      roundDetail({
        gotm: category({ winners: [winner("Alpha", null, 1), winner("Beta", nomination("Beta", "xergg"), 0)] }),
        nr_gotm: category({ winners: [] }),
      }),
    );
    expect(order(text, "Beta", "Alpha")).toBe(true);
    expect(html.match(/<article/g)).toHaveLength(2);
    expect(html).toContain(ACROSS);
    expect(html).not.toContain(MIXED);
    expect(html).toContain("md:text-[2.5rem]");
    expect(html).not.toContain("md:text-[1.75rem]");
  });

  it("splits a mixed round into halves, co-winners stacked in their half", () => {
    const { html, text } = render(
      roundDetail({
        gotm: category({ winners: [winner("Alpha", null, 1), winner("Beta", nomination("Beta", "xergg"), 0)] }),
        nr_gotm: category({ winners: [winner("Astro Bot", null)] }),
      }),
    );
    expect(order(text, "Beta", "Alpha")).toBe(true);
    expect(html).toContain(MIXED);
    expect(html.match(/<article/g)).toHaveLength(3);
    expect(html).not.toContain(ACROSS);
    expect(html).toContain("md:text-[1.75rem]");
    // NR-GOTM's caption faces the rule from md up; a phone keeps it left.
    expect(html).toContain("md:text-right");
  });

  it("carries no numeral or month block in the hero: the heading says the round", () => {
    const { html } = render(votedRound());
    const hero = html.slice(html.indexOf("</header>"), html.indexOf('aria-labelledby="round-gotm"'));
    expect(hero).not.toContain("144");
    expect(hero).not.toContain("November");
    expect(html).toMatch(/<h1[^>]*>Round 144<span[^>]*><span[^>]*> · <\/span>November 2026<\/span><\/h1>/);
  });

  it("steps to neighbouring rounds and back to the history with its filters", () => {
    const filters: GotmHistoryFilters = { ...noFilters, kind: "gotm", year: 2026, page: 2 };
    const { html, text } = render(unvotedRound(), filters);
    expect(html).toContain('href="/gotm?kind=gotm&amp;year=2026&amp;page=2"');
    expect(html).toContain('href="/gotm/134?kind=gotm&amp;year=2026&amp;page=2"');
    expect(html).toContain('href="/gotm/136?kind=gotm&amp;year=2026&amp;page=2"');
    expect(text).toContain("Previous round");
    // The quick steps sit beside the heading, and under it on a phone.
    expect(html.match(/aria-label="Step through rounds"/g)).toHaveLength(2);
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
