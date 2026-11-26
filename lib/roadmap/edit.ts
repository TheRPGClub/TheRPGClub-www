// Staff editing of the Roadmap (spec api#505, www#232): the changes the
// editor shows at once, before the API answers (and rolls back if it
// refuses), the Make Room zones for dragging items and Milestones, the Reach
// dialog's default destination, and the item and Milestone forms. Every
// function returns a new Roadmap and leaves its argument alone. Client-safe.
import type { DatePrecision } from "@/lib/api/types";
import { periodStart } from "@/lib/games/game-edit/releases";
import { claimFeedback } from "./feedback";
import { isShipped } from "./tree";
import type { Roadmap, RoadmapArea, RoadmapFeedback, RoadmapItem, RoadmapMilestone } from "./types";

type Milestones = RoadmapMilestone[];

const mapAll = (r: Roadmap, f: (m: RoadmapMilestone) => RoadmapMilestone): Roadmap => ({
  milestones: r.milestones.map(f),
  reached: r.reached.map(f),
});

const withItems = (m: RoadmapMilestone, items: RoadmapItem[]) =>
  items.map((item, i) => ({ ...item, milestone_id: m.id, position: i + 1 }));

export function findMilestone(r: Roadmap, id: number): RoadmapMilestone | null {
  return [...r.milestones, ...r.reached].find((m) => m.id === id) ?? null;
}

export function findItem(r: Roadmap, id: number): RoadmapItem | null {
  for (const m of [...r.milestones, ...r.reached]) {
    const item = m.items.find((i) => i.id === id);
    if (item) return item;
  }
  return null;
}

// An item as the API sent it back: replaced where it is, or added at the end
// of its Milestone when it is new. Feedback it linked leaves other items.
export function upsertItem(r: Roadmap, item: RoadmapItem): Roadmap {
  const known = findItem(r, item.id) !== null;
  return mapAll(claimFeedback(r, item), (m) => {
    if (known) return { ...m, items: m.items.map((i) => (i.id === item.id ? item : i)) };
    return m.id === item.milestone_id ? { ...m, items: [...m.items, item] } : m;
  });
}

export function removeItem(r: Roadmap, id: number): Roadmap {
  return mapAll(r, (m) => ({ ...m, items: m.items.filter((i) => i.id !== id) }));
}

// Ship (with the time it shipped) or un-ship (null).
export function setShipped(r: Roadmap, id: number, shippedAt: string | null): Roadmap {
  return mapAll(r, (m) => ({
    ...m,
    items: m.items.map((i) => (i.id === id ? { ...i, shipped_at: shippedAt } : i)),
  }));
}

// A Milestone as the API sent it back: replaced where it is, or added as
// the last open one when it is new.
export function upsertMilestone(r: Roadmap, milestone: RoadmapMilestone): Roadmap {
  if (findMilestone(r, milestone.id) === null) return { ...r, milestones: [...r.milestones, milestone] };
  return mapAll(r, (m) => (m.id === milestone.id ? milestone : m));
}

export function removeMilestone(r: Roadmap, id: number): Roadmap {
  return { milestones: r.milestones.filter((m) => m.id !== id), reached: r.reached.filter((m) => m.id !== id) };
}

// Make Room zones. Item zones are keyed `m<id>` (not the bare id: a numeric
// key would sort itself), in the open Milestones' order.
export type ItemZone = `m${number}`;
export type ItemZones = Record<ItemZone, number[]>;

export const itemZoneKey = (milestoneId: number): ItemZone => `m${milestoneId}`;
export const itemZoneMilestone = (zone: ItemZone): number => Number(zone.slice(1));

export function itemZones(r: Roadmap): ItemZones {
  return Object.fromEntries(r.milestones.map((m) => [itemZoneKey(m.id), m.items.map((i) => i.id)])) as ItemZones;
}

// The open Milestones' items laid out as `zones` says (a drop, shown before
// the API answers).
export function applyItemZones(r: Roadmap, zones: ItemZones): Roadmap {
  const items = new Map(r.milestones.flatMap((m) => m.items).map((i) => [i.id, i]));
  const milestones = r.milestones.map((m) => {
    const ids = zones[itemZoneKey(m.id)] ?? m.items.map((i) => i.id);
    return { ...m, items: withItems(m, ids.map((id) => items.get(id)).filter((i): i is RoadmapItem => !!i)) };
  });
  return { ...r, milestones };
}

// The open Milestones in the order `ids` gives.
export function applyMilestoneOrder(r: Roadmap, ids: readonly number[]): Roadmap {
  const byId = new Map(r.milestones.map((m) => [m.id, m]));
  const milestones = ids.map((id) => byId.get(id)).filter((m): m is RoadmapMilestone => !!m);
  return milestones.length === r.milestones.length ? { ...r, milestones } : r;
}

// Where a Reached Milestone's unshipped items go by default: the next open
// Milestone, or the one before it when it is the last (as the API decides).
export function defaultDestination(r: Roadmap, id: number): RoadmapMilestone | null {
  const i = r.milestones.findIndex((m) => m.id === id);
  if (i < 0) return null;
  return r.milestones[i + 1] ?? r.milestones[i - 1] ?? null;
}

export function unshippedItems(m: RoadmapMilestone): RoadmapItem[] {
  return m.items.filter((i) => !isShipped(i));
}

