// The game index's taxonomy filters (facets): genre, platform, theme,
// perspective and mode. Each is a set of ids in the address
// (`?genre=12,5`); the API ANDs facets together and matches any id within
// one (GET /api/v1/games?genre_id[]=12&genre_id[]=5).

export const FACETS = [
  { key: "genre", label: "Genre", apiParam: "genre_id" },
  { key: "platform", label: "Platform", apiParam: "platform_id" },
  { key: "theme", label: "Theme", apiParam: "theme_id" },
  { key: "perspective", label: "Perspective", apiParam: "perspective_id" },
  { key: "mode", label: "Mode", apiParam: "mode_id" },
] as const;

export type FacetKey = (typeof FACETS)[number]["key"];
export type Facets = Record<FacetKey, number[]>;

export interface FacetOption {
  id: number;
  name: string;
}

export function parseFacets(params: Partial<Record<FacetKey, string>>): Facets {
  const facets = {} as Facets;
  for (const { key } of FACETS) {
    const ids = (params[key] ?? "")
      .split(",")
      .map((part) => Number(part))
      .filter((id) => Number.isInteger(id) && id > 0);
    facets[key] = [...new Set(ids)];
  }
  return facets;
}

export function anyFacet(facets: Partial<Facets>): boolean {
  return FACETS.some(({ key }) => (facets[key]?.length ?? 0) > 0);
}

// The address form, in FACETS order; an empty facet is left out.
export function appendFacetHref(ps: URLSearchParams, facets: Partial<Facets>) {
  for (const { key } of FACETS) {
    const ids = facets[key] ?? [];
    if (ids.length) ps.set(key, ids.join(","));
  }
}

// The API form: the facet's id param, repeated.
export function appendFacetParams(qs: URLSearchParams, facets: Partial<Facets>) {
  for (const { key, apiParam } of FACETS) {
    for (const id of facets[key] ?? []) qs.append(`${apiParam}[]`, String(id));
  }
}
