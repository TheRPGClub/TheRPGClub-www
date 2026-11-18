"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import type { CodexEntryLink } from "@/lib/codex/types";
import { cn } from "@/lib/utils";
import { PartLabel } from "./part-label";

// The See also search's results (5D): a `muted` panel dropping under the
// field, each row the part in its ink over the title; the lit row has the
// yellow inset on `card`. An entry already linked is quiet with a check.
// It scrolls itself into view as it fills, clear of the phone's sticky
// Cancel and Save bar (its bottom scroll margin).
export function SeeAlsoResults({
  id,
  results,
  lit,
  status,
  onPick,
}: {
  id: string;
  results: readonly (CodexEntryLink & { linked: boolean })[];
  lit: number;
  // Shown instead of the rows: "Searching…", "Nothing matches.", an error.
  status: string | null;
  onPick: (link: CodexEntryLink) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "nearest" });
  }, [results.length, status]);
  return (
    <div
      ref={ref}
      className="absolute inset-x-0 top-full z-20 mt-1 scroll-mb-24 rounded-md border border-border-strong bg-muted p-1.5 shadow-[0_12px_30px_rgb(0_0_0/0.5)]"
    >
      {status && <p className="px-2 py-2 text-sm text-faint-foreground">{status}</p>}
      <div role="listbox" id={id} aria-label="Club Codex entries">
        {results.map((result, i) => (
          <div
            key={result.id}
            id={`${id}-${i}`}
            role="option"
            aria-selected={i === lit}
            aria-disabled={result.linked || undefined}
            tabIndex={-1}
            onMouseDown={(event) => {
              event.preventDefault();
              if (!result.linked) onPick(result);
            }}
            className={cn(
              "grid cursor-pointer grid-cols-[minmax(0,1fr)_16px] items-center gap-x-2 gap-y-1 rounded-[2.4px] px-2 py-2 text-[0.9rem] hover:bg-card",
              i === lit && "bg-card shadow-[inset_0_0_0_1px_var(--color-highlight)]",
              result.linked && "cursor-default text-faint-foreground",
            )}
          >
            <PartLabel part={result.part} />
            {result.linked ? <Check aria-label="Linked" className="row-span-2 size-3.5" /> : <span className="row-span-2" />}
            <span className="truncate">{result.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
