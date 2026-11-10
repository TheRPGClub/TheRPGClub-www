import { agoText } from "@/lib/bot-jobs";
import type { FeatureState } from "@/lib/features";

// The staff desk's view of the Feature Flags (spec api#347, /admin/features):
// `GET /api/v1/features` lists every Feature with its state, what it covers
// and its last change; `PATCH /api/v1/features/:key` sets one. Admins and
// Superadmins only; the API decides. Client-safe: no server imports here.

export const FEATURE_STATES: readonly FeatureState[] = ["off", "preview", "live"];

export const STATE_LABEL: Record<FeatureState, string> = {
  off: "Off",
  preview: "Preview",
  live: "Live",
};

// The latest logged change. `changed_by` is a Discord user id, or "system"
// for the seed (then `changed_by_name` is null).
export interface FeatureFlagChange {
  from_state: FeatureState;
  to_state: FeatureState;
  changed_by: string;
  changed_by_name: string | null;
  reason: string | null;
  changed_at: string;
}

export interface FeatureFlagEntry {
  // The API's key: may be one www doesn't know yet (shown by `name`).
  key: string;
  name: string;
  state: FeatureState;
  core: boolean;
  hideable: boolean;
  // Short strings: pages and sections ("Game pages"), bot commands
  // ("/gamedb") and automated posts ("Voting results").
  coverage: { website: string[]; bot: string[]; posts: string[] };
  // Null when the Feature was never set (it then reads as Preview).
  last_change: FeatureFlagChange | null;
}

// The desk's two departments, each in registry order.
export function splitFeatureFlags(entries: readonly FeatureFlagEntry[]): {
  core: FeatureFlagEntry[];
  hideable: FeatureFlagEntry[];
} {
  return {
    core: entries.filter((e) => e.core),
    hideable: entries.filter((e) => !e.core),
  };
}

export function stateCounts(entries: readonly FeatureFlagEntry[]): Record<FeatureState, number> {
  const counts: Record<FeatureState, number> = { off: 0, preview: 0, live: 0 };
  for (const e of entries) counts[e.state] += 1;
  return counts;
}

// Off takes the Feature away from everyone, staff included, and pauses its
// automated activity, so it asks first. Every other change saves at once.
export function needsOffConfirm(current: FeatureState, next: FeatureState): boolean {
  return next === "off" && current !== "off";
}

// The API's limit on a change's reason.
export const REASON_MAX = 500;

// A reason as the API takes it: trimmed, blank as null, at most REASON_MAX.
export function normalizeReason(raw: string | null | undefined): { reason: string | null; error?: string } {
  const reason = (raw ?? "").trim();
  if (!reason) return { reason: null };
  if (reason.length > REASON_MAX) {
    return { reason, error: `Keep the reason to ${REASON_MAX} characters (it has ${reason.length}).` };
  }
  return { reason };
}

// Who made a change: the member's name, "System" for the seed.
export function changerName(change: Pick<FeatureFlagChange, "changed_by" | "changed_by_name">): string {
  if (change.changed_by === "system") return "System";
  return change.changed_by_name ?? change.changed_by;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// When a change was made: "just now", "3 h ago", "2 d ago" within a week,
// then the date ("Nov 1", with the year once it isn't this year's). Dates are
// read in UTC so the server and the browser print the same thing.
export function changeWhen(iso: string, now: Date): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  if (now.getTime() - at.getTime() < WEEK_MS) return agoText(iso, now);
  const sameYear = at.getUTCFullYear() === now.getUTCFullYear();
  return at.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
    timeZone: "UTC",
  });
}

// A bot command ("/gamedb") keeps its case; other coverage reads in caps.
export function isCommand(item: string): boolean {
  return item.startsWith("/");
}
