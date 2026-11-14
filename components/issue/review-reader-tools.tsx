import Link from "next/link";
import { ArrowLeft, ArrowRight, Pencil } from "lucide-react";

// The reader's top line: back to the list, and the review's own page (and
// its editor, for the author).
export function ReviewReaderTools({
  backHref,
  fullHref,
  isMine,
}: {
  backHref: string;
  fullHref: string;
  isMine: boolean;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <Link
        href={backHref}
        className="font-label inline-flex items-center gap-1.5 text-[0.88rem] font-extrabold tracking-[0.08em] text-foreground transition-colors hover:text-highlight [&_svg]:size-4 [&_svg]:text-gotm"
      >
        <ArrowLeft aria-hidden />
        Back to reviews
      </Link>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {isMine && (
          <Link
            href={`${fullHref}?edit=1`}
            className="font-label inline-flex items-center gap-1.5 text-[0.82rem] font-extrabold tracking-[0.08em] text-dim-foreground transition-colors hover:text-highlight [&_svg]:size-3.5"
          >
            <Pencil aria-hidden />
            Edit your review
          </Link>
        )}
        <Link
          href={fullHref}
          className="font-label inline-flex items-center gap-1.5 text-[0.82rem] font-extrabold tracking-[0.08em] text-dim-foreground transition-colors hover:text-highlight [&_svg]:size-3.5"
        >
          Open as a page
          <ArrowRight aria-hidden />
        </Link>
      </div>
    </div>
  );
}
