import Link from "next/link";
import type { GotmRoundGame, VotingCategory } from "@/lib/api/types";
import { OutboundLinks, UNKNOWN_GAME_TITLE, splitTitle } from "@/components/issue/gotm-shared";
import { TRACK } from "@/components/issue/gotm-cover-wall-track";
import { gotmLinks, type GotmCardLink } from "@/lib/gotm-links";
import { cn } from "@/lib/utils";

// A round cover's foot: the lead winner's headline (or "No GOTM this
// round"), the co-winners under it and the round's outbound links.
export function RoundFoot({
  kind,
  title,
  winners,
  links,
}: {
  kind: VotingCategory;
  title: string | null;
  winners: GotmRoundGame[];
  links: GotmCardLink[];
}) {
  const track = TRACK[kind];
  const coWinners = winners.slice(1);
  const [first, second] = title ? splitTitle(title) : ["", ""];

  return (
    <div className="mt-auto px-4.5 pb-4">
      {title ? (
        <h3 className="font-headline text-[2.25rem] leading-[0.9] text-balance">
          <span className="sr-only">{track.label}: </span>
          {first && <span className="block">{first}</span>}
          <span className={cn("block", track.accent)}>{second}</span>
        </h3>
      ) : (
        <p className="font-label text-sm font-bold tracking-[0.06em] text-faint-foreground">
          No {kind === "gotm" ? "GOTM" : "non-RPG pick"} this round
        </p>
      )}

      {coWinners.length > 0 && (
        <ul className="relative z-20 mt-2 space-y-1">
          <li
            className={cn(
              "font-label text-[0.78rem] font-extrabold tracking-[0.08em]",
              track.co,
            )}
          >
            {winners.length} winners
          </li>
          {coWinners.map((entry, i) => (
            <CoWinner
              key={entry.gamedb_game_id ?? `index-${i}`}
              entry={entry}
            />
          ))}
        </ul>
      )}

      <OutboundLinks links={links} className="mt-2.5" />
    </div>
  );
}

// A co-winner under the lead headline: its name to the game page, its own
// Reddit post and thread beside it.
function CoWinner({ entry }: { entry: GotmRoundGame }) {
  const title = entry.game?.title ?? UNKNOWN_GAME_TITLE;
  const links = gotmLinks({
    redditUrl: entry.reddit_url,
    threadId: entry.thread_id,
  });
  return (
    <li className="flex flex-wrap items-center gap-x-2 border-t border-foreground/15 pt-1">
      <span className="font-label text-[0.92rem] font-extrabold tracking-[0.03em]">
        +{" "}
        {entry.gamedb_game_id ? (
          <Link
            href={`/games/${entry.gamedb_game_id}`}
            className="underline decoration-foreground/30 underline-offset-3 transition-colors hover:text-highlight"
          >
            {title}
          </Link>
        ) : (
          title
        )}
      </span>
      <OutboundLinks links={links} />
    </li>
  );
}
