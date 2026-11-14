import type { VotingCategory } from "@/lib/api/types";
import { TRACK_NAME } from "@/lib/rounds";
import { GameCover } from "@/components/issue/game-cover";
import { cn } from "@/lib/utils";

export interface RoundProofGame {
  key: string | number;
  title: string;
  coverUrl: string | null | undefined;
  redditUrl?: string | null;
}

const TRACK_INK: Record<VotingCategory, { numeral: string; label: string; bar: string }> = {
  gotm: { numeral: "text-gotm", label: "text-gotm-soft", bar: "bg-gotm" },
  nr_gotm: { numeral: "text-nr", label: "text-nr-soft", bar: "bg-nr" },
};

// Co-winners read A, B, C as on the GOTM history.
const SLOT_TAG = "ABCDEFGHIJ";

// The proof for a round form: the round as the GOTM history and the bot
// will carry it, its numeral in the track's ink over its month and games
// in slot order. Drawn from the form's state, so it follows every edit.
export function RoundProof({
  category,
  roundNumber,
  monthYear,
  games,
}: {
  category: VotingCategory;
  roundNumber: number | null;
  monthYear: string;
  games: readonly RoundProofGame[];
}) {
  const ink = TRACK_INK[category];
  return (
    <div className="bg-card p-5 pb-6">
      {/* Room on the right of the kicker for the proof's stamp. */}
      <p className={cn("font-label min-h-[3.25rem] pr-32 text-[0.85rem] font-bold tracking-[0.08em]", ink.label)}>
        {TRACK_NAME[category]} · {category === "gotm" ? "Game of the Month" : "Non-RPG Game of the Month"}
      </p>
      <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] items-end gap-4 border-b-2 border-foreground pb-3">
        <span className={cn("font-headline text-[5.5rem] leading-[0.8]", ink.numeral)}>
          {roundNumber ?? "?"}
        </span>
        <span className="font-headline min-w-0 pb-1 text-[1.9rem] leading-[0.9] break-words text-foreground">
          {monthYear.trim() || "Month to come"}
        </span>
      </div>
      {games.length === 0 ? (
        <p className="font-label mt-4 grid min-h-28 place-items-center rounded-sm border border-dashed border-border-strong p-3 text-center text-[0.85rem] font-bold tracking-[0.06em] text-faint-foreground">
          Pick the round&apos;s games
        </p>
      ) : (
        <ol className="mt-1">
          {games.map((game, i) => (
            <li
              key={game.key}
              className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-2.5"
            >
              <GameCover
                title={game.title}
                coverUrl={game.coverUrl}
                className="w-11 rounded-xs"
                fallbackClassName="p-1 text-[0.55rem]"
              />
              <span className="min-w-0">
                <span className="font-headline block text-[1.35rem] leading-[0.95] break-words">
                  {game.title}
                </span>
                {game.redditUrl && (
                  <span className="mt-1 block truncate text-[0.78rem] text-faint-foreground">{game.redditUrl}</span>
                )}
              </span>
              {games.length > 1 && (
                <span
                  aria-label={`Slot ${i + 1}`}
                  className={cn("font-headline grid size-7 place-items-center rounded-xs text-[1rem] text-foreground", ink.bar)}
                >
                  {SLOT_TAG[i] ?? i + 1}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
