import type { GameCompletion, Platform } from "@/lib/api/types";
import { dayOf, dayBlock, shortDay } from "@/lib/shelf-forms/dates";
import type {
  GamePlaytime,
  ManualPlaytimeMode,
  PlaytimeMismatch,
  PlaytimeProvider,
} from "./types";

// What the game page's Playtime control shows (spec api#457, pick 2D+F),
// worked out from the Playtime document. Pure, so the chip, the editor and
// the quick Add Playtime read the same figures.

export const PROVIDER_NAMES: Record<PlaytimeProvider, string> = {
  steam: "Steam",
  retroachievements: "RetroAchievements",
  psn: "PSN",
};
const PROVIDER_ORDER: PlaytimeProvider[] = ["steam", "retroachievements", "psn"];

// "180 h", "6.5 h", "45 m": whole hours from 10 h up, a tenth below, minutes
// under an hour.
export function hoursText(minutes: number): string {
  if (minutes > 0 && minutes < 60) return `${minutes} m`;
  const hours = minutes / 60;
  const shown = hours >= 10 ? Math.round(hours) : Math.round(hours * 10) / 10;
  return `${shown.toLocaleString("en-GB")} h`;
}

// A clock's two parts: 860 minutes is 14 h 20 m.
export function clockParts(minutes: number): { h: number; m: number } {
  const whole = Math.max(0, Math.round(minutes));
  return { h: Math.floor(whole / 60), m: whole % 60 };
}

// Hours as typed ("3", "2.5") in minutes; null when blank or not a number
// of hours 0 or more.
export function parseHours(text: string): number | null {
  const trimmed = text.trim().replace(",", ".");
  if (!trimmed) return null;
  const hours = Number(trimmed);
  if (!Number.isFinite(hours) || hours < 0 || hours > 100_000) return null;
  return Math.round(hours * 60);
}

// Minutes as an Hours field holds them: 90 is "1.5".
export function hoursField(minutes: number): string {
  return String(Math.round((minutes / 60) * 100) / 100);
}

// A game with no figure from any source has no Playtime yet: the control
// is "+ Add Playtime" alone.
export function hasPlaytime(doc: GamePlaytime | null): doc is GamePlaytime {
  return doc != null && (doc.breakdown.provider_sets.length > 0 || doc.breakdown.manual_entries.length > 0);
}

export interface PlaytimeChip {
  total: string;
  // The open Playthrough's time, or null when none is open.
  playthrough: string | null;
  // A mismatch waits for the member's choice (the yellow dot).
  flagged: boolean;
  // The chip's name to assistive tech.
  label: string;
}

export function playtimeChip(doc: GamePlaytime): PlaytimeChip {
  const total = hoursText(doc.total_minutes);
  const playthrough = doc.playthrough ? hoursText(doc.playthrough.minutes) : null;
  const flagged = doc.mismatches.length > 0;
  const label = [
    `Your Playtime: ${total}`,
    playthrough && `Playthrough ${playthrough}`,
    flagged && `${doc.mismatches.length} to check`,
  ]
    .filter(Boolean)
    .join(", ");
  return { total, playthrough, flagged, label };
}

/* ---------- the breakdown ---------- */

export interface SourceRow {
  key: string;
  source: string;
  kind: "provider" | "manual";
  // The platform as named: GameDB's, else the Provider's raw label; a
  // Manual entry with none is "Other".
  platform: string | null;
  // The set's title, or the Manual entry's note.
  detail: string | null;
  // "set 2 Nov", "not counted: you kept yours".
  meta: string | null;
  minutes: number;
  hours: string;
  counted: boolean;
  // Part of a mismatch waiting for a choice.
  flagged: boolean;
  // The Manual entry's id, for its Add time / Set total / Remove.
  manualId: number | null;
  platformId: number | null;
}

const byName = (a: string | null, b: string | null) => (a ?? "￿").localeCompare(b ?? "￿");

