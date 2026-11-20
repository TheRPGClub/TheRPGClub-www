import { SUGGESTION_ACTIVITY_LABEL, ageLabel, suggestionActivity, suggestionActivityAt } from "@/lib/dashboard/panel-items";
import { readSuggestions } from "@/lib/dashboard/panel-sources";
import { PANELS } from "@/lib/dashboard/panels";
import { MetaParts, PanelItem, PanelWhen } from "./panel-list";
import { listBody } from "./body-kit";
import type { BodyProps } from "./panel-body";

// Suggestion Board: the open and approved Suggestions with the latest
// activity (a submission, a review or an upvote), each led by its upvotes.
export async function SuggestionsBody({ wide }: BodyProps) {
  const suggestions = await readSuggestions();
  const now = Date.now();
  return listBody({
    rows: suggestions,
    title: PANELS.suggestions.title,
    wide,
    row: (s) => (
      <PanelItem
        key={s.suggestion_id}
        media={<Votes count={s.upvote_count} />}
        title={s.title}
        href="/suggestions"
        meta={<MetaParts parts={[<b key="k">{SUGGESTION_ACTIVITY_LABEL[suggestionActivity(s)]}</b>, s.created_by_name]} />}
        aside={<PanelWhen>{ageLabel(suggestionActivityAt(s), now)}</PanelWhen>}
      />
    ),
  });
}

// The upvotes as an Anton figure over "votes", in the panel's ink.
function Votes({ count }: { count: number }) {
  return (
    <span className="flex w-10 flex-col items-center gap-0.5">
      <b className="font-headline text-[1.45rem] leading-[0.9] font-normal text-(--panel-ink)">{count}</b>
      <span className="font-label text-[0.65rem] leading-none font-bold tracking-[0.08em] text-faint-foreground">
        {count === 1 ? "vote" : "votes"}
      </span>
    </span>
  );
}
