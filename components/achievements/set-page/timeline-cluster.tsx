"use client";

import {
  formatSlot,
  type SlottedAchievement,
  type TimelineCluster as Cluster,
} from "@/lib/achievements/set-page";
import { AchievementIcon } from "@/components/achievements/achievement-icon";
import { Button } from "@/components/ui/button";
import { AchievementName } from "./shared";

const DAY = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const dayLabel = (day: string) => DAY.format(new Date(`${day}T00:00:00Z`));

// One UTC day on the timeline's horizontal axis, placed by the axis: the
// date, then a lone Unlock as a tile over its name, or several as a row of
// small tiles.
export function TimelineCluster({
  cluster,
  tint,
  selectedId,
  onSelect,
  style,
}: {
  cluster: Cluster;
  tint: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
  style: React.CSSProperties;
}) {
  const { items } = cluster;
  return (
    <div className="absolute z-10 flex flex-col gap-1 rounded-md bg-card" style={style}>
      <span className="font-label px-1 text-[0.78rem] text-faint-foreground">
        {dayLabel(cluster.day)}
        {items.length > 1 && <span className="text-dim-foreground"> · {items.length}</span>}
      </span>
      {items.length === 1 ? (
        <ClusterSingle item={items[0]} tint={tint} selectedId={selectedId} onSelect={onSelect} />
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <li key={item.view.id}>
              <Button
                variant="pick"
                size="bare"
                aria-pressed={selectedId === item.view.id}
                onClick={() => onSelect(item.view.id)}
                className="block p-0.5"
              >
                <AchievementIcon view={item.view} size="sm" slot={item.slot} tint={tint} />
                <span className="sr-only">
                  No. {formatSlot(item.slot)} {item.view.name}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      )}
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
    <Button
      variant="pick"
      size="bare"
      aria-pressed={selected}
      onClick={() => onSelect(item.view.id)}
      className="flex flex-col gap-1 p-0.5"
    >
      <AchievementIcon view={item.view} size="md" slot={item.slot} tint={tint} />
      <span className="flex min-w-0 items-baseline gap-1 text-[0.85rem] leading-tight">
        <span className="font-headline" style={{ color: tint }}>
          {formatSlot(item.slot)}
        </span>
        <AchievementName view={item.view} className="line-clamp-2 font-semibold text-foreground" />
      </span>
    </Button>
  );
}
