import Link from "next/link";
import type { GotmRoundGame, VotingCategory } from "@/lib/api/types";
import { WinnerMark } from "@/components/issue/browse-winner-mark";
import { RoundFoot } from "@/components/issue/gotm-cover-wall-foot";
import { TRACK } from "@/components/issue/gotm-cover-wall-track";
import { UNKNOWN_GAME_TITLE } from "@/components/issue/gotm-shared";
import { gotmLinks } from "@/lib/gotm-links";
import { cn } from "@/lib/utils";

// One round's cover: the round number monumental in the track's ink over
// the winner's key art, the whole cover a link to the lead winner.
export function RoundCover({
  kind,
  roundNumber,
  monthYear,
  winners,
  votingResultsMessageId,
}: {
  kind: VotingCategory;
  roundNumber: number;
  monthYear: string;
  winners: GotmRoundGame[];
  votingResultsMessageId: string | null;
}) {
  const track = TRACK[kind];
  const [lead] = winners;
  const game = lead?.game;
  const title = lead ? (game?.title ?? UNKNOWN_GAME_TITLE) : null;
  const art = game?.art_url ?? game?.cover_url;
  const href = lead?.gamedb_game_id ? `/games/${lead.gamedb_game_id}` : null;
  const links = lead
    ? gotmLinks({
        redditUrl: lead.reddit_url,
        threadId: lead.thread_id,
        votingResultsMessageId,
      })
    : [];

  return (
    <article
      aria-label={`Round ${roundNumber}, ${monthYear}`}
      className={cn(
        "group/cover relative isolate flex aspect-[4/5] w-full flex-col overflow-hidden rounded-sm bg-muted sm:aspect-[3/4]",
        "after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-1",
        kind === "gotm" ? "after:bg-gotm" : "after:bg-nr",
      )}
    >
      {art && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={art}
          alt=""
          loading="lazy"
          className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/cover:scale-[1.03]"
        />
      )}
      {/* Ink at the masthead and the foot, the art clear between. */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-background)_90%,transparent)_0%,color-mix(in_oklab,var(--color-background)_55%,transparent)_16%,color-mix(in_oklab,var(--color-background)_5%,transparent)_32%,color-mix(in_oklab,var(--color-background)_10%,transparent)_50%,color-mix(in_oklab,var(--color-background)_97%,transparent)_84%)]"
      />
      {href && (
        <Link
          href={href}
          aria-label={`View ${title}`}
          className="absolute inset-0 z-10 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-none focus-visible:ring-inset"
        />
      )}

      <div className="flex items-end gap-2.5 px-4.5 pt-4">
        <p
          className={cn(
            "font-headline text-[4rem] leading-[0.8]",
            track.number,
          )}
        >
          {roundNumber}
        </p>
        <p className="font-label text-[0.82rem] leading-[1.15] font-extrabold tracking-[0.08em] [text-shadow:0_1px_6px_rgb(0_0_0/0.8)]">
          Round {roundNumber}
          <span className="block text-faint-foreground">{monthYear}</span>
        </p>
      </div>

      {lead && (
        <WinnerMark
          track={kind}
          className="absolute top-24 right-3.5 size-16"
        />
      )}

      <RoundFoot kind={kind} title={title} winners={winners} links={links} />
    </article>
  );
}
