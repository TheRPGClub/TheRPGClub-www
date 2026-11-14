import { fetchGotmRounds } from "@/lib/api/gotm-rounds";
import { getSession } from "@/lib/session";
import { BrowseLead, latestWinners } from "@/components/issue/browse-lead";

// The index's opening: the latest GOTM winners as wide key-art cards.
export async function GamesLead() {
  // The GOTM history read needs auth; skip it rather than make a fetch that
  // can only 401 (see lib/api/gotm-rounds.ts).
  if (!(await getSession())) return null;
  const history = await fetchGotmRounds({
    kind: "both",
    year: null,
    q: "",
    sort: "desc",
    page: 1,
  });
  return <BrowseLead picks={latestWinners(history?.rounds ?? [])} />;
}
