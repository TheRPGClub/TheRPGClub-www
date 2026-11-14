import { gameBallotPanels } from "@/lib/games/ballot";
import { GameBallotPanel } from "@/components/voting/game-ballot-panel";

// The current round's ballot strips on the game page, when the game is on
// it. A game can in principle sit on both categories' ballots, so this
// renders one strip per category it appears on.
export async function GameBallotSection({ gameId }: { gameId: number }) {
  const panels = await gameBallotPanels(gameId);
  if (!panels.length) return null;

  return (
    <div className="mt-1.5 space-y-3">
      {panels.map((panel) => (
        <GameBallotPanel key={panel.category} {...panel} />
      ))}
    </div>
  );
}
