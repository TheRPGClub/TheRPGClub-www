// The game's reviews page URLs. Page 1 stays bare; the reader (`?review=`)
// and the composer (`?compose`) keep the page they were opened from.
export function reviewsPageHrefs(gameId: number, currentPage: number) {
  const base = `/games/${gameId}/reviews`;
  const list = (page: number) => (page > 1 ? `${base}?page=${page}` : base);
  const reader = (reviewId: number, page = currentPage) =>
    `${base}?${page > 1 ? `page=${page}&` : ""}review=${reviewId}`;
  const compose = `${list(currentPage)}${currentPage > 1 ? "&" : "?"}compose=1#compose`;
  return { list, reader, compose };
}
