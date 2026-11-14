"use client";

import { Scale } from "lucide-react";
import type { BotJob, Game, VotingCategory, VotingRound } from "@/lib/api/types";
import { CATEGORY_SHORT, canResetVotes, type TallyLine } from "@/lib/voting-console";
import { cn } from "@/lib/utils";
import { TallyLines, TRACK_INK } from "./tally-lines";
import { TallyResets } from "./tally-resets";
import { TieBreak } from "./tie-break";

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
  const ink = TRACK_INK[category];
  const nominating = round.phase === "nominating";
  const leadersTied =
    round.phase === "voting" &&
    track.lines.length > 1 &&
    track.lines[0].count > 0 &&
    track.lines[0].count === track.lines[1].count;

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
        <small className="ml-auto text-[0.78rem] tracking-[0.08em] text-faint-foreground">
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
        <p className="py-4 text-[0.9rem] text-dim-foreground">
          {nominating ? "No nominations yet." : "Nothing on this ballot."}
        </p>
      ) : (
        <TallyLines lines={track.lines} ink={ink} showCounts={!nominating} />
      )}

      {nominating && track.lines.length > 0 && (
        <p className="mt-3 text-[0.86rem] text-dim-foreground">The tally starts when the vote opens.</p>
      )}

      {leadersTied && (
        <p className={cn("mt-3 flex gap-1.5 text-[0.86rem]", ink.soft)}>
          <Scale aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          Level at the top. If it closes tied, the tied games go to a runoff.
        </p>
      )}

      {track.runoff && (
        <div className="mt-5">
          <h3 className="font-label flex items-baseline gap-2 border-b border-border pb-1 text-[0.9rem] font-extrabold tracking-[0.06em] text-dim-foreground">
            Runoff
            <small className="ml-auto text-[0.74rem] tracking-[0.08em] text-faint-foreground">
              {round.runoff_open ? "Open" : "Closed"}
            </small>
          </h3>
          {track.runoff.readable ? (
            <TallyLines lines={track.runoff.lines} ink={ink} showCounts />
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
        <TallyResets round={round} category={category} total={track.total} hasRunoff={!!track.runoff} />
      )}
    </section>
  );
}