// Reach, shown at once: the unshipped items join the end of `destinationId`,
// and the Milestone goes to the top of the Shipped shelf.
export function reachLocally(r: Roadmap, id: number, destinationId: number | null, now: string): Roadmap {
  const milestone = r.milestones.find((m) => m.id === id);
  if (!milestone) return r;
  const moving = unshippedItems(milestone);
  const reached = { ...milestone, reached_at: now, items: milestone.items.filter(isShipped) };
  const milestones: Milestones = r.milestones
    .filter((m) => m.id !== id)
    .map((m) => (m.id === destinationId ? { ...m, items: withItems(m, [...m.items, ...moving]) } : m));
  return { milestones, reached: [reached, ...r.reached] };
}

// Un-reach, shown at once: back among the open Milestones at its position.
export function unreachLocally(r: Roadmap, id: number): Roadmap {
  const milestone = r.reached.find((m) => m.id === id);
  if (!milestone) return r;
  const open = { ...milestone, reached_at: null };
  const at = r.milestones.findIndex((m) => m.position > open.position || (m.position === open.position && m.id > open.id));
  const milestones = at < 0 ? [...r.milestones, open] : [...r.milestones.slice(0, at), open, ...r.milestones.slice(at)];
  return { milestones, reached: r.reached.filter((m) => m.id !== id) };
}

// The item form (the dialog that adds or edits a Roadmap Item).
export const ITEM_TITLE_MAX = 120;
export const ITEM_BLURB_MAX = 500;
export const GITHUB_URL_MAX = 300;
const GITHUB_ISSUE = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/issues\/\d+\/?$/;

export interface ItemDraft {
  title: string;
  blurb: string;
  bot: boolean;
  web: boolean;
  github_issue_url: string;
  shipped: boolean;
  // The linked Feedback, in the order staff added it.
  feedback: RoadmapFeedback[];
}

export interface ItemPayload {
  title: string;
  blurb: string;
  area: RoadmapArea | null;
  github_issue_url: string | null;
  // Replaces the item's links exactly ([] clears them).
  feedback_ids: number[];
}

export function itemDraft(item?: RoadmapItem | null): ItemDraft {
  return {
    title: item?.title ?? "",
    blurb: item?.blurb ?? "",
    bot: item?.area === "bot" || item?.area === "both",
    web: item?.area === "website" || item?.area === "both",
    github_issue_url: item?.github_issue_url ?? "",
    shipped: item ? isShipped(item) : false,
    feedback: item?.feedback ?? [],
  };
}

// The Bot and Web toggles as the API's one area.
export function areaOf(bot: boolean, web: boolean): RoadmapArea | null {
  if (bot && web) return "both";
  if (bot) return "bot";
  if (web) return "website";
  return null;
}

export function itemPayload(d: ItemDraft): { data: ItemPayload } | { error: string } {
  const title = d.title.trim();
  const blurb = d.blurb.trim();
  const url = d.github_issue_url.trim();
  if (!title) return { error: "Give it a title." };
  if (title.length > ITEM_TITLE_MAX) return { error: `Keep the title to ${ITEM_TITLE_MAX} characters.` };
  if (!blurb) return { error: "Say what it is in a sentence or two." };
  if (blurb.length > ITEM_BLURB_MAX) return { error: `Keep the blurb to ${ITEM_BLURB_MAX} characters.` };
  if (url && (url.length > GITHUB_URL_MAX || !GITHUB_ISSUE.test(url))) {
    return { error: "The GitHub link must be an issue, like https://github.com/owner/repo/issues/12." };
  }
  return { data: { title, blurb, area: areaOf(d.bot, d.web), github_issue_url: url || null, feedback_ids: d.feedback.map((f) => f.id) } };
}

// The Milestone form.
export const MILESTONE_NAME_MAX = 100;
export const MILESTONE_BLURB_MAX = 280;

export interface MilestoneDraft {
  name: string;
  blurb: string;
  target_date: string | null;
  date_precision: DatePrecision;
}

export type MilestonePayload = { name: string; blurb: string | null; target_date: string | null; date_precision: DatePrecision };

export function milestoneDraft(m?: RoadmapMilestone | null): MilestoneDraft {
  return {
    name: m?.name ?? "",
    blurb: m?.blurb ?? "",
    target_date: m?.target_date ?? null,
    date_precision: m?.date_precision ?? "tba",
  };
}

// The draft at a new Date Precision, its target date snapped to the first
// day of its period there (none for TBA), as a Release's date is.
export function withPrecision(d: MilestoneDraft, date_precision: DatePrecision): MilestoneDraft {
  return { ...d, date_precision, target_date: periodStart(d.target_date, date_precision) };
}

export function milestonePayload(d: MilestoneDraft): { data: MilestonePayload } | { error: string } {
  const name = d.name.trim();
  const blurb = d.blurb.trim();
  if (!name) return { error: "Give the Milestone a name." };
  if (name.length > MILESTONE_NAME_MAX) return { error: `Keep the name to ${MILESTONE_NAME_MAX} characters.` };
  if (blurb.length > MILESTONE_BLURB_MAX) return { error: `Keep the blurb to ${MILESTONE_BLURB_MAX} characters.` };
  const tba = d.date_precision === "tba";
  if (!tba && !d.target_date) return { error: "Pick a target date, or make it TBA." };
  return {
    data: { name, blurb: blurb || null, target_date: tba ? null : d.target_date, date_precision: d.date_precision },
  };
}
