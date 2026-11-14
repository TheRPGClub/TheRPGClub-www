"use client";

import { assignLanes, timelineModel } from "@/lib/achievements/set-page";
import { useElementWidth } from "@/hooks/use-element-width";
import { cn } from "@/lib/utils";
import type { SpreadViewProps } from "./shared";
import { TimelineCluster } from "./timeline-cluster";

// The timeline's horizontal axis (md and up): month ticks along a rule in
// the game tint, one cluster per UTC day on a stem, stacked into lanes so
// none overlap, and the longer gaps between them counted.

const PAD = 18;
const CLUSTER_W = 152;
const STEM = 22;
const AXIS_BLOCK = 46;

function clusterHeight(n: number): number {
  // The date line, then one md tile over a two-line name, or rows of three
  // 44px sm tile buttons with 6px gaps.
  return n === 1 ? 24 + 60 + 44 : 24 + Math.ceil(n / 3) * 50;
}

export function HorizontalAxis({
  model,
  tint,
  selectedId,
  onSelect,
}: SpreadViewProps & { model: ReturnType<typeof timelineModel> }) {
  const [ref, width] = useElementWidth<HTMLDivElement>(720);
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
            className="absolute w-px bg-border-strong"
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
          <span className={cn("w-px bg-faint-foreground", t.major ? "h-2" : "h-1 opacity-60")} />
          <span
            className={cn(
              "font-label whitespace-nowrap",
              t.major ? "text-[0.8rem] text-dim-foreground" : "text-[0.7rem] text-faint-foreground/70",
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
            className="font-label absolute -translate-x-1/2 bg-card px-1.5 text-[0.72rem] whitespace-nowrap text-faint-foreground"
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
          className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-background"
          style={{ left: centers[i], top: axisY + 0.5, borderColor: "var(--color-foreground)" }}
        />
      ))}

      {/* clusters */}
      {model.clusters.map((c, i) => {
        const h = clusterHeight(c.items.length);
        return (
          <TimelineCluster
            key={c.day}
            cluster={c}
            tint={tint.tint}
            selectedId={selectedId}
            onSelect={onSelect}
            style={{ left: placed[i].left, top: laneBottom(placed[i].lane) - h, width: CLUSTER_W, height: h }}
          />
        );
      })}
    </div>
  );
}
