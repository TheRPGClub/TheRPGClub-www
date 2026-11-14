"use client";

import { useState } from "react";
import { splitFeatureFlags, type FeatureFlagEntry } from "@/lib/feature-flags";
import { FlagDepartment } from "./flag-department";

// The desk's two departments, Core Features and Hideable Features, as one
// table split in two: the same columns, so a Feature's coverage, last change
// and state line up down the page. Each row's Off / Preview / Live control
// saves on click; Off asks first. Below 85rem (1360px) a row stacks into a block.
export function FeatureFlagDesk({ entries, now }: { entries: FeatureFlagEntry[]; now: string }) {
  const [rows, setRows] = useState(entries);
  const [clock, setClock] = useState(() => new Date(now));
  const [landed, setLanded] = useState<string | null>(null);
  const { core, hideable } = splitFeatureFlags(rows);

  const onSaved = (entry: FeatureFlagEntry, changed: boolean) => {
    setRows((current) => current.map((row) => (row.key === entry.key ? entry : row)));
    setClock(new Date());
    if (changed) setLanded(entry.key);
  };

  if (rows.length === 0) {
    return (
      <p className="mt-6.5 rounded-md border border-dashed border-border-strong px-4 py-8 text-center text-sm text-dim-foreground">
        The club&apos;s server lists no Features.
      </p>
    );
  }

  return (
    <div className="mt-6.5 space-y-10">
      <FlagDepartment
        title="Core features"
        entries={core}
        clock={clock}
        landed={landed}
        onSaved={onSaved}
        groupHead
      />
      <FlagDepartment title="Hideable features" entries={hideable} clock={clock} landed={landed} onSaved={onSaved} />
    </div>
  );
}
