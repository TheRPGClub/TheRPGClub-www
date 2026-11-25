// "Find a Franchise" (components/franchises/index/franchise-search.tsx)
// against the URL. The input searches as you type, so its own pushes land a
// beat behind the typing, and can land out of order; a URL change it made
// must never overwrite what was typed since. Anything else that changes the
// URL (a letter, the sort, a page, back and forward) drops a pending push,
// and brings the URL's search into the input when it differs from the one
// this input last pushed.

export interface SearchInput {
  // What the field shows.
  query: string;
  // The URL the input last followed.
  seen: string;
  // The URLs this input pushed since it last followed another change.
  pushed: string[];
  // The search this input last pushed, or followed from the URL.
  lastQ: string;
}

// How many of its own pushes the input remembers; older ones have landed.
const KEEP = 10;

export function searchInput(href: string, q: string): SearchInput {
  return { query: q, seen: href, pushed: [], lastQ: q };
}

export function searchTyped(s: SearchInput, value: string): SearchInput {
  return { ...s, query: value };
}

// The input pushed `href`, searching `q`.
export function searchPushed(s: SearchInput, href: string, q: string): SearchInput {
  return { ...s, pushed: [...s.pushed.slice(1 - KEEP), href], lastQ: q };
}

// The URL is now `href`, searching `q`. `cancel` says to drop a pending
// push.
export function searchUrlChanged(s: SearchInput, href: string, q: string): { next: SearchInput; cancel: boolean } {
  if (href === s.seen) return { next: s, cancel: false };
  if (s.pushed.includes(href)) return { next: { ...s, seen: href }, cancel: false };
  const query = q === s.lastQ ? s.query : q;
  return { next: { query, seen: href, pushed: [], lastQ: q }, cancel: true };
}
