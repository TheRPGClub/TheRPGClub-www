import { fetchSavedHltb } from "@/lib/games/saved-hltb";
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

export function GameHltbSkeleton() {
  return <Skeleton variant="card" className="h-44 w-full" />;
}
