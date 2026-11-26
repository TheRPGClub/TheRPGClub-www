import type { CollectionMeta } from "./types";

export interface Pagination {
  // Records across every page, for a "N items" count.
  total: number;
  // Pages the server split them into, at the page size it actually served.
  totalPages: number;
}

// Reads a collection's pagination meta.
//
// The API moved to Pagy + serializers and its meta went page-native with it:
// `total` became `count` and `pages` arrived alongside. Every list read goes
// through here so that contract lives in one place — reaching for `meta.total`
// silently yielded undefined at twelve call sites, which is what stopped the
// games index from ever rendering its pager.
//
// `meta` is typed loosely because it is unvalidated JSON: a failed or
// malformed response falls back to `loaded`, reporting one page of whatever
// was rendered rather than claiming none.
export function paginationOf(
  meta: Partial<CollectionMeta> | undefined,
  loaded: number,
): Pagination {
  const total = typeof meta?.count === "number" ? meta.count : loaded;
  const totalPages =
    typeof meta?.pages === "number" && meta.pages > 0 ? meta.pages : 1;

  return { total, totalPages };
}

// One page of a list as the member pages read it, and the stand-in for a list
// that wasn't read (its Feature isn't shown) or couldn't be: no rows.
export interface ListPage<T> {
  data: T[];
  total: number;
}

export const NO_ROWS: ListPage<never> = { data: [], total: 0 };

// Every row of a paged list: page 1, then the rest its meta names (at most
// `maxPages` in all), read together. `read` answers one page, or null when
// it failed; any failed page fails the whole read (null).
export async function readEveryPage<T>(
  read: (page: number) => Promise<{ data: T[]; meta?: Partial<CollectionMeta> } | null>,
  maxPages = 20,
): Promise<T[] | null> {
  const first = await read(1);
  if (!first) return null;
  const pages = Math.min(paginationOf(first.meta, first.data.length).totalPages, maxPages);
  const rest = await Promise.all(Array.from({ length: pages - 1 }, (_, i) => read(i + 2)));
  if (rest.some((page) => page === null)) return null;
  return [first, ...rest].flatMap((page) => page!.data);
}
