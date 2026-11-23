import { Gift } from "lucide-react";
import { clubToday } from "@/lib/challenges/dates";
import { challengeTint, tintStyle } from "@/lib/challenges/tint";
import { memberAvatar } from "@/lib/challenges/runs";
import type { ChallengeRun } from "@/lib/challenges/types";
import { eventAge, eventSentence } from "@/lib/dashboard/panel-items";
import { readChallengeActivity, readMyRuns, type ChallengeEvent } from "@/lib/dashboard/panel-sources";
import { PANELS } from "@/lib/dashboard/panels";
import { MemberMark } from "@/components/challenges/host-badge";
import { PanelItem, PanelWhen } from "./panel-list";
import { listBody } from "./body-kit";
import type { BodyProps } from "./panel-body";

// Challenge Activity (the club's recent Runs, Cleared games, Finishes and
// Secret Santa days) and Challenge Runs (the member's running Runs). Each
// row wears its Challenge's tint: a ring round the member, a 9px square by
// the Challenge's name.

const challengeHref = (id: number) => `/challenges/${id}`;

export async function ChallengeActivityBody({ wide }: BodyProps) {
  const events = await readChallengeActivity();
  const now = Date.now();
  const today = clubToday();
  return listBody({
    rows: events,
    title: PANELS.challenges_club.title,
    wide,
    row: (event, i) => (
      <PanelItem
        key={`${event.kind}-${event.run_id ?? event.edition?.id}-${event.game?.game_id ?? i}`}
        media={<EventMark event={event} />}
        plain
        title={eventSentence(event).map((part, j) => (part.strong ? <b key={j}>{part.text}</b> : part.text))}
        href={challengeHref(event.challenge.id)}
        meta={<ChallengeName challenge={event.challenge} />}
        aside={<PanelWhen>{eventAge(event, now, today)}</PanelWhen>}
      />
    ),
  });
}

// The member inside a ring of the tint, or a gift in the tint for an
// Edition's own days.
function EventMark({ event }: { event: ChallengeEvent }) {
  const tint = challengeTint(event.challenge);
  if (!event.user) {
    return (
      <span style={tintStyle(tint)} className="grid size-9 place-items-center rounded-xs bg-(--challenge-tint) text-(--challenge-tint-hi)">
        <Gift aria-hidden className="size-4.5" />
      </span>
    );
  }
  const name = event.user.global_name || event.user.username;
  return (
    <span style={tintStyle(tint)} className="flex rounded-full p-0.5 shadow-[inset_0_0_0_2px_var(--challenge-tint-hi)]">
      <MemberMark name={name} src={memberAvatar(event.user)} size={32} />
    </span>
  );
}

function ChallengeName({ challenge }: { challenge: ChallengeEvent["challenge"] }) {
  return (
    <>
      <i aria-hidden style={tintStyle(challengeTint(challenge))} className="size-2.25 shrink-0 bg-(--challenge-tint-hi)" />
      <span className="truncate">{challenge.name}</span>
    </>
  );
}

export async function ChallengeRunsBody({ viewer, wide }: BodyProps) {
  const runs = await readMyRuns(viewer.id);
  return listBody({
    rows: runs,
    title: PANELS.challenge_runs_mine.title,
    wide,
    row: (run) => (
      <PanelItem
        key={run.id}
        media={<RunTally run={run} />}
        title={run.edition ? `${run.challenge.name} ${run.edition.year}` : run.challenge.name}
        href={challengeHref(run.challenge.id)}
        meta={runMeta(run)}
      />
    ),
  });
}

// "4 of 12 cleared · 1 playing"; an Assignment Run names its game once
// revealed.
function runMeta(run: ChallengeRun): string {
  const game = run.assignment?.game?.title;
  if (run.challenge.challenge_format === "assignment") return game ? `Your gift: ${game}` : "Waiting for the reveal";
  const { cleared, target, in_progress } = run.progress;
  return [`${cleared} of ${target} cleared`, in_progress > 0 && `${in_progress} playing`].filter(Boolean).join(" · ");
}

// The Run's cleared count in Anton on the tint fill, with paper type.
function RunTally({ run }: { run: ChallengeRun }) {
  return (
    <span
      style={tintStyle(challengeTint(run.challenge))}
      className="font-headline grid size-9 place-items-center rounded-xs bg-(--challenge-tint) text-lg leading-none text-(--challenge-type)"
    >
      {run.progress.cleared}
    </span>
  );
}
