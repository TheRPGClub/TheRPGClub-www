import type { ReactNode } from "react";
import { chapterDate, eventYear, kindInk, kindName } from "@/lib/codex/history";
import { historyEventAnchor } from "@/lib/codex/paths";
import type { CodexEntry } from "@/lib/codex/types";
import { HistoryDescription } from "./history-description";
import { HistoryEventActions } from "./history-event-actions";

// One History Event in its year's chapter (2B): the Kind dot, the date
// without its year ("14 March", "June", or a quieter "Some time in 2016")
// and the Kind in its ink, then the title in Anton, the description and
// See also (www#127's, through `seeAlso`).
export function HistoryEvent({
  event,
  linked,
  seeAlso,
}: {
  event: CodexEntry;
  // Members get mentions as profile links; Visitors read names only.
  linked: boolean;
  seeAlso?: ReactNode;
}) {
  const date = chapterDate(event.occurred_on, event.date_precision);
  const title = event.title ?? "";
  return (
    <article
      id={historyEventAnchor(event.id)}
      style={{ "--ink": kindInk(event.kind) } as React.CSSProperties}
      className="group/event scroll-mt-9"
    >
      <div className="flex min-h-6 items-center gap-2.5">
        <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-(--ink)" />
        {date ? (
          <span className="font-label text-[0.875rem] leading-none font-bold tracking-[0.08em] text-foreground uppercase">
            {date}
          </span>
        ) : (
          <span className="text-[0.9375rem] leading-tight font-medium text-dim-foreground italic">
            Some time in {eventYear(event)}
          </span>
        )}
        <span className="font-label text-[0.78rem] leading-none font-bold tracking-[0.08em] text-(--ink) uppercase">
          {kindName(event.kind)}
        </span>
        <HistoryEventActions
          id={event.id}
          title={title}
          canEdit={event.viewer.can_edit}
          canDelete={event.viewer.can_delete}
        />
      </div>
      <h3 className="font-headline mt-2 mb-1.5 max-w-[30ch] text-[1.75rem] leading-[0.95] text-balance uppercase sm:text-[2.125rem]">
        {title}
      </h3>
      <HistoryDescription event={event} linked={linked} />
      {seeAlso}
    </article>
  );
}
