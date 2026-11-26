// How the Roadmap's Skill Tree reads (spec api#505, pick 1 in the design
// round): a tier band's label line, its ready count, an item's area tags and
// a Reached Milestone's heading on the "Already learned" shelf. Shared by
// the read view and staff editing. Client-safe: no server imports.
import { MONTHS, releaseDateLabel, utcDay } from "@/lib/releases";
import type { Roadmap, RoadmapArea, RoadmapItem, RoadmapMilestone } from "./types";

export const ROADMAP_PATH = "/roadmap";

// A Milestone's target date at its Date Precision ("Dec 2026", "Q1 2027"),
// or "TBA".
export function milestoneDate(m: Pick<RoadmapMilestone, "target_date" | "date_precision">): string {
  return releaseDateLabel(m.target_date, m.date_precision) ?? "TBA";
}

export function isShipped(item: Pick<RoadmapItem, "shipped_at">): boolean {
  return item.shipped_at !== null;
}

// How many of a Milestone's items are Shipped, of how many.
export function readyCount(m: Pick<RoadmapMilestone, "items">): { ready: number; total: number } {
  return { ready: m.items.filter(isShipped).length, total: m.items.length };
}

// The tier band's label line: "Next up" on the first open Milestone, its
// date or TBA, then "3 of 5 ready" (or "Nothing on it yet").
export function tierLabel(m: RoadmapMilestone, first: boolean): string[] {
  const { ready, total } = readyCount(m);
  return [
    ...(first ? ["Next up"] : []),
    milestoneDate(m),
    total === 0 ? "Nothing on it yet" : `${ready} of ${total} ready`,
  ];
}

// The area tags an item wears: Bot and Web are separate tags, so "both"
// is the two of them (there is no Both tag).
export type AreaTag = "bot" | "web";

export function areaTags(area: RoadmapArea | null): AreaTag[] {
  if (area === "both") return ["bot", "web"];
  if (area === "bot") return ["bot"];
  if (area === "website") return ["web"];
  return [];
}

export const AREA_TAG_LABEL: Record<AreaTag, string> = { bot: "Bot", web: "Web" };

// A Reached Milestone on the shelf: "Shipped at Launch · Dec 2026", dated by
// when it was Reached (a month, in the club's UTC day), not by its target.
export function reachedHeading(m: Pick<RoadmapMilestone, "name" | "reached_at">): string {
  if (!m.reached_at) return `Shipped at ${m.name}`;
  const day = utcDay(m.reached_at);
  return `Shipped at ${m.name} · ${MONTHS[day.getUTCMonth()]} ${day.getUTCFullYear()}`;
}

// No Milestones at all, open or Reached: the page shows its empty state.
export function roadmapEmpty(roadmap: Roadmap): boolean {
  return roadmap.milestones.length === 0 && roadmap.reached.length === 0;
}
