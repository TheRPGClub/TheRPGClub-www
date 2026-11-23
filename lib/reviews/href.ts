// A Review's own page: /reviews/:id, flat like the API. `edit` opens it in
// the editor (the page reads any `?edit`).
export function reviewHref(reviewId: number, { edit = false } = {}): string {
  const path = `/reviews/${reviewId}`;
  return edit ? `${path}?edit=1` : path;
}
