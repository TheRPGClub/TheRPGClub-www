"use client";

import { useState, useTransition } from "react";
import { lookupHltbAction } from "@/app/actions/hltb";
import type { Hltb, HltbLookupFailure } from "@/lib/hltb";
import { Badge } from "@/components/ui/badge";
import { PanelHeading } from "@/components/issue/game-rail";
import { Empty, Failure } from "@/components/issue/game-hltb-card-empty";
import { HltbReload, LookingUp, Times } from "@/components/issue/game-hltb-card-times";

// The game page hero panel's "Time to beat": HowLongToBeat's hours, one bar
// per play style on a shared scale. Members look the times up with the
// reload icon at the heading's end; opening the page never looks anything up.

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
    <section aria-labelledby="game-hltb">
      <PanelHeading
        id="game-hltb"
        title="Time to beat"
        action={
          <span className="flex items-center gap-1.5">
            {notSaved && (
              <Badge tone="status" className="border-0">
                Not saved
              </Badge>
            )}
            {canLookUp && <HltbReload pending={pending} onClick={lookUp} />}
          </span>
        }
      />

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
          <Empty unloaded={state.kind === "unloaded"} canLookUp={canLookUp} />
        )}
      </div>
    </section>
  );
}
