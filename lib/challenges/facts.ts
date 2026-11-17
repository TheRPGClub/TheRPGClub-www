import { formatDay, formatFullDay, seasonAround, seasonRange, type IsoDay } from "@/lib/challenges/dates";
import { memberAvatar, memberName } from "@/lib/challenges/runs";
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

export function finishLine(challenge: Pick<Challenge, "pool">): string | null {
  const target = challenge.pool?.target;
  if (target == null) return null;
  if (target === "all") return "Clear every game in the Pool";
  return `Clear ${target} ${target === 1 ? "game" : "games"} from the Pool`;
}

// "Final Fantasy franchise · 41 games", naming every source and the games
// added by hand.
export function poolLine(challenge: Pick<Challenge, "pool">, gameCount: number | null): string | null {
  const pool = challenge.pool;
  if (!pool) return null;
  const parts = [
    ...(pool.franchises ?? []).map((f) => `${f.name} franchise`),
    ...(pool.collections ?? []).map((c) => `${c.name} collection`),
  ];
  const added = pool.included_games?.length ?? 0;
  if (added) parts.push(`${added} added`);
  const count = gameCount ?? pool.game_count;
  return [parts.join(", "), count != null ? `${count} ${count === 1 ? "game" : "games"}` : null]
    .filter(Boolean)
    .join(" · ");
}

export function challengeFacts(challenge: Challenge, today: IsoDay, gameCount: number | null): Fact[] {
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
  const pool = poolLine(challenge, gameCount);
  if (pool) facts.push({ term: "Pool", detail: pool });
  return facts;
}

// The banner's art: the Challenge's key art (the API's pick from its Pool),
// else the first Pool game with art, else its cover. Null draws the Format's
// picture in the tint.
export function bannerArt(challenge: Pick<Challenge, "key_art_url">, games: readonly PoolGame[]): string | null {
  if (challenge.key_art_url) return challenge.key_art_url;
  return games.find((g) => g.art_url)?.art_url ?? games.find((g) => g.cover_url)?.cover_url ?? null;
}
