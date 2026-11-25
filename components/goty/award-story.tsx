import type { CSSProperties } from "react";
import { Trophy } from "lucide-react";
import type { GotyAward, GotyVote } from "@/lib/goty/types";
import { AWARD_INK, decidedLine, resultRows } from "@/lib/goty/awards";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GameHeadline } from "@/components/issue/game-cover";
import { AWARD_TONE } from "./ballot-card";
import { StoryTally } from "./story-tally";

// A headline's second line in its Award's accent, as the Cover Story sets
// a GOTM winner's in yellow and an NR-GOTM winner's in soft violet.
const ACCENT = { gotm: "text-highlight", nr_gotm: "text-nr-soft", game_of_the_year: "text-foreground" } as const;

// A decided Award's cover story: the winner's art under the ink scrim, the
// "<Award> <year>" chip, the two-line headline and how it won, with the
// Award's tally beside it and a 4px foot in its ink. `compact` is the
// smaller one shown under its envelope during another Award's runoff.
export function AwardStory({ vote, award, compact = false }: { vote: GotyVote; award: GotyAward; compact?: boolean }) {
  const winner = award.winner;
  const game = winner?.game ?? award.ballot.find((g) => g.game_id === winner?.gamedb_game_id);
  if (!winner || !game) return null;
  const art = game.art_url ?? game.cover_url;
  const rows = resultRows(award);
  return (
    <article
      style={{ "--award-ink": AWARD_INK[award.award] } as CSSProperties}
      className={cn(
        "relative isolate grid overflow-hidden rounded-[3.2px] bg-card after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-(--award-ink) md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]",
        compact ? "md:min-h-[280px]" : "md:min-h-[360px]",
      )}
    >
      {art && (
        // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
        <img src={art} alt="" className="absolute inset-x-0 top-0 -z-20 h-[300px] w-full object-cover md:inset-y-0 md:right-[35%] md:h-full md:w-[65%]" />
      )}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[300px] bg-linear-to-t from-card via-background/50 via-60% to-background/20 md:inset-y-0 md:right-[35%] md:h-full md:w-[65%] md:bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-background)_96%,transparent)_0%,color-mix(in_oklab,var(--color-background)_70%,transparent)_45%,color-mix(in_oklab,var(--color-background)_15%,transparent)_100%),linear-gradient(0deg,color-mix(in_oklab,var(--color-background)_80%,transparent),transparent_50%)]"
      />
      <div className="flex flex-col items-start justify-end gap-3 px-4 pt-30 pb-2 md:p-7">
        <Badge tone={AWARD_TONE[award.award]}>
          <Trophy data-icon="inline-start" />
          {award.name} {vote.year}
        </Badge>
        <GameHeadline
          as="h2"
          title={game.title}
          accentClassName={ACCENT[award.award]}
          className={cn("max-w-[11ch] text-5xl leading-[0.9]", compact ? "md:text-[3.2rem]" : "md:text-[5rem]")}
        />
        <DecidedLine line={decidedLine(award)} />
      </div>
      <StoryTally award={award} rows={rows} compact={compact} />
    </article>
  );
}

// "14 votes · won by vote" with the figure in Anton.
function DecidedLine({ line }: { line: string }) {
  const [, figure, rest] = line.match(/^(\d+) (.*)$/) ?? [null, null, line];
  return (
    <p className="font-label text-sm font-extrabold tracking-[0.08em] text-dim-foreground uppercase">
      {figure && <span className="font-headline mr-1 text-[1.8rem] leading-none tracking-normal text-foreground">{figure}</span>}
      {rest}
    </p>
  );
}
