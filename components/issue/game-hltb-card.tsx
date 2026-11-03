"use client";

import { useState, useTransition } from "react";
import {
  ArrowUpRight,
  CloudOff,
  LoaderCircle,
  RotateCw,
  SearchX,
  Timer,
} from "lucide-react";
import { lookupHltbAction } from "@/app/actions/hltb";
import {
  HLTB_FAILURE_COPY,
  hltbBars,
  hltbLookedUpLabel,
  hltbNotSavedNote,
  hltbSearchUrl,
  type Hltb,
  type HltbLookupFailure,
} from "@/lib/hltb";
import { Chip } from "@/components/issue/chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The game page rail's "Time to beat" card: HowLongToBeat's hours, one bar
// per play style on a shared scale. With no saved times it offers the
// lookup; opening the page never looks anything up.

type CardState =
  | { kind: "times"; hltb: Hltb; saved: boolean; fresh: boolean }
  | { kind: "empty" }
  | { kind: "unloaded" }
  | { kind: "failure"; failure: HltbLookupFailure; message?: string };

export interface GameHltbCardProps {
  gameId: number;
  title: string;
  releaseDate: string | null;
  // The saved row from the game profile; undefined when it couldn't be read.
  hltb: Hltb | null | undefined;
  // Members role or staff: the API's gate on the lookup.
  canLookUp: boolean;
}

export function GameHltbCard({
  gameId,
  title,
  releaseDate,
  hltb,
  canLookUp,
}: GameHltbCardProps) {
  const [state, setState] = useState<CardState>(() =>
    hltb
      ? { kind: "times", hltb, saved: true, fresh: false }
      : hltb === null
        ? { kind: "empty" }
        : { kind: "unloaded" },
  );
  const [pending, startTransition] = useTransition();

  function lookUp() {
    startTransition(async () => {
      const result = await lookupHltbAction(gameId);
      setState(
        result.ok
          ? {
              kind: "times",
              hltb: result.data,
              saved: result.meta.saved,
              fresh: result.meta.source === "hltb",
            }
          : { kind: "failure", failure: result.failure, message: result.message },
      );
    });
  }

  const notSaved = state.kind === "times" && !state.saved && !pending;

  return (
    <section
      aria-labelledby="game-hltb"
      className="rounded-sm bg-ink-2 px-4.5 pt-4 pb-3.5"
    >
      <div className="mb-3 flex items-baseline justify-between gap-3 border-b-2 border-rule-strong pb-2">
        <h2 id="game-hltb" className="font-headline text-[1.4rem] leading-none">
          Time to beat
        </h2>
        {notSaved ? (
          <Chip className="bg-transparent text-paper-dim ring-1 ring-rule-strong ring-inset">
            Not saved
          </Chip>
        ) : (
          <span className="font-label text-[0.82rem] font-extrabold tracking-[0.08em] text-paper-mute">
            Hours
          </span>
        )}
      </div>

      <div aria-live="polite" aria-busy={pending}>
        {pending ? (
          <LookingUp />
        ) : state.kind === "times" ? (
          <Times
            hltb={state.hltb}
            saved={state.saved}
            fresh={state.fresh}
            releaseDate={releaseDate}
          />
        ) : state.kind === "failure" ? (
          <Failure
            failure={state.failure}
            message={state.message}
            title={title}
            onRetry={canLookUp ? lookUp : undefined}
          />
        ) : (
          <Empty
            unloaded={state.kind === "unloaded"}
            canLookUp={canLookUp}
            onLookUp={lookUp}
          />
        )}
      </div>
    </section>
  );
}

const labelClass =
  "font-label text-[0.8rem] font-bold tracking-[0.06em] text-paper-mute uppercase";

function Bar({
  label,
  figure,
  unit,
  percent,
  placeholder,
}: {
  label: string;
  figure: string;
  unit: string;
  percent: number;
  placeholder?: boolean;
}) {
  return (
    <li className="grid h-7.5 grid-cols-[6.875rem_1fr_2.875rem] items-center gap-2.5">
      <span className="font-label text-[0.85rem] font-bold tracking-[0.06em] text-paper-dim uppercase">
        {label}
      </span>
      <span aria-hidden className="relative h-2.5 rounded-[1px] bg-ink-3">
        <i
          className={cn(
            "absolute inset-y-0 left-0 rounded-[1px]",
            placeholder ? "bg-rule-strong" : "bg-paper",
          )}
          style={{ width: `${percent}%` }}
        />
      </span>
      <span className="text-right font-headline text-[1.35rem] leading-none">
        {figure}
        {unit && <small className="text-[0.8rem] text-paper-dim">{unit}</small>}
      </span>
    </li>
  );
}

