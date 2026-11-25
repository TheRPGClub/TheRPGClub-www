// The ordered lists (Now Playing, Backlog, Favorites; spec api#451). Their
// list pages reorder with Make Room (hooks/use-sortable.ts); a drop saves
// the entry's new place as one 1-based `position` (api#452) and the API
// renumbers the rest.

export const ORDERED_KINDS = ["now_playing", "backlog", "favorite"] as const;
