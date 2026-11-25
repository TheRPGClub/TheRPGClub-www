import { discordAvatarUrl } from "@/lib/auth-types";
import type { FranchiseProgressGame, FranchiseProgressMember, FranchiseProgressMeters } from "./types";

// The Progress tab's maths (design pick 1E with 1E1, spec api#457).
// Client-safe.

export interface DialSegment {
  // An SVG path: one arc of the upward semicircle.
  d: string;
  // A game done (paper) or still to do.
  on: boolean;
}

export interface Dial {
  width: number;
  height: number;
  cx: number;
  cy: number;
  r: number;
  // No games in the meter: one dashed arc instead of segments.
  empty: boolean;
  segments: DialSegment[];
}

// An upward semicircle with one segment per game, left to right, the done
// ones first. Segments sit a small gap apart (narrower as games grow); the
// ends meet the baseline. `stroke` is the widest stroke the dial is drawn
// with, so the arc and its stroke always fit the box.
export function dialArcs(done: number, total: number, geo: { width: number; stroke: number }): Dial {
  const { width, stroke } = geo;
  const r = (width - stroke) / 2 - 2;
  const cx = width / 2;
  const cy = r + stroke / 2 + 2;
  const height = Math.ceil(cy + 2);
  const pt = (a: number) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy - r * Math.sin(a)).toFixed(2)}`;
  const arc = (a0: number, a1: number) => `M ${pt(a0)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${pt(a1)}`;
  const base = { width, height, cx, cy, r };
  if (!(total > 0)) return { ...base, empty: true, segments: [{ d: arc(Math.PI, 0), on: false }] };

  const lit = clampDone(done, total);
  const step = Math.PI / total;
  const gap = total > 1 ? Math.min(0.05, 0.45 / total) : 0;
  const segments = Array.from({ length: total }, (_, i) => {
    const a0 = Math.PI - i * step - (i > 0 ? gap / 2 : 0);
    const a1 = Math.PI - (i + 1) * step + (i < total - 1 ? gap / 2 : 0);
    return { d: arc(a0, a1), on: i < lit };
  });
  return { ...base, empty: false, segments };
}

// Games done, kept within 0 and the meter's total (a count that runs past it
// fills the meter, never more).
export function clampDone(done: number, total: number): number {
  return Math.min(Math.max(done, 0), Math.max(total, 0));
}

// A whole percent, or null for an empty meter. It reads 100 only when every
// game is done, and at least 1 once one is.
export function dialPercent(rawDone: number, total: number): number | null {
  if (!(total > 0)) return null;
  const done = clampDone(rawDone, total);
  const pct = Math.round((done / total) * 100);
  if (done < total && pct >= 100) return 99;
  if (done > 0 && pct === 0) return 1;
  return pct;
}

const hours = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });

// Playtime in whole hours ("1,640 h"); a few minutes read "<1 h".
export function formatPlaytime(minutes: number): string {
  if (minutes > 0 && minutes < 30) return "<1 h";
  return `${hours.format(Math.round(Math.max(minutes, 0) / 60))} h`;
}

export type CoverState = "done" | "played" | "unplayed";

// A cover on the wall: full colour with a Game Completion, grey with
// Playtime but none, darker grey never played.
export function coverState(game: Pick<FranchiseProgressGame, "done" | "playtime_minutes">): CoverState {
  if (game.done) return "done";
  return game.playtime_minutes > 0 ? "played" : "unplayed";
}

// The Playtime tag on a cover's foot. `quiet` tags are label caps.
export function playtimeTag(game: Pick<FranchiseProgressGame, "done" | "playtime_minutes">): { text: string; quiet: boolean } {
  if (game.playtime_minutes > 0) return { text: formatPlaytime(game.playtime_minutes), quiet: false };
  return { text: game.done ? "No Playtime" : "Not played", quiet: true };
}

// The meter members are ranked by: Mainline, or everything when the
// Franchise has no Mainline games.
export function rankMeter(meters: FranchiseProgressMeters): "mainline" | "all" {
  return meters.mainline.total > 0 ? "mainline" : "all";
}

// The Progress tab's count: the viewer's ranking meter as "11/16".
export function progressTabCount(meters: FranchiseProgressMeters): string {
  const m = meters[rankMeter(meters)];
  return `${m.done}/${m.total}`;
}

export interface RankedMember {
  rank: number;
  member: FranchiseProgressMember;
}

// The members table's two groups, in the API's order, ranked straight
// through: Conquered (in the order they Conquered), then still going.
export function memberGroups(members: FranchiseProgressMember[]): { conquered: RankedMember[]; going: RankedMember[] } {
  const ranked = members.map((member, i) => ({ rank: i + 1, member }));
  return {
    conquered: ranked.filter((r) => r.member.conquered_at),
    going: ranked.filter((r) => !r.member.conquered_at),
  };
}

// "Mar 2025", the Conquered stamp's date.
export function monthYear(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
}

// A member as the table and the swap bar name them: global_name, then
// username, then the Discord id (the API's rule).
export function progressMemberName(user: { user_id: string; global_name: string | null; username: string | null }): string {
  return user.global_name || user.username || user.user_id;
}

// A member's picture in the table and the dials: their Discord avatar from
// its hash, else the one the bot stores (its API path on the API's public
// address; it 404s without one and the mark keeps the initials). Null when
// the API sends neither, for the initials mark.
export function progressMemberAvatar(
  user: { user_id: string; discord_avatar?: string | null; avatar_url?: string | null },
  apiBase: string = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:3000",
): string | null {
  if (user.discord_avatar) return discordAvatarUrl(user.user_id, user.discord_avatar, 64);
  return user.avatar_url ? `${apiBase}${user.avatar_url}` : null;
}

// What still stands between a member and the Conquest, for the line under
// their name.
export function standing(meters: FranchiseProgressMeters, conqueredAt: string | null): string | null {
  if (conqueredAt) return `Conquered ${monthYear(conqueredAt)}`;
  if (meters.mainline.total === 0) return null;
  const left = Math.max(meters.mainline.total - meters.mainline.done, 0);
  return `${left} Mainline to go`;
}
