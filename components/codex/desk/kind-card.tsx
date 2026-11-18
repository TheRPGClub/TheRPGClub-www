"use client";

import type { HistoryDesk } from "@/hooks/use-history-desk";
import { HISTORY_KINDS, KIND_NAME, kindInk, type HistoryKind } from "@/lib/codex/history";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DrawerCard } from "./drawer-card";

// The History Event desk's Kind card (5D): five tiles, each outlined in its
// History Event Kind's ink with its name in that ink; the chosen one fills,
// lifts and tilts. A radio group.
export function KindCard({ desk, tilt }: { desk: HistoryDesk; tilt: number }) {
  return (
    <DrawerCard title="Kind" note="History Event" tilt={tilt}>
      <RadioGroup
        aria-label="History Event Kind"
        value={desk.kind}
        onValueChange={(value) => desk.setKind(value as HistoryKind)}
        className="grid-cols-5 gap-1 pt-1"
      >
        {HISTORY_KINDS.map((kind) => (
          <Label
            key={kind}
            variant="kind-tile"
            style={{ "--ink": kindInk(kind) } as React.CSSProperties}
            className="relative flex h-16 min-w-0 items-end px-1 pb-1.5"
          >
            <RadioGroupItem value={kind} className="sr-only" />
            <span className="min-w-0">{KIND_NAME[kind]}</span>
          </Label>
        ))}
      </RadioGroup>
    </DrawerCard>
  );
}