// A platform's short label ("PS4" for PlayStation 4), from the club's
// platforms; undefined leaves the API's name.
export type PlatformShort = (platformId: number | null | undefined) => string | null | undefined;
const noShort: PlatformShort = () => undefined;

// The club's platforms as short labels: the abbreviation, else the name.
export function platformShort(platforms: readonly Platform[]): PlatformShort {
  const byId = new Map(platforms.map((p) => [p.platform_id, p.platform_abbreviation ?? p.platform_name]));
  return (id) => (id == null ? undefined : byId.get(id));
}

export function sourceRows(doc: GamePlaytime, short: PlatformShort = noShort): SourceRow[] {
  const flaggedProvider = (provider: PlaytimeProvider, platformId: number | null | undefined) =>
    doc.mismatches.some((m) => m.provider === provider && m.platform_id === platformId);
  const providers = [...doc.breakdown.provider_sets]
    .sort((a, b) => PROVIDER_ORDER.indexOf(a.provider) - PROVIDER_ORDER.indexOf(b.provider) || byName(a.platform_name ?? a.platform_label ?? null, b.platform_name ?? b.platform_label ?? null))
    .map<SourceRow>((set) => ({
      key: `set:${set.achievement_set_id}`,
      source: PROVIDER_NAMES[set.provider],
      kind: "provider",
      platform: short(set.platform_id) ?? set.platform_name ?? set.platform_label ?? null,
      detail: set.title ?? null,
      meta: set.counted ? null : "not counted: you kept yours",
      minutes: set.minutes,
      hours: hoursText(set.minutes),
      counted: set.counted,
      flagged: flaggedProvider(set.provider, set.platform_id),
      manualId: null,
      platformId: set.platform_id ?? null,
    }));
  const manual = [...doc.breakdown.manual_entries]
    .sort((a, b) => byName(a.platform_name ?? null, b.platform_name ?? null))
    .map<SourceRow>((entry) => {
      const day = dayOf(entry.updated_at);
      return {
        key: `manual:${entry.id}`,
        source: "Manual",
        kind: "manual",
        platform: short(entry.platform_id) ?? entry.platform_name ?? "Other",
        detail: entry.note ? `“${entry.note}”` : null,
        meta: day ? `set ${shortDay(day)}` : null,
        minutes: entry.minutes,
        hours: hoursText(entry.minutes),
        counted: true,
        flagged: doc.mismatches.some((m) => m.manual_playtime_id === entry.id),
        manualId: entry.id,
        platformId: entry.platform_id ?? null,
      };
    });
  return [...providers, ...manual];
}

/* ---------- mismatches ---------- */

export interface MismatchView {
  key: string;
  platformId: number;
  // "PSN now reports 29 h on PS4; your manual PS4 entry says 31 h."
  headline: string;
  // "Both count, so PS4 may be in twice."
  detail: string;
  keepProvider: string;
  keepMine: string;
}

export function mismatchView(m: PlaytimeMismatch, short: PlatformShort = noShort): MismatchView {
  const provider = PROVIDER_NAMES[m.provider];
  const platform = short(m.platform_id) ?? m.platform_name ?? "this platform";
  const theirs = hoursText(m.provider_minutes);
  const mine = hoursText(m.manual_minutes);
  return {
    key: `${m.provider}:${m.platform_id}`,
    platformId: m.platform_id,
    headline: `${provider} now reports ${theirs} on ${platform}; your manual ${platform} entry says ${mine}.`,
    detail: `Both count, so ${platform} may be in twice.`,
    keepProvider: `Keep ${provider}'s ${theirs}`,
    keepMine: `Keep my ${mine}`,
  };
}

/* ---------- Add time / Set total ---------- */

// The line beside the Hours field: "30 h to 33 h". Null until the hours read.
export function changePreview(currentMinutes: number, mode: ManualPlaytimeMode, typed: string): string | null {
  const minutes = parseHours(typed);
  if (minutes == null) return null;
  const next = mode === "add" ? currentMinutes + minutes : minutes;
  return `${hoursText(currentMinutes)} to ${hoursText(next)}`;
}

