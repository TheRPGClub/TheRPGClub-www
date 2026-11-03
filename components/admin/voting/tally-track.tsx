"use client";

import { useState, useTransition } from "react";
import { RotateCcw, Scale } from "lucide-react";
import { resetVotesAction, resolveTieAction } from "@/app/actions/voting-console";
import type { BotJob, Game, VotingCategory, VotingRound } from "@/lib/api/types";
import { CATEGORY_SHORT, canResetVotes, type TallyLine } from "@/lib/voting-console";
import { TypedConfirmButton } from "@/components/admin/desk/typed-confirm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { JobLine } from "./job-line";

export interface TrackView {
  category: VotingCategory;
  lines: TallyLine[];
  total: number;
  // False when the tally couldn't be read (or came back hidden).
  readable: boolean;
  runoff: { lines: TallyLine[]; readable: boolean } | null;
  // Games still tied in this category.
  tied: Game[];
}

const INK = {
  gotm: { rule: "border-gotm", soft: "text-gotm-soft", bar: "bg-gotm" },
  nr_gotm: { rule: "border-nr", soft: "text-nr-soft", bar: "bg-nr" },
} as const;

// One category's private tally on the press check: each game's votes as a
// big numeral and a bar against the leader, the leader in the track's soft
// ink, the also-rans dimmed. Under it the reset (typed confirm), the runoff
// tally when the round had one, and the tie break once it is the admins'
// call.
export function TallyTrack({
  round,
  track,
  tieJob,
}: {
  round: VotingRound;
  track: TrackView;
  tieJob: BotJob | null;
}) {
  const { category } = track;
  const label = CATEGORY_SHORT[category];
  const ink = INK[category];
  const n = round.round_number;
  const [notice, setNotice] = useState<string | null>(null);
  const nominating = round.phase === "nominating";
  const leadersTied =
    round.phase === "voting" &&
    track.lines.length > 1 &&
    track.lines[0].count > 0 &&
    track.lines[0].count === track.lines[1].count;

  const reset = (runoff: boolean) => async () => {
    setNotice(null);
    const result = await resetVotesAction(category, n, runoff);
    if (!result.ok) return { error: result.error };
    const count = result.data?.count ?? 0;
    setNotice(
      `Deleted ${count} ${label}${runoff ? " runoff" : ""} ${count === 1 ? "vote" : "votes"} for Round ${n}.`,
    );
  };

  return (
    <section aria-labelledby={`tally-${category}`} className="min-w-0">
      <h2
        id={`tally-${category}`}
        className={cn(
          "font-label flex items-baseline gap-2.5 border-b-2 pb-1.5 text-[1.05rem] font-extrabold tracking-[0.06em]",
          ink.rule,
        )}
      >
        <span className={ink.soft}>{label}</span>
        {nominating ? "Nominations" : "Private tally"}
        <small className="ml-auto text-[0.78rem] tracking-[0.08em] text-paper-mute">
          {nominating
            ? `${track.lines.length} ${track.lines.length === 1 ? "game" : "games"}`
            : `${track.total} ${track.total === 1 ? "vote" : "votes"}`}
        </small>
      </h2>

      {!track.readable ? (
        <p role="alert" className="py-4 text-[0.9rem] text-destructive">
          {"Couldn't read the tally. Refresh to try again."}
        </p>
      ) : track.lines.length === 0 ? (
        <p className="py-4 text-[0.9rem] text-paper-dim">
          {nominating ? "No nominations yet." : "Nothing on this ballot."}
        </p>
      ) : (
        <Lines lines={track.lines} ink={ink} showCounts={!nominating} />
      )}

      {nominating && track.lines.length > 0 && (
        <p className="mt-3 text-[0.86rem] text-paper-dim">The tally starts when the vote opens.</p>
      )}

      {leadersTied && (
        <p className={cn("mt-3 flex gap-1.5 text-[0.86rem]", ink.soft)}>
          <Scale aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          Level at the top. If it closes tied, the tied games go to a runoff.
        </p>
      )}

      {track.runoff && (
        <div className="mt-5">
          <h3 className="font-label flex items-baseline gap-2 border-b border-rule pb-1 text-[0.9rem] font-extrabold tracking-[0.06em] text-paper-dim">
            Runoff
            <small className="ml-auto text-[0.74rem] tracking-[0.08em] text-paper-mute">
              {round.runoff_open ? "Open" : "Closed"}
            </small>
          </h3>
          {track.runoff.readable ? (
            <Lines lines={track.runoff.lines} ink={ink} showCounts />
          ) : (
            <p role="alert" className="py-3 text-[0.9rem] text-destructive">
              {"Couldn't read the runoff tally."}
            </p>
          )}
        </div>
      )}

      {track.tied.length > 0 && round.phase === "tie" && (
        <TieBreak round={round} category={category} games={track.tied} job={tieJob} />
      )}

      {canResetVotes(round) && (
        <div className="mt-5.5 flex flex-col items-start gap-3">
          <TypedConfirmButton
            triggerLabel={`Reset ${label} votes`}
            triggerIcon={RotateCcw}
            label={`Reset ${label} votes`}
            question={`Delete all ${track.total} ${label} ${track.total === 1 ? "vote" : "votes"} for Round ${n}?`}
            words={`RESET ${label}`}
            actionLabel="Reset"
            actionIcon={RotateCcw}
            onConfirm={reset(false)}
          >
            Members vote again from scratch.{" "}
            {category === "gotm" ? "NR-GOTM" : "GOTM"} stays as it is.
          </TypedConfirmButton>
          {track.runoff && (
            <TypedConfirmButton
              triggerLabel={`Reset ${label} runoff votes`}
              triggerIcon={RotateCcw}
              label={`Reset ${label} runoff votes`}
              question={`Delete every ${label} runoff vote for Round ${n}?`}
              words={`RESET ${label} RUNOFF`}
              actionLabel="Reset"
              actionIcon={RotateCcw}
              onConfirm={reset(true)}
            >
              Only the runoff ballot. The main vote stays as it is.
            </TypedConfirmButton>
          )}
          {notice && (
            <p role="status" className="text-[0.86rem] text-paper-dim">
              {notice}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function Lines({
  lines,
  ink,
  showCounts,
}: {
  lines: TallyLine[];
  ink: (typeof INK)[VotingCategory];
  showCounts: boolean;
}) {
  const top = lines[0]?.count ?? 0;
  return (
    <ol>
      {lines.map((line, i) => {
        const lead = showCounts && top > 0 && line.count === top;
        const dim = showCounts && !lead && (i >= 2 || line.count === 0);
        return (
          <li
            key={line.gameId}
            className="grid grid-cols-[3.2rem_minmax(0,1fr)] items-center gap-3 border-b border-rule py-2.25"
          >
            <span
              className={cn(
                "font-headline text-right text-[2.2rem] leading-[0.85] tabular-nums",
                lead ? ink.soft : showCounts ? "text-paper" : "text-paper-mute",
              )}
            >
              {showCounts ? line.count : "·"}
            </span>
            <div className="min-w-0">
              <p className={cn("leading-tight", dim ? "text-paper-dim" : "font-semibold text-paper")}>
                {line.title}
                {showCounts && <span className="sr-only">, {line.count} {line.count === 1 ? "vote" : "votes"}</span>}
              </p>
              {showCounts && top > 0 && (
                <i
                  aria-hidden
                  className={cn("mt-1.5 block h-[3px]", ink.bar)}
                  style={{ width: `${(line.count / top) * 100}%` }}
                />
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// The admins' call once the vote (and any runoff) closed level: pick the
// winner, or more than one for joint winners, as the bot's tie prompt does.
function TieBreak({
  round,
  category,
  games,
  job,
}: {
  round: VotingRound;
  category: VotingCategory;
  games: Game[];
  job: BotJob | null;
}) {
  const label = CATEGORY_SHORT[category];
  const [picked, setPicked] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const hadRunoff = (round.runoff_ties?.[category]?.length ?? 0) > 0;

  const toggle = (id: number) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await resolveTieAction(round.round_number, category, picked);
      if (!result.ok) setError(result.error ?? "Couldn't break the tie.");
    });
  };

  return (
    <fieldset className="mt-5 rounded-md bg-ink-2 px-3.5 pt-1 pb-3.5">
      <legend className="sr-only">{label} tie break</legend>
      <p className="font-label flex items-center gap-2 pt-2.5 text-[0.95rem] font-extrabold tracking-[0.06em]">
        <Scale aria-hidden className="size-4" />
        {label} tie break
      </p>
      <p className="mt-1 mb-2.5 text-[0.84rem] leading-snug text-paper-dim">
        {hadRunoff ? "The runoff tied again. " : "The vote closed tied. "}
        Pick the winner, or more than one for joint winners. The bot announces it.
      </p>
      <ul className="space-y-1.5">
        {games.map((game) => (
          <li key={game.game_id}>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-sm px-1 py-1 hover:bg-ink-3">
              <input
                type="checkbox"
                checked={picked.includes(game.game_id)}
                onChange={() => toggle(game.game_id)}
                className="size-4 accent-highlight"
              />
              <span className="font-semibold">{game.title}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <Button
          type="button"
          variant="highlight"
          size="sm"
          disabled={picked.length === 0 || pending}
          onClick={submit}
        >
          {pending ? "Working..." : picked.length > 1 ? "Make them joint winners" : "Pick the winner"}
        </Button>
        <JobLine job={job} what="The tie break announcement" />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}
