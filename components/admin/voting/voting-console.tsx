"use client";

import { useId, useState, useTransition, type ReactNode } from "react";
import { CalendarClock, Megaphone, RefreshCw, SquareX } from "lucide-react";
import {
  closeVotingNowAction,
  publishResultsAction,
  repostPanelsAction,
  rescheduleVoteAction,
} from "@/app/actions/voting-console";
import type { BotJob, VotingRound } from "@/lib/api/types";
import { CLUB_TIME_ZONE, localInputToOffsetIso, toLocalInputValue } from "@/lib/public-reminders";
import {
  clubClock,
  dayAndClock,
  latestJobFor,
  nextVoteRefusal,
  roundStatusLine,
  rulerPct,
  rulerScale,
  rulerTime,
  shortDay,
  totalVotes,
  type RulerTick,
} from "@/lib/voting-console";
import { useIsClient } from "@/hooks/use-is-client";
import { TypedConfirmButton } from "@/components/admin/desk/typed-confirm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRuler } from "./date-ruler";
import { JobLine } from "./job-line";
import { TallyTrack, type TrackView } from "./tally-track";

export type ConsoleTrack = TrackView;

// The voting console (admin-c-3): the round numeral and status, the date
// ruler with its Next vote pin, both private tallies, and the operations.
// The pin and the Next vote card share one draft, so a drag, the arrow keys
// or the date field all set the same time, saved only on "Set next vote".
export function VotingConsole({
  round,
  nominationsOpenedAt,
  tracks,
  jobs,
  now,
}: {
  round: VotingRound;
  nominationsOpenedAt: string | null;
  tracks: TrackView[];
  jobs: BotJob[];
  now: number;
}) {
  const isClient = useIsClient();
  const n = round.round_number;
  const saved = Date.parse(round.voting_opens_at);
  const movable = round.phase === "nominating";
  const [draft, setDraft] = useState<number>(saved);
  const [fieldOpen, setFieldOpen] = useState(false);
  const votes = tracks.every((t) => t.readable) ? tracks.reduce((s, t) => s + totalVotes(t.lines), 0) : null;
  const tieJob = latestJobFor(jobs, "voting_tie_broken", n);

  // The ruler: every known point of the round, and room to drag the pin.
  const points = [
    nominationsOpenedAt ? Date.parse(nominationsOpenedAt) : NaN,
    saved,
    Date.parse(round.closed_at ?? round.voting_closes_at),
    round.runoff_closes_at ? Date.parse(round.runoff_closes_at) : NaN,
    round.decided_at ? Date.parse(round.decided_at) : NaN,
    movable ? draft : NaN,
  ];
  const scale = rulerScale(points, now, movable);
  const ticks = isClient ? rulerTicks(round, nominationsOpenedAt, now, movable && draft === saved) : [];
  const pinMax = rulerTime(rulerPct(scale.end, scale) - 4, scale);

  return (
    <div>
      <header className="grid items-end gap-x-7 gap-y-1.5 border-b-2 border-paper pb-3.5 md:grid-cols-[auto_minmax(0,1fr)]">
        <p aria-hidden className="font-headline text-[5.5rem] leading-[0.8] md:text-[8rem]">
          {n}
        </p>
        <div className="min-w-0">
          <h1 className="font-headline text-[2.6rem] leading-[0.9] md:text-[3.75rem]">Voting console</h1>
          <p className="font-label mt-1.5 text-base tracking-[0.08em] text-paper-dim">
            {roundStatusLine(round, votes, now)}
          </p>
        </div>
      </header>

      <div className="mt-6.5 hidden md:block">
        {isClient ? (
          <DateRuler
            scale={scale}
            ticks={ticks}
            now={now}
            pin={
              movable
                ? {
                    at: draft,
                    min: now,
                    max: pinMax,
                    label: shortDay(draft),
                    caption: "Next vote",
                    onChange: setDraft,
                    onTypeDate: () => {
                      setFieldOpen(true);
                      window.setTimeout(() => document.getElementById("next-vote-field")?.focus(), 0);
                    },
                  }
                : null
            }
            ghost={movable ? null : { label: "Next vote", caption: `After Round ${n}` }}
          />
        ) : (
          <div className="h-[92px]" />
        )}
      </div>

      <div className="mt-5.5 grid items-start gap-8 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_22rem]">
        {tracks.map((track) => (
          <TallyTrack key={track.category} round={round} track={track} tieJob={tieJob} />
        ))}
        <aside aria-label="Round operations" className="grid gap-2.5 lg:col-span-2 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1">
          <CloseNowOp round={round} />
          <PublishOp round={round} job={latestJobFor(jobs, "voting_results_publish", n)} />
          <RepostOp round={round} job={latestJobFor(jobs, "voting_panels_repost", n)} />
          <NextVoteOp
            round={round}
            now={now}
            draft={draft}
            setDraft={setDraft}
            fieldOpen={fieldOpen}
            setFieldOpen={setFieldOpen}
            isClient={isClient}
          />
        </aside>
      </div>
    </div>
  );
}