// The Manual entry's minutes on a platform (null is "Other"), 0 for none.
export function manualMinutesOn(doc: GamePlaytime | null, platformId: number | null): number {
  return doc?.breakdown.manual_entries.find((e) => (e.platform_id ?? null) === platformId)?.minutes ?? 0;
}

// "+" defaults to the platform the member last added to, else the one on
// their Now Playing entry, else Other.
export function defaultPlatform(doc: GamePlaytime | null, nowPlayingPlatformId: number | null | undefined): number | null {
  const last = [...(doc?.breakdown.manual_entries ?? [])].sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
  if (last) return last.platform_id ?? null;
  return nowPlayingPlatformId ?? null;
}

export interface PlatformChoice {
  value: number | null;
  label: string;
}

// The quick Add Playtime's platforms: where the member has Manual Playtime
// first ("Switch · your Manual Playtime, 30 h"), then every platform, then
// Other.
export function platformChoices(doc: GamePlaytime | null, platforms: readonly Platform[]): PlatformChoice[] {
  const entries = doc?.breakdown.manual_entries ?? [];
  const named = (id: number | null) =>
    id == null ? "Other" : (platforms.find((p) => p.platform_id === id)?.platform_name ?? entries.find((e) => e.platform_id === id)?.platform_name ?? "Platform");
  const mine = [...entries]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .map((e) => ({ value: e.platform_id ?? null, label: `${named(e.platform_id ?? null)} · your Manual Playtime, ${hoursText(e.minutes)}` }));
  const taken = new Set(mine.map((c) => c.value));
  const rest = platforms.filter((p) => !taken.has(p.platform_id)).map((p) => ({ value: p.platform_id, label: p.platform_name }));
  return [...mine, ...rest, ...(taken.has(null) ? [] : [{ value: null, label: "Other" }])];
}

/* ---------- the Playthrough card ---------- */

export interface PlaythroughView {
  id: number;
  clock: { h: number; m: number };
  // "9 Nov".
  since: string | null;
  // It started the day the game went on Now Playing.
  fromNowPlaying: boolean;
  // The Playtime it counts from ("Counted from 166 h"); null for a total set
  // by hand.
  countedFrom: string | null;
  manual: boolean;
  minutes: number;
}

export interface EarlierPlaythrough {
  id: number;
  // "Mar 2019 · Main Story", "Nov 2025 · Abandoned".
  label: string;
  hours: string;
}

export function playthroughView(doc: GamePlaytime, nowPlayingAddedAt?: string | null): PlaythroughView | null {
  const open = doc.playthrough;
  if (!open) return null;
  const started = dayOf(open.started_at);
  // The API's baseline; an older API without it leaves the difference.
  const base = open.baseline_minutes ?? doc.total_minutes - open.minutes;
  return {
    id: open.id,
    clock: clockParts(open.minutes),
    since: started ? shortDay(started) : null,
    fromNowPlaying: started != null && started === dayOf(nowPlayingAddedAt),
    countedFrom: open.manual || base < 0 ? null : hoursText(base),
    manual: open.manual,
    minutes: open.minutes,
  };
}

export function earlierPlaythroughs(doc: GamePlaytime, completions: readonly GameCompletion[] = []): EarlierPlaythrough[] {
  return doc.playthroughs.map((p) => {
    const day = dayOf(p.ended_at);
    const completion = completions.find((c) => c.completion_id === p.completion_id);
    const how = p.end_reason === "abandoned" ? "Abandoned" : (completion?.completion_type ?? "Completed");
    return { id: p.id, label: [day && dayBlock(day).monthYear, how].filter(Boolean).join(" · "), hours: hoursText(p.minutes) };
  });
}

// The Playthrough's time as the completion form's Hours field holds it
// ("14.33"), or "" with none open or none counted yet (a Playthrough just
// started would prefill a wrong "0").
export function playthroughHours(minutes: number | null | undefined): string {
  return minutes ? hoursField(minutes) : "";
}
