"use client";

import { useState } from "react";
import { Flag, Pencil, Play, RotateCcw } from "lucide-react";
import type { EarlierPlaythrough, PlaythroughView } from "@/lib/playtime/view";
import { Button } from "@/components/ui/button";
import { PlaytimeAmount } from "./playtime-amount";

// The Playthrough card under the sources (2D+F): the open one's clock,
// where it started and what it counts from, Log a completion, Set its total
// and Abandon, then the earlier ones. With none open, Start a Playthrough.
export function PlaythroughCard({
  open,
  earlier,
  pending,
  onLog,
  onStart,
  onSetTotal,
  onAbandon,
}: {
  open: PlaythroughView | null;
  earlier: EarlierPlaythrough[];
  pending: boolean;
  // Open the Game Completion dialog; absent when Completed isn't shown.
  onLog?: () => void;
  onStart: () => void;
  onSetTotal: (minutes: number | null, done: () => void) => void;
  onAbandon: () => void;
}) {
  const [setting, setSetting] = useState(false);
  return (
    <section aria-label="Playthrough" className="mt-3.5 rounded-[3px] bg-muted px-3.5 py-3">
      <h3 className="font-display flex items-center gap-2 text-[1.2rem] leading-none uppercase">
        Playthrough
        {open && <span className="font-label ml-auto rounded-[2px] bg-foreground px-1.5 pt-1 pb-0.75 text-[0.7rem] font-extrabold tracking-[0.08em] text-background">Open</span>}
      </h3>
      {open ? (
        <>
          <p className="font-display mt-2.5 text-[3.2rem] leading-[0.85]" aria-label={`${open.clock.h} hours ${open.clock.m} minutes`}>
            {open.clock.h}
            <small className="mx-1 ml-0.5 text-[0.42em] text-faint-foreground">h</small>
            {open.clock.m}
            <small className="ml-0.5 text-[0.42em] text-faint-foreground">m</small>
          </p>
          <p className="mt-1.5 text-[0.86rem] text-dim-foreground">
            {open.since && (
              <>
                Since <b className="font-semibold text-foreground">{open.since}</b>
                {open.fromNowPlaying ? ", when you added it to Now Playing. " : ". "}
              </>
            )}
            {open.manual ? "You set its total by hand. " : open.countedFrom && <>Counted from <b className="font-semibold text-foreground">{open.countedFrom}</b>. </>}
            Logging a completion closes it.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {onLog && (
              <Button variant="highlight" size="xs" onClick={onLog}>
                <Flag aria-hidden />
                Log a completion
              </Button>
            )}
            <Button variant="outline" size="xs" aria-expanded={setting} onClick={() => setSetting(!setting)}>
              <Pencil aria-hidden />
              Set its total
            </Button>
            {open.manual && (
              <Button variant="ghost" size="xs" disabled={pending} onClick={() => onSetTotal(null, () => setSetting(false))}>
                <RotateCcw aria-hidden />
                Measure it again
              </Button>
            )}
            <Button variant="destructive-ghost" size="xs" disabled={pending} onClick={onAbandon}>
              Abandon
            </Button>
          </div>
          {setting && (
            <PlaytimeAmount inline modes={false} current={open.minutes} pending={pending} saveLabel={() => "Save"} onCancel={() => setSetting(false)} onSave={(_, minutes) => onSetTotal(minutes, () => setSetting(false))} />
          )}
        </>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-2.5">
          <p className="text-[0.86rem] text-dim-foreground">None open. A Playthrough counts one run from zero while your Playtime keeps growing.</p>
          <Button variant="outline" size="sm" disabled={pending} onClick={onStart}>
            <Play aria-hidden />
            Start a Playthrough
          </Button>
        </div>
      )}
      {earlier.length > 0 && (
        <ul aria-label="Earlier Playthroughs" className="mt-2.5 border-t border-border-strong pt-2">
          {earlier.map((p) => (
            <li key={p.id} className="font-label flex justify-between gap-3 py-0.5 text-[0.74rem] leading-[1.3] font-bold tracking-[0.07em] text-faint-foreground uppercase">
              <span>Before · {p.label}</span>
              <b className="font-display text-[1.05rem] leading-none font-normal tracking-normal text-foreground">{p.hours}</b>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