function Foot({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mt-2.5 flex justify-between gap-3 border-t border-rule pt-2.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        labelClass,
        "inline-flex items-center gap-1 text-paper-dim underline-offset-4 hover:text-paper hover:underline",
      )}
    >
      {children}
      <ArrowUpRight aria-hidden className="size-3.25" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

function Times({
  hltb,
  saved,
  fresh,
  releaseDate,
}: {
  hltb: Hltb;
  saved: boolean;
  fresh: boolean;
  releaseDate: string | null;
}) {
  const bars = hltbBars(hltb);
  const lookedUp = fresh ? "Looked up just now" : hltbLookedUpLabel(hltb);
  return (
    <>
      {bars.length > 0 ? (
        <ul>
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              label={bar.label}
              figure={bar.figure}
              unit={bar.unit}
              percent={bar.percent}
            />
          ))}
        </ul>
      ) : (
        <p className="text-[0.9rem] text-paper-dim">
          HowLongToBeat lists no times for this game yet.
        </p>
      )}
      {saved ? (
        <Foot>
          {hltb.url ? (
            <SourceLink href={hltb.url}>HowLongToBeat</SourceLink>
          ) : (
            <span className={labelClass}>HowLongToBeat</span>
          )}
          {lookedUp && <span className={labelClass}>{lookedUp}</span>}
        </Foot>
      ) : (
        <Foot className="block">
          <p className="text-[0.82rem] leading-snug text-paper-dim">
            {hltbNotSavedNote(releaseDate)}
          </p>
        </Foot>
      )}
    </>
  );
}

// The card while the lookup runs: placeholder bars in the rule colour.
function LookingUp() {
  return (
    <>
      <ul>
        <Bar label="Main Story" figure="" unit="" percent={32} placeholder />
        <Bar label="Main + Sides" figure="" unit="" percent={48} placeholder />
        <Bar label="Completionist" figure="" unit="" percent={72} placeholder />
      </ul>
      <Foot>
        <span className={cn(labelClass, "inline-flex items-center gap-1.5")}>
          <LoaderCircle aria-hidden className="size-3.25 motion-safe:animate-spin" />
          Looking up on HowLongToBeat…
        </span>
      </Foot>
    </>
  );
}

const emptyBoxClass =
  "flex flex-col items-start gap-3 rounded-sm border border-dashed border-rule-strong px-4 py-4.5";

function Empty({
  unloaded,
  canLookUp,
  onLookUp,
}: {
  unloaded: boolean;
  canLookUp: boolean;
  onLookUp: () => void;
}) {
  return (
    <div className={emptyBoxClass}>
      <p className="text-[0.9rem] text-paper-dim">
        {unloaded
          ? "Saved times couldn't be loaded right now."
          : "No HowLongToBeat times saved yet."}{" "}
        {canLookUp
          ? "Any member can look them up."
          : "Members with the Members role can look them up."}
      </p>
      {canLookUp && (
        <Button variant="highlight" onClick={onLookUp}>
          <Timer data-icon="inline-start" aria-hidden />
          Look up on HLTB
        </Button>
      )}
    </div>
  );
}

function Failure({
  failure,
  message,
  title,
  onRetry,
}: {
  failure: HltbLookupFailure;
  message?: string;
  title: string;
  onRetry?: () => void;
}) {
  const copy = HLTB_FAILURE_COPY[failure];
  const Icon = failure === "no_match" ? SearchX : CloudOff;
  const retry = onRetry && (failure === "failed" || failure === "other");
  return (
    <div className={emptyBoxClass}>
      <div className="flex items-start gap-2.5 text-[0.92rem] text-paper-dim">
        <Icon aria-hidden className="mt-0.5 size-4.5 shrink-0 text-paper-mute" />
        <span>
          <b className="font-semibold text-paper">{copy.title}</b>{" "}
          {message ?? copy.body}
        </span>
      </div>
      {failure === "no_match" && (
        <SourceLink href={hltbSearchUrl(title)}>Search HowLongToBeat</SourceLink>
      )}
      {retry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw data-icon="inline-start" aria-hidden />
          Try again
        </Button>
      )}
    </div>
  );
}
