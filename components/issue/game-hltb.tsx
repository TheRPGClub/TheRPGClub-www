import { apiFetch } from "@/lib/api";
import type { Hltb } from "@/lib/hltb";
import { getSession } from "@/lib/session";
import { isMemberOrStaff } from "@/lib/staff";
import { Skeleton } from "@/components/ui/skeleton";
import { GameHltbCard } from "@/components/issue/game-hltb-card";

// Reads the game's saved HowLongToBeat times (the profile's `hltb` slice, no
// scrape) for the rail's "Time to beat" card.
export async function GameHltb({
  gameId,
  title,
  releaseDate,
}: {
  gameId: number;
  title: string;
  releaseDate: string | null;
}) {
  const [hltb, session] = await Promise.all([fetchSavedHltb(gameId), getSession()]);
  const canLookUp = isMemberOrStaff(session?.membership);
  return (
    <GameHltbCard
      gameId={gameId}
      title={title}
      releaseDate={releaseDate}
      hltb={hltb}
      canLookUp={canLookUp}
    />
  );
}

// The saved row, null when there is none, undefined when the read failed.
async function fetchSavedHltb(gameId: number): Promise<Hltb | null | undefined> {
  try {
    const res = await apiFetch(`/api/v1/games/${gameId}/profile`, {
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    const body = (await res.json()) as { data?: { hltb?: Hltb | null } };
    return body.data?.hltb ?? null;
  } catch {
    return undefined;
  }
}

export function GameHltbSkeleton() {
  return <Skeleton className="h-44 w-full rounded-sm" />;
}
