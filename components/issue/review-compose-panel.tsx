import Link from "next/link";
import { PenLine } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The yellow "You're playing this → Write a review" call to action. It only
// turns yellow when the viewer can actually review the game (they're playing
// it or have finished it); a signed-in member who can't yet gets a quiet
// note saying how to unlock it instead.
//
// `bar` is the wide strip (game page, above the reviews); `stack` is the
// narrow panel in the reviews list's left column.

const COPY = {
  playing: {
    title: "You're playing this",
    line: "Tell the club what you make of it so far.",
  },
  completed: {
    title: "You finished this",
    line: "Tell the club what you made of it.",
  },
  // Eligible, but the page didn't say which list the game is on.
  unknown: {
    title: "Review this game",
    line: "Score it and say what you think; the club reads every one.",
  },
} as const;

export function ReviewComposePanel({
  ownerId,
  canWriteReview,
  status,
  onStart,
  href,
  variant = "bar",
  className,
}: {
  ownerId: string;
  canWriteReview: boolean;
  status: "playing" | "completed" | null;
  // A button that opens the composer in place, or a link to where it opens.
  onStart?: () => void;
  href?: string;
  variant?: "bar" | "stack";
  className?: string;
}) {
  const stack = variant === "stack";

  if (!canWriteReview) {
    return (
      <div
        className={cn(
          "rounded-md border border-dashed border-rule-strong px-4 py-3.5 text-sm text-paper-dim",
          className,
        )}
      >
        <p className="font-label text-[0.95rem] font-extrabold text-paper">
          Want to review it?
        </p>
        <p className="mt-1">
          Add it to{" "}
          <Link
            href={`/members/${ownerId}/edit`}
            className="text-paper underline decoration-paper-mute/60 underline-offset-2 hover:text-highlight"
          >
            Now Playing or Completed
          </Link>{" "}
          first, and the composer opens up.
        </p>
      </div>
    );
  }

  const copy = COPY[status ?? "unknown"];
  const buttonClass = cn(
    buttonVariants(),
    "bg-ink text-paper hover:bg-ink/85",
    stack ? "mt-3 w-full" : "sm:ml-auto",
  );
  const label = (
    <>
      <PenLine data-icon="inline-start" />
      Write a review
    </>
  );

  return (
    <section
      aria-label="Write a review"
      className={cn(
        "rounded-md bg-highlight text-ink",
        stack
          ? "p-4"
          : "flex flex-wrap items-center gap-x-4 gap-y-3 px-[18px] py-4",
        className,
      )}
    >
      <div>
        <h3
          className={cn(
            "font-headline leading-none",
            stack ? "text-[1.4rem]" : "text-2xl",
          )}
        >
          {copy.title}
        </h3>
        <p className="mt-1 text-[0.85rem] text-highlight-ink">{copy.line}</p>
      </div>
      {href ? (
        <Link href={href} scroll={false} className={buttonClass}>
          {label}
        </Link>
      ) : (
        <button type="button" onClick={onStart} className={buttonClass}>
          {label}
        </button>
      )}
    </section>
  );
}
