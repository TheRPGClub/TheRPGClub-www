"use client";

import { formatUnlockDate, isSpoiler } from "@/lib/achievements";
import { timelineModel, type SlottedAchievement } from "@/lib/achievements/set-page";
import type { SpreadViewProps } from "./shared";
import { HorizontalAxis } from "./timeline-axis";
import { VerticalRun } from "./timeline-run";
import { Tray } from "./timeline-tray";

// TIMELINE: the shown member's Unlocks along a month-ticked axis, one
// cluster per UTC day, with the gaps between them counted. Horizontal from
// `md`, a vertical run on phones. Below it, the "Still to unlock" tray
// (locked and hidden ones) and, apart, Unlocks the Provider gave no date.

const DAY_MS = 24 * 60 * 60 * 1000;

export function TimelineView(props: SpreadViewProps) {
  const { items, inlineId, inlineDetail } = props;
  const model = timelineModel(items);
  const pickedOnAxis = model.clusters
    .flatMap((c) => c.items)
    .find((i) => i.view.id === inlineId);

  const runDays =
    model.firstAt && model.lastAt
      ? Math.round(
          (Date.parse(`${model.lastAt.slice(0, 10)}T00:00:00Z`) -
            Date.parse(`${model.firstAt.slice(0, 10)}T00:00:00Z`)) /
            DAY_MS,
        ) + 1
      : 0;

  return (
    <div className="flex flex-col gap-8">
      {model.clusters.length === 0 ? (
        <p className="rounded-md border border-dashed border-border-strong px-5 py-6 text-[0.95rem] text-faint-foreground">
          {props.memberName} has no dated Unlocks in this set yet.
        </p>
      ) : (
        <section aria-label="Unlocks over time" className="flex flex-col gap-4">
          <p className="font-label flex flex-wrap gap-x-5 gap-y-1 text-[0.85rem] text-faint-foreground">
            <span>
              First <span className="text-foreground">{formatUnlockDate(model.firstAt as string)}</span>
            </span>
            <span>
              Latest <span className="text-foreground">{formatUnlockDate(model.lastAt as string)}</span>
            </span>
            <span>
              Run <span className="text-foreground">{runDays}</span> {runDays === 1 ? "day" : "days"}
            </span>
            <span>
              Unlocks on <span className="text-foreground">{model.clusters.length}</span>{" "}
              {model.clusters.length === 1 ? "day" : "days"}
            </span>
          </p>
          <HorizontalAxis {...props} model={model} />
          <VerticalRun {...props} clusters={model.clusters} />
          {pickedOnAxis && <div className="hidden md:block">{inlineDetail(pickedOnAxis)}</div>}
        </section>
      )}

      {model.undated.length > 0 && (
        <Tray
          {...props}
          title="Date unknown"
          note={`${model.undated.length} Unlocked, no date from the Provider`}
          group={model.undated}
        />
      )}

      {model.pending.length > 0 && (
        <Tray
          {...props}
          title="Still to unlock"
          note={trayNote(model.pending)}
          group={model.pending}
        />
      )}
    </div>
  );
}

function trayNote(pending: SlottedAchievement[]): string {
  const sealed = pending.filter((i) => isSpoiler(i.view)).length;
  const locked = pending.length - sealed;
  return [locked > 0 && `${locked} locked`, sealed > 0 && `${sealed} hidden`]
    .filter(Boolean)
    .join(" · ");
}
