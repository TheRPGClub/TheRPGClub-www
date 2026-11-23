import type { ReviewRevision } from "@/lib/api/types";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { headlineTitle, reviewDeleteNote, revisionDeleteNote, type Take } from "@/lib/reviews/takes";
import { DeleteReviewFoot } from "./delete-review-foot";
import { DraftRevisionStop } from "./draft-revision-stop";
import { RevisitStop } from "./revisit-stop";
import { TakeBody } from "./take-body";
import { TakeRow } from "./take-row";
import { TakeScorecard } from "./take-scorecard";

// The score line: one reading column, newest take first, each take hanging
// off a dated stop on a spine in the left margin, its scorecard in the right
// margin, the first take whole at the foot. The author also finds a yellow
// Revisit stop waiting at the top (or their Draft Revision in its place),
// Edit and Delete revision on each stop, and Delete review at the foot.
export function ReviewTakes({
  takes,
  accent,
  owner,
  draftRevision,
  authorName,
  now,
}: {
  // Oldest first, as `reviewTakes` gives them.
  takes: Take[];
  accent: ReviewAccent;
  // The author's own view; null for every other reader.
  owner: { userId: string; reviewId: number; gameId: number } | null;
  draftRevision: ReviewRevision | null;
  authorName: string;
  now: number;
}) {
  const newestFirst = [...takes].reverse();
  const only = takes.length === 1;
  const headline = headlineTitle(takes);
  return (
    <section aria-label={only ? "The review" : "Every take, newest first"}>
      {owner &&
        (draftRevision ? (
          <DraftRevisionStop draft={draftRevision} owner={owner} now={now} />
        ) : (
          <RevisitStop reviewId={owner.reviewId} />
        ))}
      {newestFirst.map((take, i) => {
        const previous = takes[takes.indexOf(take) - 1];
        return (
          <TakeRow
            key={take.key}
            take={take}
            accent={accent}
            owner={owner}
            last={i === newestFirst.length - 1}
            deleteNote={revisionDeleteNote(takes, take.key)}
            scorecard={<TakeScorecard facets={take.facets} previous={previous?.facets} />}
          >
            <TakeBody
              take={take}
              only={only}
              headline={headline}
              emptyNote={
                owner
                  ? "You scored this take without writing anything."
                  : `${authorName} scored this take without writing anything.`
              }
            />
          </TakeRow>
        );
      })}
      {owner && <DeleteReviewFoot owner={owner} note={reviewDeleteNote(takes)} />}
    </section>
  );
}
