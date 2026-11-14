// The game index's URL: the search, the winner filter and the page, in that
// order, each left out when it has nothing to say (page one stays bare).
// The grid's pagination, the winner filter and the search field all build it.

export type WinnerFilter = "gotm" | "nr_gotm" | null;

export function parseWinner(value: string | undefined): WinnerFilter {
  return value === "gotm" || value === "nr_gotm" ? value : null;
}

export function gamesIndexHref({
  q = "",
  winner = null,
  page = 1,
}: {
  q?: string;
  winner?: string | null;
  page?: number;
}): string {
  const ps = new URLSearchParams();
  if (q.trim()) ps.set("q", q.trim());
  if (winner) ps.set("winner", winner);
  if (page > 1) ps.set("page", String(page));
  return `/games${ps.size ? `?${ps}` : ""}`;
}