function rulerTicks(
  round: VotingRound,
  nominationsOpenedAt: string | null,
  now: number,
  showClose: boolean,
): RulerTick[] {
  const t = (key: string, iso: string, caption: string): RulerTick => {
    const at = Date.parse(iso);
    return { key, at, label: shortDay(at), caption, tone: "plain" };
  };
  const ticks: RulerTick[] = [];
  if (nominationsOpenedAt) ticks.push(t("noms", nominationsOpenedAt, "Noms open"));
  if (round.phase !== "nominating") {
    ticks.push(t("opens", round.voting_opens_at, "Vote opens"));
  }
  if (round.phase !== "nominating" || showClose) {
    ticks.push(
      t("closes", round.closed_at ?? round.voting_closes_at, round.voting_ended ? "Vote closed" : "Vote closes"),
    );
  }
  if (round.runoff_closes_at) {
    ticks.push(t("runoff", round.runoff_closes_at, round.runoff_ended ? "Runoff closed" : "Runoff closes"));
  }
  if (round.decided_at) ticks.push(t("decided", round.decided_at, "Decided"));
  ticks.push({ key: "now", at: now, label: "Today", caption: shortDay(now), tone: "now" });
  return ticks;
}

function Op({ icon: Icon, title, children }: { icon: typeof SquareX; title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-md bg-ink-2 px-3.5 py-3">
      <h2 className="font-label flex items-center gap-2 text-[0.95rem] font-extrabold tracking-[0.06em]">
        <Icon aria-hidden className="size-4" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function OpText({ children }: { children: ReactNode }) {
  return <p className="mt-0.75 mb-2.5 text-[0.84rem] leading-[1.4] text-paper-dim">{children}</p>;
}

function OpNote({ children }: { children: ReactNode }) {
  return <span className="text-[0.8rem] text-paper-mute">{children}</span>;
}

function CloseNowOp({ round }: { round: VotingRound }) {
  const n = round.round_number;
  const [done, setDone] = useState(false);
  return (
    <Op icon={SquareX} title="Close voting now">
      <OpText>Ends the vote early. Asks you to type the round number.</OpText>
      <div className="flex flex-wrap items-center gap-2">
        {round.voting_open ? (
          <TypedConfirmButton
            triggerLabel={`Close Round ${n}`}
            label="Close voting now"
            question={`Close voting for Round ${n} now?`}
            words={`CLOSE ROUND ${n}`}
            actionLabel="Close voting"
            onConfirm={async () => {
              const result = await closeVotingNowAction(n);
              if (!result.ok) return { error: result.error };
              setDone(true);
            }}
          >
            Members can&apos;t vote after this. The bot posts the results within seconds.
          </TypedConfirmButton>
        ) : (
          <>
            <Button type="button" variant="destructive-outline" size="sm" disabled>
              Close Round {n}
            </Button>
            <OpNote>{round.voting_ended ? "Voting has closed" : "While voting is open"}</OpNote>
          </>
        )}
      </div>
      {done && (
        <p role="status" className="mt-2 text-[0.84rem] text-paper-dim">
          Voting for Round {n} is closed.
        </p>
      )}
    </Op>
  );
}

// Publish and repost: a button that queues the bot's job, then that job's
// status; before any click, the newest such job for this round.
function useJobAction(run: () => Promise<{ ok: boolean; data?: BotJob; error?: string }>) {
  const [fresh, setFresh] = useState<BotJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const go = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await run();
        if (result.ok && result.data) setFresh(result.data);
        else setError(result.error ?? "Couldn't queue it.");
      } catch {
        setError("Couldn't reach the club's server. Try again.");
      }
    });
  };
  return { fresh, error, pending, go };
}

