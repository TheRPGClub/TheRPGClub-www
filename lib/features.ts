// The club's Features as the website sees them (spec api#347, ADR 0005). The
// API decides who may use or see each Feature and sends the answer on the
// session (`GET /api/v1/session` -> `features`); the site only reads it.
//
//   shown(key)    show the Feature's nav item, dashboard panel and sections
//                 inside other pages. False when its flag hides it, the
//                 member hid it (Feature Preference) or a staff member turned
//                 "Show Preview features" off.
//   canOpen(key)  render the Feature's own pages. Follows the flag only, so a
//                 page hidden by preference still opens from a shared link;
//                 a flag-hidden page is not-found.
//   preview(key)  staff see the Feature only because they are staff: badge it
//                 "Preview" on its nav item and page header.
//
// Members get only Live entries, so a missing entry is a flag-hidden Feature.
// Staff get every Feature in every state; Off is the one they can't open.
// Client-safe: no server imports here.

export const FEATURE_KEYS = [
  "game_index",
  "voting_gotm",
  "backlog",
  "collection",
  "now_playing",
  "game_completions",
  "reviews",
  "achievement_hub",
  "giveaways",
  "journals",
  "suggestions",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

// A Feature key as the API spells one (a lowercase slug). The API owns the
// list and 404s an unknown key, so actions check only the shape: a Feature
// added in the API can be switched before www knows its name.
export function isFeatureSlug(key: unknown): key is string {
  return typeof key === "string" && /^[a-z0-9_]{1,64}$/.test(key);
}

export type FeatureState = "off" | "preview" | "live";

// One entry of the session's `features` list, in registry order.
export interface SessionFeature {
  key: string;
  name: string;
  state: FeatureState;
  // False for a Core Feature, which members can't hide.
  hideable: boolean;
  shown: boolean;
  preview: boolean;
}

export interface FeatureView {
  shown(key: FeatureKey): boolean;
  canOpen(key: FeatureKey): boolean;
  preview(key: FeatureKey): boolean;
}

// Before the API sent `features` (and if a session ever arrives without it)
// the site shows everything, as it did before Feature Flags.
const EVERYTHING: FeatureView = {
  shown: () => true,
  canOpen: () => true,
  preview: () => false,
};

export function featureView(
  features: readonly SessionFeature[] | null | undefined,
): FeatureView {
  if (!Array.isArray(features)) return EVERYTHING;
  const byKey = new Map(features.map((f) => [f.key, f]));
  return {
    shown: (key) => byKey.get(key)?.shown === true,
    canOpen: (key) => {
      const entry = byKey.get(key);
      return entry !== undefined && entry.state !== "off";
    },
    preview: (key) => byKey.get(key)?.preview === true,
  };
}
