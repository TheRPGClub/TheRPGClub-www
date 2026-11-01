"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  displayRarity,
  formatUnlockDate,
  isSpoiler,
} from "@/lib/achievements";
import {
  assignLanes,
  formatSlot,
  timelineModel,
  type SlottedAchievement,
  type TimelineCluster,
} from "@/lib/achievements/set-page";
import { AchievementIcon } from "@/components/achievements/achievement-icon";
import { RarityChip } from "@/components/achievements/rarity-chip";
import { AchievementName, itemClass, type SpreadViewProps } from "./shared";
import { cn } from "@/lib/utils";

// TIMELINE: the shown member's Unlocks along a month-ticked axis, one
// cluster per UTC day, with the gaps between them counted. Horizontal from
// `md`, a vertical run on phones. Below it, the "Still to unlock" tray
// (locked and hidden ones) and, apart, Unlocks the Provider gave no date.

const DAY = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const MONTH_YEAR = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const DAY_MS = 24 * 60 * 60 * 1000;

const dayLabel = (day: string) => DAY.format(new Date(`${day}T00:00:00Z`));

export function TimelineView(props: SpreadViewProps) {
  const { items, selectedId, inlineDetail } = props;
  const model = timelineModel(items);
  const pickedOnAxis = model.clusters
    .flatMap((c) => c.items)
    .find((i) => i.view.id === selectedId);

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
        <p className="rounded-md border border-dashed border-rule-strong px-5 py-6 text-[0.95rem] text-paper-mute">
          {props.memberName} has no dated Unlocks in this set yet.
        </p>
      ) : (
        <section aria-label="Unlocks over time" className="flex flex-col gap-4">
          <p className="font-label flex flex-wrap gap-x-5 gap-y-1 text-[0.85rem] text-paper-mute">
            <span>
              First <span className="text-paper">{formatUnlockDate(model.firstAt as string)}</span>
            </span>
            <span>
              Latest <span className="text-paper">{formatUnlockDate(model.lastAt as string)}</span>
            </span>
            <span>
              Run <span className="text-paper">{runDays}</span> {runDays === 1 ? "day" : "days"}
            </span>
            <span>
              Unlocks on <span className="text-paper">{model.clusters.length}</span>{" "}
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

// ---------------------------------------------------------------------------
// Horizontal axis (md and up)

const PAD = 18;
const CLUSTER_W = 152;
const STEM = 22;
const AXIS_BLOCK = 46;

function clusterHeight(n: number): number {
  // The date line, then one md tile over a two-line name, or rows of three
  // 44px sm tile buttons with 6px gaps.
  return n === 1 ? 24 + 60 + 44 : 24 + Math.ceil(n / 3) * 50;
}

function useWidth<T extends HTMLElement>(initial: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function HorizontalAxis({
  model,
  tint,
  selectedId,
  onSelect,
}: SpreadViewProps & { model: ReturnType<typeof timelineModel> }) {
  const [ref, width] = useWidth<HTMLDivElement>(720);
  const track = Math.max(width - PAD * 2, 1);
  const centers = model.clusters.map((c) => PAD + c.at * track);
  const placed = assignLanes(
    centers,
    model.clusters.map(() => CLUSTER_W),
    width,
    10,
  );
  const lanes = Math.max(...placed.map((p) => p.lane), 0) + 1;
  const laneH = Array.from({ length: lanes }, (_, lane) =>
    Math.max(
      ...model.clusters.map((c, i) => (placed[i].lane === lane ? clusterHeight(c.items.length) : 0)),
    ) + 14,
  );
  const lanesTotal = laneH.reduce((a, b) => a + b, 0);
  const axisY = lanesTotal + STEM;
  const laneBottom = (lane: number) => axisY - STEM - laneH.slice(0, lane).reduce((a, b) => a + b, 0);

  return (
    <div
      ref={ref}
      className="relative hidden w-full md:block"
      style={{ height: axisY + AXIS_BLOCK }}
    >
      {/* stems */}
      {model.clusters.map((c, i) => {
        const bottom = laneBottom(placed[i].lane);
        return (
          <span
            key={`stem-${c.day}`}
            aria-hidden
            className="absolute w-px bg-rule-strong"
            style={{ left: centers[i], top: bottom - 4, height: axisY - bottom + 4 }}
          />
        );
      })}

      {/* axis */}
      <span
        aria-hidden
        className="absolute h-[3px] rounded-[1px]"
        style={{ left: 0, right: 0, top: axisY - 1, background: tint.tint }}
      />
      {model.ticks.map((t) => (
        <span
          key={`${t.label}-${t.at}`}
          aria-hidden
          className="absolute flex -translate-x-1/2 flex-col items-center gap-1"
          style={{ left: PAD + t.at * track, top: axisY + 3 }}
        >
          <span className={cn("w-px bg-paper-mute", t.major ? "h-2" : "h-1 opacity-60")} />
          <span
            className={cn(
              "font-label whitespace-nowrap",
              t.major ? "text-[0.8rem] text-paper-dim" : "text-[0.7rem] text-paper-mute/70",
            )}
          >
            {t.label}
          </span>
        </span>
      ))}
      {model.clusters.map((c, i) => {
        const gap = c.gapDays;
        if (gap == null || gap < 7 || i === 0) return null;
        const mid = (centers[i - 1] + centers[i]) / 2;
        if (centers[i] - centers[i - 1] < 70) return null;
        return (
          <span
            key={`gap-${c.day}`}
            className="font-label absolute -translate-x-1/2 bg-ink-2 px-1.5 text-[0.72rem] whitespace-nowrap text-paper-mute"
            style={{ left: mid, top: axisY - 20 }}
          >
            +{gap} days
          </span>
        );
      })}
      {model.clusters.map((c, i) => (
        <span
          key={`dot-${c.day}`}
          aria-hidden
          className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-ink"
          style={{ left: centers[i], top: axisY + 0.5, borderColor: "var(--color-paper)" }}
        />
      ))}

      {/* clusters */}
      {model.clusters.map((c, i) => {
        const h = clusterHeight(c.items.length);
        return (
          <div
            key={c.day}
            className="absolute z-10 flex flex-col gap-1 rounded-md bg-ink-2"
            style={{ left: placed[i].left, top: laneBottom(placed[i].lane) - h, width: CLUSTER_W, height: h }}
          >
            <span className="font-label px-1 text-[0.78rem] text-paper-mute">
              {dayLabel(c.day)}
              {c.items.length > 1 && <span className="text-paper-dim"> · {c.items.length}</span>}
            </span>
            {c.items.length === 1 ? (
              <ClusterSingle item={c.items[0]} tint={tint.tint} selectedId={selectedId} onSelect={onSelect} />
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {c.items.map((item) => (
                  <li key={item.view.id}>
                    <button
                      type="button"
                      aria-pressed={selectedId === item.view.id}
                      onClick={() => onSelect(item.view.id)}
                      className={itemClass(selectedId === item.view.id, "block rounded-md p-0.5")}
                    >
                      <AchievementIcon view={item.view} size="sm" slot={item.slot} tint={tint.tint} />
                      <span className="sr-only">
                        No. {formatSlot(item.slot)} {item.view.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ClusterSingle({
  item,
  tint,
  selectedId,
  onSelect,
}: {
  item: SlottedAchievement;
  tint: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const selected = selectedId === item.view.id;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(item.view.id)}
      className={itemClass(selected, "flex flex-col gap-1 rounded-md p-0.5")}
    >
      <AchievementIcon view={item.view} size="md" slot={item.slot} tint={tint} />
      <span className="flex min-w-0 items-baseline gap-1 text-[0.85rem] leading-tight">
        <span className="font-headline" style={{ color: tint }}>
          {formatSlot(item.slot)}
        </span>
        <AchievementName view={item.view} className="line-clamp-2 font-semibold text-paper" />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Vertical run (phones)

function VerticalRun({
  clusters,
  tint,
  selectedId,
  onSelect,
  inlineDetail,
}: SpreadViewProps & { clusters: TimelineCluster[] }) {
  const monthOf = (day: string) => MONTH_YEAR.format(new Date(`${day}T00:00:00Z`));
  return (
    <ol className="relative flex flex-col md:hidden" aria-label="Unlocks by day">
      <span
        aria-hidden
        className="absolute top-2 bottom-2 left-[2.6rem] w-[3px] rounded-[1px]"
        style={{ background: tint.tint }}
      />
      {clusters.map((c, i) => {
        const date = new Date(`${c.day}T00:00:00Z`);
        const month = monthOf(c.day);
        const newMonth = i === 0 || month !== monthOf(clusters[i - 1].day);
        const picked = c.items.find((i) => i.view.id === selectedId);
        return (
          <Fragment key={c.day}>
            {newMonth && (
              <li className="relative pt-3 pb-2 pl-[3.6rem]">
                <span className="font-headline text-[1.4rem] leading-none text-paper">{month}</span>
              </li>
            )}
            {c.gapDays != null && c.gapDays >= 7 && (
              <li className="font-label py-1 pl-[3.6rem] text-[0.75rem] text-paper-mute">
                +{c.gapDays} days
              </li>
            )}
            <li className="relative grid grid-cols-[2.2rem_1fr] gap-x-[1.4rem] py-2">
              <span className="flex flex-col items-end pt-1">
                <span className="font-headline text-[1.6rem] leading-none text-paper">
                  {date.getUTCDate()}
                </span>
              </span>
              <span
                aria-hidden
                className="absolute top-[0.95rem] left-[2.6rem] size-3 -translate-x-[4.5px] rounded-full border-2 border-paper bg-ink"
              />
              <ul className="flex min-w-0 flex-col gap-1">
                {c.items.map((item) => {
                  const selected = selectedId === item.view.id;
                  const shown = displayRarity(item.view);
                  return (
                    <li key={item.view.id}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onSelect(item.view.id)}
                        className={itemClass(
                          selected,
                          "grid w-full grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 rounded-md p-1 hover:bg-ink-3",
                        )}
                      >
                        <AchievementIcon view={item.view} size="sm" slot={item.slot} tint={tint.tint} />
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="flex min-w-0 items-baseline gap-1.5">
                            <span className="font-headline text-[0.95rem]" style={{ color: tint.tint }}>
                              {formatSlot(item.slot)}
                            </span>
                            <AchievementName
                              view={item.view}
                              className="truncate text-[0.95rem] font-semibold text-paper"
                            />
                          </span>
                          <RarityChip rarity={item.view.rarity} figure={shown.rarity} size="sm" className="w-fit" />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
            {picked && <li className="py-2 pl-[3.6rem]">{inlineDetail(picked)}</li>}
          </Fragment>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// Trays: still to unlock, date unknown

function Tray({
  title,
  note,
  group,
  tint,
  selectedId,
  onSelect,
  inlineDetail,
}: SpreadViewProps & { title: string; note: string; group: SlottedAchievement[] }) {
  const picked = group.find((i) => i.view.id === selectedId);
  return (
    <section aria-label={title} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b-2 border-paper pb-2">
        <h3 className="font-headline text-[1.875rem] leading-[0.9] text-paper">{title}</h3>
        <span className="font-label text-[0.85rem] text-paper-mute">{note}</span>
      </div>
      <ul className="grid gap-3 sm:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))]">
        {group.map((item) => {
          const { view, slot } = item;
          const selected = selectedId === view.id;
          const sealed = isSpoiler(view) && !view.unlocked;
          const shown = displayRarity(view);
          return (
            <li key={view.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(view.id)}
                className={itemClass(
                  selected,
                  "grid w-full grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 rounded-md bg-ink-3/60 p-2.5 hover:bg-ink-3",
                )}
              >
                <AchievementIcon view={view} size="md" slot={slot} tint={tint.tint} />
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="flex min-w-0 items-baseline gap-1.5">
                    <span className="font-headline text-[1rem]" style={{ color: tint.tint }}>
                      {formatSlot(slot)}
                    </span>
                    <AchievementName
                      view={view}
                      className="truncate text-[0.95rem] font-semibold text-paper-dim"
                    />
                  </span>
                  {sealed ? (
                    <span className="font-label inline-flex h-5 w-fit items-center rounded-xs bg-paper/8 px-1.5 text-[0.72rem] text-paper-dim">
                      Hidden
                    </span>
                  ) : (
                    <RarityChip rarity={view.rarity} figure={shown.rarity} size="sm" className="w-fit" />
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {picked && inlineDetail(picked)}
    </section>
  );
}
