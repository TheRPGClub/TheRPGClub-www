"use client";

import { useState } from "react";
import { formatPlaytime } from "@/lib/franchises/progress";
import { toRoman } from "@/lib/franchises/page";
import type { FranchiseProgress, FranchiseProgressMeter } from "@/lib/franchises/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProgressCover } from "@/components/franchises/progress/progress-cover";

// The cover wall (pick 1E1): the Mainline run big, numbered as on the Games
// tab, then the spin-offs smaller, each headed by its count and Playtime.
// Add-ons never appear. Phones show three across, the first nine Mainline
// games and six spin-offs, then Show all.
const PHONE = { mainline: 9, spinOffs: 6 };

export function ProgressWall({ progress }: { progress: FranchiseProgress }) {
  const [all, setAll] = useState(false);
  const { games, meters } = progress;
  const hidden = Math.max(games.mainline.length - PHONE.mainline, 0) + Math.max(games.spin_offs.length - PHONE.spinOffs, 0);
  const cut = (i: number, limit: number) => !all && i >= limit && "max-sm:hidden";

  return (
    <div className="mt-6">
      {games.mainline.length > 0 && (
        <section aria-label="Mainline">
          <WallHead title="Mainline" meter={meters.mainline} top />
          <ul className="grid grid-cols-3 gap-x-2.5 gap-y-3.5 sm:grid-cols-5 sm:gap-x-3.5 sm:gap-y-5 lg:grid-cols-8">
            {games.mainline.map((g, i) => (
              <ProgressCover key={g.game_id} game={g} numeral={toRoman(i + 1)} big className={cn(cut(i, PHONE.mainline))} />
            ))}
          </ul>
        </section>
      )}
      {games.spin_offs.length > 0 && (
        <section aria-label="Spin-offs">
          <WallHead title="Spin-offs" meter={meters.spin_offs} top={games.mainline.length === 0} />
          <ul className="grid grid-cols-3 gap-x-2.5 gap-y-4 sm:grid-cols-6 lg:grid-cols-10">
            {games.spin_offs.map((g, i) => (
              <ProgressCover key={g.game_id} game={g} numeral={null} big={false} className={cn(cut(i, PHONE.spinOffs))} />
            ))}
          </ul>
        </section>
      )}
      {hidden > 0 && (
        <Button variant="rail-link" size="bare" className="mt-3.5 sm:hidden" aria-expanded={all} onClick={() => setAll(!all)}>
          {all ? "Show fewer" : `Show all ${games.mainline.length + games.spin_offs.length} games`}
        </Button>
      )}
    </div>
  );
}

function WallHead({ title, meter, top = false }: { title: string; meter: FranchiseProgressMeter; top?: boolean }) {
  return (
    <div className={cn("mb-3.5 flex items-baseline gap-2.5 border-b-2 border-foreground pb-1.5", top ? "mt-1" : "mt-[22px]")}>
      <h3 className="font-headline text-[1.6rem] leading-none">{title}</h3>
      <span className="font-label text-[0.78rem] leading-none font-bold tracking-[0.08em] text-faint-foreground">
        {meter.done} of {meter.total}
      </span>
      <b className="font-headline ml-auto text-[1.4rem] leading-none font-normal">{formatPlaytime(meter.playtime_minutes)}</b>
    </div>
  );
}
