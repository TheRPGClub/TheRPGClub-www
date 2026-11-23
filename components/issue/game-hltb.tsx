import { fetchSavedHltb } from "@/lib/games/saved-hltb";
import { getSession } from "@/lib/session";
import { isAdminOrAbove, isMemberOrStaff } from "@/lib/staff";
import { Skeleton } from "@/components/ui/skeleton";
import { GameHltbCard } from "@/components/issue/game-hltb-card";

// Reads the game's saved HowLongToBeat times (the profile's `hltb` slice, no
// scrape) for the hero panel's "Time to beat".
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
      anyTime={isAdminOrAbove(session?.membership)}
    />
  );
}

export function GameHltbSkeleton() {
  return <Skeleton variant="control" className="h-36 w-full" />;
}
