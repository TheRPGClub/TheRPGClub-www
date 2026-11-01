import type { AchievementProvider } from "@/lib/api/types";
import {
  isSpoiler,
  isUnknownUnlockDate,
  rarityTier,
  sortAchievements,
  type AchievementView,
  type RarityTier,
} from "@/lib/achievements";

// Pure helpers behind the set page's spread: the view switch, the headline
// Achievement, Rarity bands and the timeline's axis, clusters and lanes. No
// React, so the server page and the client spread share them.

export type SetPageView = "checklist" | "rarity" | "timeline";

export const SET_PAGE_VIEWS: readonly { key: SetPageView; label: string }[] = [
  { key: "checklist", label: "Checklist" },
  { key: "rarity", label: "Rarity" },
  { key: "timeline", label: "Timeline" },
];

export function parseSetPageView(raw: string | string[] | undefined): SetPageView {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "rarity" || value === "timeline" ? value : "checklist";
}

// The view's URL; the default view keeps the bare path.
export function setPageViewHref(basePath: string, view: SetPageView): string {
  return view === "checklist" ? basePath : `${basePath}?view=${view}`;
}

// An Achievement with its slot: its 1-based place in the set's display
// order, which every view prints as "No. 07".
export interface SlottedAchievement {
  view: AchievementView;
  slot: number;
}

export function slotted(items: AchievementView[]): SlottedAchievement[] {
  return sortAchievements(items, "display").map((view, i) => ({ view, slot: i + 1 }));
}

export function formatSlot(slot: number): string {
  return String(slot).padStart(2, "0");
}

// Rarer first; no Rarity sorts last; ties keep slot order.
function byRarity(a: SlottedAchievement, b: SlottedAchievement): number {
  const ra = a.view.rarity ?? Number.POSITIVE_INFINITY;
  const rb = b.view.rarity ?? Number.POSITIVE_INFINITY;
  return ra - rb || a.slot - b.slot;
}

export type HeadlineReason = "platinum" | "points" | "rarest";

export const HEADLINE_LABEL: Record<HeadlineReason, string> = {
  platinum: "Platinum",
  points: "Most points",
  rarest: "Rarest",
};

// The set's headline Achievement, which the checklist leads with: the PSN
// Platinum, the RetroAchievements Achievement worth the most points, or the
// rarest one (Steam, and the fallback for the other two).
export function headlineAchievement(
  items: SlottedAchievement[],
  provider: AchievementProvider,
): { item: SlottedAchievement; reason: HeadlineReason } | null {
  if (items.length === 0) return null;
  if (provider === "psn") {
    const platinum = items.find((i) => i.view.tier === "platinum");
    if (platinum) return { item: platinum, reason: "platinum" };
  }
  if (provider === "retroachievements") {
    const scored = items.filter((i) => (i.view.points ?? 0) > 0);
    if (scored.length > 0) {
      const top = [...scored].sort(
        (a, b) => (b.view.points ?? 0) - (a.view.points ?? 0) || byRarity(a, b),
      )[0];
      return { item: top, reason: "points" };
    }
  }
  return { item: [...items].sort(byRarity)[0], reason: "rarest" };
}

// ---------------------------------------------------------------------------
// Rarity bands

export const RARITY_BAND_RANGE: Record<RarityTier, string> = {
  common: "50% and up",
  uncommon: "15 – 50%",
  rare: "5 – 15%",
  ultra: "Under 5%",
};

export const RARITY_TIERS: readonly RarityTier[] = ["common", "uncommon", "rare", "ultra"];

export interface RarityBand {
  // null: the Provider gives these no Rarity.
  tier: RarityTier | null;
  items: SlottedAchievement[];
  unlocked: number;
}

// The four tiers in order (empty ones included), plus a trailing band for
// Achievements without a Rarity when there are any. Each band runs
// commonest first.
export function rarityBands(items: SlottedAchievement[]): RarityBand[] {
  const tiers: (RarityTier | null)[] = [...RARITY_TIERS];
  if (items.some((i) => rarityTier(i.view.rarity) == null)) tiers.push(null);
  return tiers.map((tier) => {
    const inBand = items
      .filter((i) => rarityTier(i.view.rarity) === tier)
      .sort((a, b) => byRarity(b, a) || a.slot - b.slot);
    return { tier, items: inBand, unlocked: inBand.filter((i) => i.view.unlocked).length };
  });
}

// ---------------------------------------------------------------------------
// Timeline

const DAY_MS = 24 * 60 * 60 * 1000;

// A run of at most this many days zooms the axis in past the month ticks.
const SHORT_RUN_DAYS = 45;

export interface TimelineCluster {
  // The UTC day, YYYY-MM-DD, and where it sits on the axis (0-1).
  day: string;
  at: number;
  items: SlottedAchievement[];
  // Whole days since the previous cluster (null for the first).
  gapDays: number | null;
}

export interface TimelineTick {
  label: string;
  at: number;
  major: boolean;
}

export interface TimelineModel {
  start: number;
  end: number;
  ticks: TimelineTick[];
  clusters: TimelineCluster[];
  // Unlocks the Provider gave no date (stored at the epoch).
  undated: SlottedAchievement[];
  // Locked and sealed, in slot order.
  pending: SlottedAchievement[];
  firstAt: string | null;
  lastAt: string | null;
}

