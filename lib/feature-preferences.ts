// A member's Feature Preferences (spec api#347, ticket www#74): the hideable
// Features they took out of their own view of the website, and, for Admins
// and Superadmins, the "Show Preview features" setting. The API stores only
// hidden Features, so everything is shown by default, and it never lets a
// preference reveal what a Feature Flag hides. Client-safe: no server imports.

// One switchable row (`GET /users/:id/feature_preferences` -> data.features[]).
export interface FeaturePreference {
  key: string;
  name: string;
  // Members only ever get "live"; staff also get "preview".
  state: "live" | "preview";
  // Listed only because the viewer is staff: badge it "Preview".
  preview: boolean;
  hidden: boolean;
  // Where the Feature shows up on the website ("Journals", "Profile Journal").
  website: string[];
}

export interface FeaturePreferences {
  user_id: string;
  // Every stored hidden key, including ones a flag hides right now.
  hidden: string[];
  // null for anyone who isn't an Admin or Superadmin: no switch for them.
  show_preview_features: boolean | null;
  // Hideable Features the viewer can use, in registry order. Empty: no
  // hideable Feature is Live (for staff, none is Live or Preview).
  features: FeaturePreference[];
}

// One change, as a switch sends it.
export type PreferenceChange =
  | { kind: "feature"; key: string; shown: boolean }
  | { kind: "show_preview"; shown: boolean };

// The PATCH body for one change. A switch reads "shown"; the API stores
// "hidden", so a feature switch sends the opposite.
export function preferencePatchBody(change: PreferenceChange): {
  data: { hidden: Record<string, boolean> } | { show_preview_features: boolean };
} {
  return change.kind === "feature"
    ? { data: { hidden: { [change.key]: !change.shown } } }
    : { data: { show_preview_features: change.shown } };
}

// The document as it reads once the change lands, so the switch moves the
// moment it is flipped; the API's answer replaces it when the save returns.
export function applyPreferenceChange(
  prefs: FeaturePreferences,
  change: PreferenceChange,
): FeaturePreferences {
  if (change.kind === "show_preview") {
    return prefs.show_preview_features === null
      ? prefs
      : { ...prefs, show_preview_features: change.shown };
  }
  const hide = !change.shown;
  return {
    ...prefs,
    hidden: hide
      ? prefs.hidden.includes(change.key) ? prefs.hidden : [...prefs.hidden, change.key]
      : prefs.hidden.filter((k) => k !== change.key),
    features: prefs.features.map((f) =>
      f.key === change.key ? { ...f, hidden: hide } : f,
    ),
  };
}

// The "where it shows up" line under a Feature's name.
export function whereItShows(website: readonly string[]): string {
  return website.join(" · ");
}
