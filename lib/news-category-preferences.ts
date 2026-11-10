// A member's News Category Preferences (spec api#355, ticket www#78): the
// News Categories they switched off. A switched-off category leaves their
// default News page only; the page's filter still reaches it, and nothing
// changes for them in Discord. Shaped like Feature Preferences
// (lib/feature-preferences.ts) so the settings switches work the same way.
// Client-safe: no server imports.

// One category (`GET /users/:id/news_category_preferences` -> data.categories[]).
export interface NewsCategoryPreference {
  key: string;
  name: string;
  position: number;
  hidden: boolean;
}

export interface NewsCategoryPreferences {
  user_id: string;
  // Switched-off keys, in News Category order.
  hidden: string[];
  // Every News Category, in the API's order.
  categories: NewsCategoryPreference[];
}

// One switch flip. The switch reads "on"; the API stores "hidden".
export interface NewsCategoryChange {
  key: string;
  on: boolean;
}

// Keys are short lowercase slugs ("announcements"); the API refuses any it
// doesn't know with a 422, so this only keeps junk out of the request.
export function isNewsCategorySlug(key: unknown): key is string {
  return typeof key === "string" && /^[a-z][a-z0-9_]{0,63}$/.test(key);
}

export function newsCategoryPatchBody(change: NewsCategoryChange): {
  data: { hidden: Record<string, boolean> };
} {
  return { data: { hidden: { [change.key]: !change.on } } };
}

// The document as it reads once the change lands, so the switch moves the
// moment it is flipped; the API's answer replaces it when the save returns.
// `hidden` keeps category order.
export function applyNewsCategoryChange(
  prefs: NewsCategoryPreferences,
  change: NewsCategoryChange,
): NewsCategoryPreferences {
  const categories = prefs.categories.map((c) =>
    c.key === change.key ? { ...c, hidden: !change.on } : c,
  );
  return {
    ...prefs,
    categories,
    hidden: categories.filter((c) => c.hidden).map((c) => c.key),
  };
}

// The cache tag of one member's News page feed. A preference change expires
// it, so the default view drops (or regains) the category on the next load
// instead of after the feed's revalidate window. The feed fetch must carry
// it: `next: { tags: [newsFeedTag(discordId)] }`.
export function newsFeedTag(userId: string): string {
  return `news-feed:${userId}`;
}