const MONTH = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });

function startOfMonthUtc(t: number): number {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}

function addMonthsUtc(t: number, n: number): number {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1);
}

// The shown member's Unlocks on an axis that runs from the first Unlock's
// month to the end of the last one's, ticked by month; a run of 45 days or
// less zooms in to a few days either side, ticked by day. Unlocks on the
// same UTC day share a cluster.
export function timelineModel(items: SlottedAchievement[]): TimelineModel {
  const dated = items
    .filter((i) => i.view.unlocked && i.view.unlockedAt && !isUnknownUnlockDate(i.view.unlockedAt))
    .sort(
      (a, b) =>
        Date.parse(a.view.unlockedAt as string) - Date.parse(b.view.unlockedAt as string) ||
        a.slot - b.slot,
    );
  const undated = items.filter((i) => i.view.unlocked && isUnknownUnlockDate(i.view.unlockedAt));
  const pending = items.filter((i) => !i.view.unlocked);

  if (dated.length === 0) {
    return { start: 0, end: 0, ticks: [], clusters: [], undated, pending, firstAt: null, lastAt: null };
  }

  const first = Date.parse(dated[0].view.unlockedAt as string);
  const last = Date.parse(dated[dated.length - 1].view.unlockedAt as string);
  const firstDay = Date.parse(`${dated[0].view.unlockedAt!.slice(0, 10)}T00:00:00Z`);
  const lastDay = Date.parse(`${dated[dated.length - 1].view.unlockedAt!.slice(0, 10)}T00:00:00Z`);
  const runDays = Math.round((lastDay - firstDay) / DAY_MS) + 1;

  let start: number;
  let end: number;
  const ticks: TimelineTick[] = [];
  if (runDays <= SHORT_RUN_DAYS) {
    // A short run zooms in: a few days either side, ticked by day (or
    // every few days), with any month boundary as a major tick.
    const pad = Math.max(1, Math.ceil(runDays * 0.15));
    start = firstDay - pad * DAY_MS;
    end = lastDay + (pad + 1) * DAY_MS;
    const days = Math.round((end - start) / DAY_MS);
    const step = days <= 12 ? 1 : days <= 24 ? 2 : days <= 45 ? 5 : 7;
    for (let t = start, i = 0; t <= end; t += DAY_MS, i++) {
      const d = new Date(t);
      const monthStart = d.getUTCDate() === 1;
      if (monthStart || t === start) {
        ticks.push({ label: `${MONTH.format(d)} ${d.getUTCDate()}`, at: (t - start) / (end - start), major: true });
      } else if (i % step === 0 && t < end) {
        ticks.push({ label: String(d.getUTCDate()), at: (t - start) / (end - start), major: false });
      }
    }
  } else {
    start = startOfMonthUtc(first);
    end = addMonthsUtc(startOfMonthUtc(last), 1);
    for (let m = start; m < end; m = addMonthsUtc(m, 1)) {
      const d = new Date(m);
      const label =
        d.getUTCMonth() === 0 || m === start
          ? `${MONTH.format(d)} ${d.getUTCFullYear()}`
          : MONTH.format(d);
      ticks.push({ label, at: (m - start) / (end - start), major: true });
    }
  }
  const at = (t: number) => (t - start) / (end - start);

  const clusters: TimelineCluster[] = [];
  for (const item of dated) {
    const day = (item.view.unlockedAt as string).slice(0, 10);
    const current = clusters[clusters.length - 1];
    if (current && current.day === day) {
      current.items.push(item);
      continue;
    }
    const dayStart = Date.parse(`${day}T00:00:00Z`);
    const gapDays = current
      ? Math.round((dayStart - Date.parse(`${current.day}T00:00:00Z`)) / DAY_MS)
      : null;
    // A day sits at its noon, so a cluster centres on its day.
    clusters.push({ day, at: at(dayStart + DAY_MS / 2), items: [item], gapDays });
  }

  return {
    start,
    end,
    ticks,
    clusters,
    undated,
    pending,
    firstAt: dated[0].view.unlockedAt,
    lastAt: dated[dated.length - 1].view.unlockedAt,
  };
}

// Greedy lanes for boxes of `widths` (px) centred on `centers` (px, in
// order) inside a track `trackWidth` wide: each box is clamped into the
// track and takes the lowest lane where it clears the previous box by
// `gap`. Returns each box's lane and left edge.
export function assignLanes(
  centers: number[],
  widths: number[],
  trackWidth: number,
  gap = 8,
): { lane: number; left: number }[] {
  const laneEnds: number[] = [];
  return centers.map((center, i) => {
    const w = widths[i];
    const left = Math.min(Math.max(center - w / 2, 0), Math.max(trackWidth - w, 0));
    let lane = laneEnds.findIndex((end) => end + gap <= left);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    laneEnds[lane] = left + w;
    return { lane, left };
  });
}

// ---------------------------------------------------------------------------
// Tally

export function sealedCount(items: SlottedAchievement[]): number {
  return items.filter((i) => !i.view.unlocked && isSpoiler(i.view)).length;
}
