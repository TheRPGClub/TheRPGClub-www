"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { pinnedHref } from "@/lib/feedback";
import { feedbackLine } from "@/lib/roadmap/feedback";
import type { RoadmapFeedback } from "@/lib/roadmap/types";

// A Roadmap Item's linked Feedback under its blurb (www#233): the count,
// opening to each Feedback's title, linked to it on the Feedback Board. Its
// presses never start a Make Room drag in edit mode.
export function NodeFeedback({ feedback }: { feedback: RoadmapFeedback[] }) {
  if (feedback.length === 0) return null;
  return (
    <Collapsible data-no-drag="" className="mt-1">
      <CollapsibleTrigger
        render={<Button type="button" variant="quiet-link" size="bare" />}
        className="group/tog items-center gap-1 text-[0.74rem] uppercase"
      >
        {feedback.length} Feedback
        <ChevronDown aria-hidden className="size-3.5 group-data-panel-open/tog:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="mt-1 space-y-1 border-l border-border-strong pl-2.5">
          {feedback.map((f) => (
            <li key={f.id} className="text-[0.84rem] leading-snug">
              <Link
                href={pinnedHref({ feedback_id: f.id })}
                className="font-semibold text-dim-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                {f.title}
              </Link>
              <span className="font-label block text-[0.66rem] text-faint-foreground">{feedbackLine(f)}</span>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
