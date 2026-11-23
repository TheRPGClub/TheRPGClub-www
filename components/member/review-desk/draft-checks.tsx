"use client";

import { ArrowUpRight, Check, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DraftChecklist } from "@/lib/reviews/draft";
import { cn } from "@/lib/utils";

// The strip's checklist: Title · Story · Overall score. Only the score stands
// between a Draft and Publish, so a missing score is the one yellow item, and
// pressing it goes to the Overall ruler. A missing title or story is noted,
// quietly: neither is needed. On a phone only the missing score shows, as
// Publish's reason.
export function DraftChecks({
  checks,
  onScore,
  reasonId,
}: {
  checks: DraftChecklist;
  onScore: () => void;
  // The missing score's id, so a disabled Publish can name it as its reason.
  reasonId: string;
}) {
  return (
    <span className="font-label flex items-center gap-3.5 text-[0.76rem] font-extrabold tracking-[0.07em] uppercase">
      <Item done={checks.title}>Title</Item>
      <Item done={checks.story}>Story</Item>
      {checks.score ? (
        <Item done>Overall score</Item>
      ) : (
        <Button
          id={reasonId}
          type="button"
          variant="pencil"
          size="inline"
          onClick={onScore}
          className="flex items-center gap-1.5 whitespace-nowrap"
        >
          <ArrowUpRight aria-hidden className="size-3.5" />
          Needs an overall score
        </Button>
      )}
    </span>
  );
}

function Item({ done, children }: { done: boolean; children: React.ReactNode }) {
  const Icon = done ? Check : Minus;
  return (
    <span
      className={cn(
        "hidden items-center gap-1.25 whitespace-nowrap sm:flex",
        done ? "text-dim-foreground" : "text-faint-foreground",
      )}
    >
      <Icon aria-hidden className="size-3.5" />
      {children}
      <span className="sr-only">{done ? " done" : " not yet"}</span>
    </span>
  );
}
