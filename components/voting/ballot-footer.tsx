import Link from "next/link";
import { ArrowRight } from "lucide-react";

// The ballot panel's foot: the viewer's spend (or why they can't vote) and
// the way to the full ballot.
export function BallotFooter({
  votingOpen,
  signedIn,
  used,
  cap,
}: {
  votingOpen: boolean;
  signedIn: boolean;
  used: number;
  cap: number;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[0.8rem] text-faint-foreground">
      <span>
        {votingOpen && signedIn ? (
          <>
            You&apos;ve used{" "}
            <span className="font-semibold text-foreground">
              {used} of {cap}
            </span>{" "}
            votes. Vote again to take this one back.
          </>
        ) : votingOpen ? (
          "Sign in to vote on this round."
        ) : (
          "Voting for this round has closed."
        )}
      </span>
      <Link
        href="/voting"
        className="font-label inline-flex items-center gap-1 text-[0.82rem] font-extrabold tracking-[0.08em] text-foreground transition-colors hover:text-highlight [&_svg]:text-gotm"
      >
        See the full ballot
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
