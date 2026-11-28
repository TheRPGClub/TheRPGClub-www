"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { feedbackLine, linkedFeedbackHref } from "@/lib/roadmap/feedback";
import type { RoadmapFeedback } from "@/lib/roadmap/types";
import { useBoardHref } from "./board-href";

// A Roadmap Item's linked Feedback under its blurb (www#233): the count,
// opening to each Feedback's title, linked to it on the Feedback Board when
// the viewer can open it. Its presses never start a Make Room drag in edit
// mode.
export function NodeFeedback({ feedback }: { feedback: RoadmapFeedback[] }) {
  const boardHref = useBoardHref();
  if (feedback.length === 0) return null;
  return (
    <Collapsible data-no-drag="" className="mt-1">
      <CollapsibleTrigger
        render={<Button type="button" variant="quiet-link" size="bare" />}
        className="group/tog items-center gap-1 text-[0.74rem]"
      >
        {feedback.length} Feedback
        <ChevronDown aria-hidden className="size-3.5 group-data-panel-open/tog:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="mt-1 space-y-1 border-l border-border-strong pl-2.5">
          {feedback.map((f) => (
            <li key={f.id} className="text-[0.84rem] leading-snug">
              <FeedbackTitle href={linkedFeedbackHref(boardHref, f.id)} title={f.title} />
              <span className="font-label block text-[0.66rem] text-faint-foreground">{feedbackLine(f)}</span>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function FeedbackTitle({ href, title }: { href: string | null; title: string }) {
  if (!href) return <span className="font-semibold text-dim-foreground">{title}</span>;
  return (
    <Link href={href} className="font-semibold text-dim-foreground underline-offset-2 hover:text-foreground hover:underline">
      {title}
    </Link>
  );
}
