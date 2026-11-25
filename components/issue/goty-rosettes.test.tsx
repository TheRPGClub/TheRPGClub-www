import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GameHero } from "@/components/issue/game-hero";
import type { GotyAwardWon } from "@/lib/api/goty";
import type { Game } from "@/lib/api/types";

const game = (over: Partial<Game> = {}): Game =>
  ({
    game_id: 1,
    title: "Starfall Covenant",
    description: null,
    igdb_url: null,
    cover_url: null,
    art_url: null,
    created_at: "",
    updated_at: "",
    ...over,
  }) as Game;

const hero = (over: Partial<Game>) => renderToStaticMarkup(<GameHero game={game(over)} />);
const awards = (...list: GotyAwardWon[]) => list;

describe("GameHero GOTY badge", () => {
  it("shows nothing for a game with no Awards", () => {
    const html = hero({ goty_awards: [] });
    expect(html).not.toContain('href="/goty"');
    expect(html).not.toContain("of the Year");
  });

  it("keeps the plain burst for a GOTM winner with no Award", () => {
    const html = hero({ gotm_won: true });
    expect(html).toContain("Month");
    expect(html).not.toContain('href="/goty"');
  });

  it("hangs one Award off the track burst, linked to /goty", () => {
    const html = hero({ nr_gotm_won: true, goty_awards: awards({ year: 2026, award: "nr_gotm" }) });
    expect(html.match(/href="\/goty"/g)).toHaveLength(1);
    expect(html).toContain('aria-label="NR-GOTM of the Year 2026, see the GOTY Vote"');
    expect(html).toContain("NR-GOTM of the Year<b");
  });

  it("shows each Award, Game of the Year in its own burst", () => {
    const html = hero({
      gotm_won: true,
      goty_awards: awards({ year: 2026, award: "gotm" }, { year: 2026, award: "game_of_the_year" }),
    });
    expect(html.match(/href="\/goty"/g)).toHaveLength(2);
    expect(html).toContain('aria-label="GOTM of the Year 2026, see the GOTY Vote"');
    expect(html).toContain('aria-label="Game of the Year 2026, see the GOTY Vote"');
    expect(html).toContain('<span class="block">Year</span>');
  });

  it("marks a Game of the Year that never won a month", () => {
    const html = hero({ goty_awards: awards({ year: 2026, award: "game_of_the_year" }) });
    expect(html.match(/href="\/goty"/g)).toHaveLength(1);
    expect(html).not.toContain("Month");
  });
});
