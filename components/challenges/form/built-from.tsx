"use client";

import { X } from "lucide-react";
import type { ChallengeFormState } from "@/hooks/use-challenge-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// What the Pool is built from, as chips ("Final Fantasy · Franchise · 44 ×"),
// with the tally of what the wall holds: from the sources, added by hand,
// left out.
export function BuiltFrom({ form, tally }: { form: ChallengeFormState; tally: string }) {
  const { draft, locked } = form;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {draft.sources.length > 0 && (
        <span className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">Built from</span>
      )}
      {draft.sources.map((source) => (
        <Badge
          key={`${source.kind}-${source.id}`}
          tone="picked"
          className="h-[30px] gap-2 pr-1 pl-2.5"
        >
          <span>{source.name}</span>
          <span className="text-faint-foreground">
            {source.kind === "franchise" ? "Franchise" : "Series"}
            {source.game_count != null && ` · ${source.game_count}`}
          </span>
          {!locked && (
            <Button
              type="button"
              variant="chip-remove"
              size="icon-xs"
              aria-label={`Take ${source.name} out of the Pool`}
              onClick={() => form.removeSource(source)}
            >
              <X aria-hidden />
            </Button>
          )}
        </Badge>
      ))}
      {tally && <span className="ml-auto text-[0.9rem] text-faint-foreground">{tally}</span>}
    </div>
  );
}
