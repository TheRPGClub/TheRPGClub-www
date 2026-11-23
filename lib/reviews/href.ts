// A Review's own page: /reviews/:id, flat like the API.
//
// - `edit` opens the first take (the Review itself) in the editor.
// - `revision` opens that Published Revision in the editor.
// - `revisit` opens the Draft Revision, starting one if there is none.
// - `take` is a Published Revision's stop on the page (`#revision-7`).
//
// The page reads any `?edit` or `?revisit`.
export function reviewHref(
  reviewId: number,
  {
    edit = false,
    revision,
    revisit = false,
    take,
  }: { edit?: boolean; revision?: number; revisit?: boolean; take?: number } = {},
): string {
  const path = `/reviews/${reviewId}`;
  if (revisit) return `${path}?revisit=1`;
  if (revision !== undefined) return `${path}?revision=${revision}`;
  if (edit) return `${path}?edit=1`;
  if (take !== undefined) return `${path}#${takeAnchor(take)}`;
  return path;
}

// A Published Revision's stop on its Review's page.
export function takeAnchor(revisionId: number): string {
  return `revision-${revisionId}`;
}
