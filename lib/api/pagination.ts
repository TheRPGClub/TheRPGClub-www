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