function PublishOp({ round, job }: { round: VotingRound; job: BotJob | null }) {
  const n = round.round_number;
  const { fresh, error, pending, go } = useJobAction(() => publishResultsAction(n));
  return (
    <Op icon={Megaphone} title="Publish results">
      <OpText>Results post in #announcements and the winner threads open.</OpText>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button type="button" variant="highlight" size="sm" disabled={!round.voting_ended || pending} onClick={go}>
          {pending ? "Queueing..." : job || fresh ? "Publish again" : "Publish"}
        </Button>
        {!round.voting_ended && <OpNote>After voting closes</OpNote>}
        {!fresh && <JobLine job={job} what="The results post" />}
      </div>
      {fresh && <JobLine job={null} fresh={fresh} what="The results post" />}
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </Op>
  );
}

function RepostOp({ round, job }: { round: VotingRound; job: BotJob | null }) {
  const { fresh, error, pending, go } = useJobAction(() => repostPanelsAction());
  return (
    <Op icon={RefreshCw} title="Repost voting panels">
      <OpText>If the ballots went missing from Discord.</OpText>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button type="button" variant="outline" size="sm" disabled={!round.voting_open || pending} onClick={go}>
          {pending ? "Queueing..." : "Repost"}
        </Button>
        {!round.voting_open && <OpNote>While voting is open</OpNote>}
        {!fresh && <JobLine job={job} what="The voting panels" />}
      </div>
      {fresh && <JobLine job={null} fresh={fresh} what="The voting panels" />}
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </Op>
  );
}

function NextVoteOp({
  round,
  now,
  draft,
  setDraft,
  fieldOpen,
  setFieldOpen,
  isClient,
}: {
  round: VotingRound;
  now: number;
  draft: number;
  setDraft: (at: number) => void;
  fieldOpen: boolean;
  setFieldOpen: (open: boolean) => void;
  isClient: boolean;
}) {
  const id = useId();
  const saved = Date.parse(round.voting_opens_at);
  const movable = round.phase === "nominating";
  const changed = movable && draft !== saved;
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const when = (at: number) =>
    isClient ? `${dayAndClock(at)} your time, ${clubClock(at, CLUB_TIME_ZONE)} club time.` : "";

  const save = () => {
    setError(null);
    setNotice(null);
    const refusal = nextVoteRefusal(round, draft, Date.now());
    if (refusal) {
      setError(refusal);
      return;
    }
    const iso = new Date(draft).toISOString();
    startTransition(async () => {
      const result = await rescheduleVoteAction(round.round_number, iso);
      if (!result.ok || !result.data) {
        setError(result.error ?? "Couldn't move the vote.");
        return;
      }
      setFieldOpen(false);
      setNotice(`Saved. Voting closes ${when(Date.parse(result.data.voting_closes_at))}`);
    });
  };

  if (!movable) {
    return (
      <Op icon={CalendarClock} title="Next vote">
        <OpText>{nextVoteRefusal(round, null, now)}</OpText>
      </Op>
    );
  }

  return (
    <Op icon={CalendarClock} title="Next vote">
      <OpText>
        <span className={changed ? "text-highlight" : undefined}>{when(draft)}</span>
        {changed && <> Was {isClient ? dayAndClock(saved) : ""}.</>}
      </OpText>
      {fieldOpen && (
        <div className="mb-2.5">
          <label htmlFor="next-vote-field" className="mb-1 block text-[0.8rem] text-paper-mute">
            Vote opens (your time)
          </label>
          <Input
            id="next-vote-field"
            type="datetime-local"
            aria-describedby={`${id}-zone`}
            value={isClient ? toLocalInputValue(new Date(draft).toISOString()) : ""}
            onChange={(e) => {
              const iso = localInputToOffsetIso(e.target.value);
              if (iso) setDraft(Date.parse(iso));
            }}
            className="bg-ink"
          />
          <p id={`${id}-zone`} className="mt-1 text-[0.78rem] text-paper-mute">
            The close moves with it, to the end of that weekend in club time.
          </p>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {changed ? (
          <>
            <Button type="button" variant="highlight" size="sm" disabled={pending} onClick={save}>
              {pending ? "Saving..." : "Set next vote"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => {
                setDraft(saved);
                setError(null);
              }}
            >
              Undo
            </Button>
          </>
        ) : (
          !fieldOpen && (
            <Button type="button" variant="outline" size="sm" onClick={() => setFieldOpen(true)}>
              Change date
            </Button>
          )
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {notice && !changed && (
        <p role="status" className="mt-2 text-[0.84rem] text-paper-dim">
          {notice}
        </p>
      )}
    </Op>
  );
}
