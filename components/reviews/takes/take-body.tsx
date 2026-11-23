import { ReviewBodyContent } from "@/components/member/review-body";
import { reviewBodyText } from "@/lib/api/review-body";
import { editRuleDate, editedAt } from "@/lib/reviews/edit-rules";
import type { Take } from "@/lib/reviews/takes";
import { cn } from "@/lib/utils";

// A take as it reads in the column: its heading on the paper rule (its own
// title, else what it is) with the date and any Edit, then the story. Older
// takes read a shade quieter than the current one.
export function TakeBody({
  take,
  only,
  headline,
  emptyNote,
}: {
  take: Take;
  // The Review was never revisited: the one take is simply the review.
  only: boolean;
  // The banner's headline: a take whose title is that one isn't titled twice.
  headline: string | null;
  // Said for a take scored without a word.
  emptyNote: string;
}) {
  const own = take.title?.trim();
  const heading =
    (own && own !== headline ? own : null) ||
    (only ? "The review" : take.revisionId === null ? "The first take" : "Revisited");
  const edited = editedAt({ published_at: take.publishedAt, edited_at: take.editedAt });
  const written = reviewBodyText(take.body) !== null;
  return (
    <div>
      <header className="mb-4.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b-2 border-foreground pb-2">
        <h2 className="font-headline m-0 text-[1.9rem] leading-none">{heading}</h2>
        <small className="font-label text-[0.8rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase">
          {take.publishedAt && editRuleDate(take.publishedAt)}
          {edited && ` · edited ${editRuleDate(edited)}`}
        </small>
      </header>
      {written ? (
        <div className={cn("max-w-[68ch]", !take.current && "opacity-85")}>
          <ReviewBodyContent body={take.body} variant="article" />
        </div>
      ) : (
        <p className="m-0 text-faint-foreground italic">{emptyNote}</p>
      )}
    </div>
  );
}
