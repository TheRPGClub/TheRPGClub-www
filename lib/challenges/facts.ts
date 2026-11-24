import { formatDay, formatFullDay, seasonAround, seasonRange, type IsoDay } from "@/lib/challenges/dates";
import { memberAvatar, memberName } from "@/lib/challenges/runs";
import { optionalSourcesLine } from "@/lib/challenges/pool-wall";
import type { Challenge, PoolGame } from "@/lib/challenges/types";

// What a Challenge page says about its rules: the banner's chip and the fact
// list beside the rules (surface brief challenges-pool). Pure, client-safe.

export function hostName(challenge: Pick<Challenge, "hosted_by_club" | "host">): string {
  if (challenge.hosted_by_club || !challenge.host) return "The RPG Club";
  return memberName(challenge.host);
}

// The Host's Discord avatar, when the API sends it; null for the club and
// for the initials mark.
export function hostAvatar(challenge: Pick<Challenge, "hosted_by_club" | "host">): string | null {
  return challenge.hosted_by_club || !challenge.host ? null : memberAvatar(challenge.host);
}

// The banner's tint chip: "Season 2026 · 22 Sep – 20 Dec", "Always Open",
// or, while Closed, when it opens again.
export function scheduleChip(challenge: Challenge, today: IsoDay): string {
  if (challenge.schedule === "seasonal" && challenge.season) {
    const window = seasonAround(challenge.season, today);
    if (!challenge.open) return `Closed · opens ${formatFullDay(window.starts)}`;
    return `Season ${window.starts.slice(0, 4)} · ${seasonRange(challenge.season)}`;
  }
  if (!challenge.open) return challenge.ends_on ? `Closed · ended ${formatDay(challenge.ends_on, today)}` : "Closed";
  return "Always Open";
}

export interface Fact {
  term: string;
  detail: string;
}

const games = (n: number, kind: "Core" | "Optional") => `${n} ${kind} ${n === 1 ? "Game" : "Games"}`;

// What Finishes a Pool Run (spec api#442): "Clear all 14 Core Games and 2
// Optional Games", "Clear the 1 Core Game", "Clear 3 Optional Games".
export function finishLine(challenge: Pick<Challenge, "pool">): string | null {
  const pool = challenge.pool;
  if (!pool) return null;
  const core = pool.core_count ?? pool.core_games?.length ?? 0;
  const target = pool.optional_target ?? 0;
  const corePart = core === 1 ? "the 1 Core Game" : `all ${games(core, "Core")}`;
  if (core === 0) return `Clear ${games(target, "Optional")}`;
  return target > 0 ? `Clear ${corePart} and ${games(target, "Optional")}` : `Clear ${corePart}`;
}

// "14 Core · 12 Optional · from the Final Fantasy Franchise and the Final
// Fantasy VII Series", the sources named as members know them.
export function poolLine(challenge: Pick<Challenge, "pool">): string | null {
  const pool = challenge.pool;
  if (!pool) return null;
  const core = pool.core_count ?? pool.core_games?.length ?? 0;
  const optional = pool.optional_count ?? pool.optional_games?.length ?? null;
  const sources = optionalSourcesLine(pool);
  return [`${core} Core`, optional != null ? `${optional} Optional` : null, sources && sources.replace(/^From/, "from")]
    .filter(Boolean)
    .join(" · ");
}

export function challengeFacts(challenge: Challenge, today: IsoDay): Fact[] {
  const facts: Fact[] = [{ term: "Host", detail: hostName(challenge) }];
  if (challenge.schedule === "seasonal" && challenge.season) {
    facts.push({
      term: "Season",
      detail: `${seasonRange(challenge.season)}, every year`,
    });
  } else {
    facts.push({
      term: "Open",
      detail: challenge.ends_on ? `Any time until ${formatDay(challenge.ends_on, today)}` : "Any time",
    });
  }
  const finish = finishLine(challenge);
  if (finish) facts.push({ term: "Finish", detail: finish });
  const pool = poolLine(challenge);
  if (pool) facts.push({ term: "Pool", detail: pool });
  return [...facts, ...slotsFacts(challenge)];
}

// A Slots range in words: "Your birth year to now", "1990 to 1999".
function slotsRange(slots: NonNullable<Challenge["slots"]>, birth: string, now: string): string {
  const first = slots.first_year === "birth_year" ? birth : String(slots.first_year);
  const last = slots.last_year === "current_year" ? now : String(slots.last_year);
  return `${first} to ${last}`;
}

function slotsFacts(challenge: Pick<Challenge, "challenge_format" | "slots">): Fact[] {
  const slots = challenge.slots;
  if (challenge.challenge_format !== "slots" || !slots) return [];
  const growing = slots.last_year === "current_year";
  const fixed = typeof slots.first_year === "number" && !growing;
  const count = fixed ? (slots.last_year as number) - (slots.first_year as number) + 1 : 0;
  const facts: Fact[] = [
    { term: "Years", detail: `${slotsRange(slots, "Your birth year", "now")}, one game each` },
    {
      term: "Finish",
      detail: growing
        ? "Clear every year to be Caught Up; a year opens every 1 January"
        : fixed
          ? `Clear all ${count} years`
          : "Clear every year",
    },
  ];
  if (slots.counts_past_play) {
    facts.push({
      term: "Past play",
      detail: "Counts: pick a Game Completion from before your Run for an open year",
    });
  }
  return facts;
}

// The banner's extra chips on a Slots Challenge: "Counts past play" and its
// range ("Birth year to now").
export function slotsChips(challenge: Pick<Challenge, "challenge_format" | "slots">): string[] {
  const slots = challenge.slots;
  if (challenge.challenge_format !== "slots" || !slots) return [];
  return [slots.counts_past_play ? "Counts past play" : null, slotsRange(slots, "Birth year", "now")].filter(
    (chip): chip is string => chip !== null,
  );
}

// The banner's art: the Challenge's key art (the API's pick from its Pool),
// else the first Pool game with art, else its cover. Null draws the Format's
// picture in the tint.
export function bannerArt(challenge: Pick<Challenge, "key_art_url">, games: readonly PoolGame[]): string | null {
  if (challenge.key_art_url) return challenge.key_art_url;
  return games.find((g) => g.art_url)?.art_url ?? games.find((g) => g.cover_url)?.cover_url ?? null;
}
