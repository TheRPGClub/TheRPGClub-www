// Backend validates these as check constraints; the order here drives the
// default selection so the "no choice" path still produces a valid request.
export const COMPLETION_TYPES = [
  "Main Story",
  "Main Story + Side Content",
  "Completionist",
] as const;
export const OWNERSHIP_TYPES = ["Digital", "Physical", "Subscription", "Other"] as const;
