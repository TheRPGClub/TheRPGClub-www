import Link from "next/link";
import type { RunCardView, RunGame } from "@/lib/challenges/runs";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GameCover } from "@/components/issue/game-cover";
import { MemberMark } from "@/components/challenges/host-badge";
import { MemberLink } from "@/components/member/member-link";
import { DeleteRunButton } from "@/components/challenges/delete-run-button";
import { RunGoal } from "@/components/challenges/pool/run-goal";

// One member's Run as a card (surface brief challenges-pool, 2D): their mark
// and name, the score with the target muted, their Cleared covers then the
// In Progress ones on a dashed outline, a bar with a segment per game to
// Clear in the tint's hi (a Pool Run: a bar for Core and one for Optional,
// its score Core Cleared of the Core Games), and when it started or ended. Your own card wears
// the yellow ring; a Finished Run is stamped; an Abandoned one fades.
export function RunCard({ run }: { run: RunCardView }) {
  const faded = run.status === "abandoned" || run.status === "expired";
  return (
    <article
      className={cn(
        "relative flex flex-col gap-3 rounded-md bg-card px-[18px] pt-[18px] pb-4",
        run.you && "shadow-[inset_0_0_0_2px_var(--color-highlight)]",
        faded && "opacity-75",
      )}
    >
      <header className="flex items-center gap-2.5 pr-24">
        <MemberLink userId={run.userId} className="shrink-0">
          <MemberMark name={run.name} src={run.avatarUrl} size={34} />
        </MemberLink>
        <h3 className="font-headline min-w-0 text-[1.375rem] leading-[0.95] break-words">
          <Link
            href={`/members/${run.userId}`}
            className="hover:text-highlight focus-visible:outline-2 focus-visible:outline-highlight"
          >
            {run.name}
          </Link>
        </h3>
        {run.you && (
          <Badge tone="highlight" className="border-0">
            You
          </Badge>
        )}
      </header>
      <Score run={run} />
      <div className="flex min-h-24 flex-wrap items-end gap-2">
        {run.clearedGames.map((game) => (
          <RunCover key={game.game_id} game={game} />
        ))}
        {run.inProgressGames.map((game) => (
          <RunCover key={game.game_id} game={game} inProgress />
        ))}
        {run.clearedGames.length + run.inProgressGames.length === 0 && (
          <p className="text-sm text-faint-foreground">Nothing played for it yet.</p>
        )}
      </div>
      {run.goal ? (
        <RunGoal goal={run.goal} />
      ) : (
        <div className="flex gap-1" aria-hidden>
          {run.segments.map((on, i) => (
            <i
              key={i}
              className={cn("h-1.5 flex-1 rounded-[1px]", on ? "bg-(--challenge-tint-hi)" : "bg-border-strong")}
            />
          ))}
        </div>
      )}
      <footer className="flex items-center justify-between gap-3 text-[0.85rem] text-faint-foreground">
        <span className="mr-auto">{run.dateLine}</span>
        {run.status === "active" && run.inProgress > 0 && <span>{run.inProgress} In Progress</span>}
        {faded && (
          <Badge tone="status" className="h-5 border-0">
            {run.status === "abandoned" ? "Abandoned" : "Expired"}
          </Badge>
        )}
        {run.canDelete && <DeleteRunButton runId={run.id} />}
      </footer>
      {run.status === "finished" && (
        <span
          className={cn(
            "font-headline absolute right-4 -rotate-5 rounded-xs bg-card px-[9px] pt-1.5 pb-1 text-[1.06rem] leading-none text-(--challenge-tint-hi) shadow-[inset_0_0_0_2px_currentColor]",
            // Under the score on a Pool Run, clear of its two bars and counts.
            run.goal ? "top-[5.25rem]" : "bottom-11",
          )}
        >
          Finished
        </span>
      )}
    </article>
  );
}

// The score at the top right: a Pool Run with Core Games counts those
// ("9 / 14 Core"), else every game Cleared of the target.
function Score({ run }: { run: RunCardView }) {
  const core = run.goal && run.goal.core.total > 0 ? run.goal.core : null;
  return (
    <p className="font-headline absolute top-3.5 right-[18px] text-right text-[3rem] leading-[0.85]">
      {core ? core.cleared : run.cleared}
      <span className="text-[1.6rem] text-faint-foreground"> / {core ? core.total : run.target}</span>
      {core ? (
        <span className="font-label block text-[0.72rem] tracking-[0.08em] text-faint-foreground uppercase">
          Core<span className="sr-only"> Games Cleared</span>
        </span>
      ) : (
        <span className="sr-only"> Cleared</span>
      )}
    </p>
  );
}

function RunCover({ game, inProgress = false }: { game: RunGame; inProgress?: boolean }) {
  return (
    <Link
      href={`/games/${game.game_id}`}
      title={`${game.title}${inProgress ? " (In Progress)" : ""}`}
      className={cn(
        "rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
        inProgress && "outline-2 outline-offset-2 outline-foreground outline-dashed",
      )}
    >
      <GameCover
        title={game.title}
        coverUrl={game.cover_url}
        alt={game.title}
        className="w-[66px]"
        fallbackClassName="text-[0.7rem] p-1"
      />
    </Link>
  );
}
