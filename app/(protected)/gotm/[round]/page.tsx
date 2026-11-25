import { notFound } from "next/navigation";
import { requireAuth, requireFeature } from "@/lib/session";
import { fetchGotmRoundDetail, parseGotmHistoryFilters } from "@/lib/api/gotm-rounds";
import { discordLinkConfig } from "@/lib/gotm-links";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { RoundPage } from "@/components/gotm/round/round-page";

// A closed GOTM round's Round Page. Open and unknown rounds are 404s (an
// open round lives on /voting). The query string is the history's filters,
// kept for the way back.
export default async function GotmRoundPage({
  params,
  searchParams,
}: {
  params: Promise<{ round: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ round }, raw] = await Promise.all([params, searchParams]);
  if (!/^\d{1,6}$/.test(round)) notFound();
  const roundNumber = Number(round);

  // The read needs auth; the session read is memoised per request, and the
  // read doesn't need it, so it starts alongside the gate (as on /gotm).
  const [, features, detail] = await Promise.all([
    requireAuth(),
    requireFeature("voting_gotm"),
    fetchGotmRoundDetail(roundNumber),
  ]);
  if (detail === "not_found") notFound();

  return (
    <RoundPage
      roundNumber={roundNumber}
      round={detail}
      filters={parseGotmHistoryFilters(raw)}
      discord={discordLinkConfig()}
      badge={features.preview("voting_gotm") && <PreviewBadge />}
    />
  );
}
