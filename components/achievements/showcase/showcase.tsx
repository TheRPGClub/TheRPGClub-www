"use client";

import { useState } from "react";
import type { AchievementProvider, GameAchievementSet } from "@/lib/api/types";
import type { SetMember } from "@/lib/achievements/game-page";
import {
  showcaseItems,
  type ShowcaseFilter,
  type ShowcaseLens,
  type ShowcaseOrder,
} from "@/lib/achievements/showcase";
import { SectionHeading } from "@/components/templates/page-header";
import { Choice, ProviderChoice } from "./showcase-controls";
import { ShowcaseGrid } from "./showcase-grid";
import { ShowcaseProgress } from "./showcase-progress";

export interface ShowcaseSet {
  set: GameAchievementSet;
  // Its name beside its siblings on one service (PS4, PS5).
  label: string;
  members: SetMember[];
}

const LENSES: { value: ShowcaseLens; label: string }[] = [
  { value: "club", label: "Club" },
  { value: "me", label: "Me" },
];
const FILTERS: { value: ShowcaseFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unlocked", label: "Unlocked" },
  { value: "missing", label: "Missing" },
];
const ORDERS: { value: ShowcaseOrder; label: string }[] = [
  { value: "set", label: "Set" },
  { value: "rarity", label: "Rarity" },
];

// The game page's Achievements: the last section, one service at a time.
// Everything switches in place; the service and set are mirrored into
// `?ach=` and `?ach_set=` so the view can be shared.
export function Showcase({
  tabs,
  initialProvider,
  initialSetId,
}: {
  tabs: { provider: AchievementProvider; sets: ShowcaseSet[] }[];
  initialProvider: AchievementProvider;
  initialSetId: number;
}) {
  const [provider, setProvider] = useState(initialProvider);
  const [setIds, setSetIds] = useState<Partial<Record<AchievementProvider, number>>>({ [initialProvider]: initialSetId });
  const tab = tabs.find((t) => t.provider === provider) ?? tabs[0];
  const current = tab.sets.find((s) => s.set.id === setIds[tab.provider]) ?? tab.sets[0];
  // Me is offered once the viewer holds anything in the set.
  const canMe = current.set.achievements.some((a) => a.viewer_unlocked);
  const [lensPick, setLens] = useState<ShowcaseLens>("me");
  const lens: ShowcaseLens = canMe ? lensPick : "club";
  const [filter, setFilter] = useState<ShowcaseFilter>("all");
  const [order, setOrder] = useState<ShowcaseOrder>("set");
  const [expanded, setExpanded] = useState(false);
  const items = showcaseItems(current.set, lens, filter, order);

  function show(next: AchievementProvider, setId: number) {
    setProvider(next);
    setSetIds((ids) => ({ ...ids, [next]: setId }));
    setExpanded(false);
    const url = new URL(window.location.href);
    url.searchParams.set("ach", next);
    const first = tabs.find((t) => t.provider === next)?.sets[0]?.set.id;
    if (setId !== first) url.searchParams.set("ach_set", String(setId));
    else url.searchParams.delete("ach_set");
    window.history.replaceState(window.history.state, "", url);
  }

  return (
    <section aria-labelledby="game-achievements" className="mt-10 space-y-5">
      <SectionHeading
        title={<span id="game-achievements">Achievements</span>}
        count={tabs.length > 1 ? undefined : current.set.achievements.length}
        action={
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {tabs.length > 1 && (
              <ProviderChoice
                value={tab.provider}
                providers={tabs.map((t) => t.provider)}
                counts={Object.fromEntries(tabs.map((t) => [t.provider, t.sets[0].set.achievements.length]))}
                onChange={(next) => show(next, setIds[next] ?? tabs.find((t) => t.provider === next)!.sets[0].set.id)}
              />
            )}
            {tab.sets.length > 1 && (
              <Choice
                label="Set"
                value={String(current.set.id)}
                options={tab.sets.map((s) => ({ value: String(s.set.id), label: s.label }))}
                onChange={(id) => show(tab.provider, Number(id))}
              />
            )}
            {canMe && <Choice label="Whose progress" value={lens} options={LENSES} onChange={setLens} />}
          </div>
        }
      />
      <ShowcaseProgress set={current.set} lens={lens} members={current.members} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Choice label="Show" value={filter} options={FILTERS} onChange={setFilter} />
        <Choice label="Order" value={order} options={ORDERS} onChange={setOrder} />
      </div>
      <ShowcaseGrid
        items={items}
        provider={tab.provider}
        lens={lens}
        members={current.members}
        expanded={expanded}
        onExpand={() => setExpanded(true)}
      />
    </section>
  );
}
