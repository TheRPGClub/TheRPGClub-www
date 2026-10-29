import Link from "next/link";
import { Plus, Vote } from "lucide-react";
import type { Nomination, VotingCategory, VotingRound } from "@/lib/api/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The club's open business, in the call-to-action yellow: nominations or the
// vote for the next round, with a monumental days-left count. `tall` is the
// panel taking a whole column (a round with only one track's winners), which
// leaves room to list the latest nominations.

export type TrackedNomination = Nomination & { category: VotingCategory };

const DAY_MS = 24 * 60 * 60 * 1000;

function daysUntil(iso: string, now: number): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now) / DAY_MS));
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(iso));
}

export function RoundPanel({
  round,
  nominations,
  viewerId,
  now,
  tall = false,
}: {
  round: VotingRound;
  // Both tracks' nominations for the round, newest first, each tagged with
  // its track.
  nominations: TrackedNomination[];
  viewerId?: string;
  // Request time, passed in so the render stays pure.
  now: number;
  tall?: boolean;
}) {
  const n = round.round_number;
  const nominating = round.phase === "nominating";
  const voting = round.phase === "voting";
  const deadline = nominating
    ? round.voting_opens_at
    : voting
      ? round.voting_closes_at
      : null;
  const days = deadline ? daysUntil(deadline, now) : null;
  const viewerNominated = viewerId
    ? nominations.some((nomination) => nomination.user_id === viewerId)
    : false;

  const title = nominating
    ? "Nominations"
    : voting
      ? "Voting"
      : "Results";
  const detail = nominating
    ? `Nominations close ${formatDate(round.voting_opens_at)}. ${
        viewerNominated
          ? "You've nominated a game."
          : "You haven't nominated a game yet."
      }`
    : voting
      ? `Voting closes ${formatDate(round.voting_closes_at)}. ${nominations.length} games on the ballot.`
      : round.phase === "tie"
        ? "Voting ended in a tie. The admins will pick the winner."
        : "Voting has ended. The winners are being recorded.";

  return (
    <section
      aria-label={`Round ${n} ${title.toLowerCase()}`}
      className={cn(
        "flex flex-col rounded-md bg-highlight px-4.5 pt-3.5 pb-4 text-ink",
        tall && "h-full",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-headline text-[1.65rem] leading-[0.95]">
          Round {n}
          <br />
          {title}
        </h2>
        {days != null && (
          <p className="font-label text-right text-xs leading-none font-extrabold">
            <span className="font-headline block text-[2.4rem] leading-[0.85] font-normal">
              {days}
            </span>
            {days === 1 ? "day left" : "days left"}
          </p>
        )}
      </div>
      <p className="mt-1.5 text-[0.82rem] font-medium text-highlight-ink">
        {detail}
      </p>

      {tall && nominations.length > 0 && (
        <div className="mt-3 flex-1 border-t-2 border-ink">
          <h3 className="font-label pt-2 pb-1 text-[0.8rem] font-extrabold tracking-[0.1em]">
            Latest nominations
          </h3>
          <ol>
            {nominations.slice(0, 5).map((nomination) => {
              const cover =
                nomination.game?.cover_url ?? nomination.game?.art_url;
              return (
                <li
                  key={`${nomination.category}-${nomination.nomination_id}`}
                  className="grid grid-cols-[1.9rem_1fr_auto] items-center gap-2.5 border-t border-ink/20 py-1.5 first:border-t-0"
                >
                  <span className="block h-10 w-[1.9rem] overflow-hidden rounded-[2px] bg-ink/15">
                    {cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt=""
                        className="size-full object-cover"
                      />
                    )}
                  </span>
                  <span className="min-w-0">
                    <b className="font-label block truncate text-[0.95rem] leading-tight font-extrabold tracking-[0.02em]">
                      {nomination.game?.title ?? "Unknown game"}
                    </b>
                    <small className="block truncate text-xs text-highlight-ink">
                      by{" "}
                      {nomination.user?.global_name ??
                        nomination.user?.username ??
                        "a member"}
                    </small>
                  </span>
                  <span
                    className={cn(
                      "font-label rounded-[2px] px-1.5 py-px text-[0.68rem] font-extrabold tracking-[0.08em] text-white",
                      nomination.category === "gotm" ? "bg-gotm" : "bg-nr",
                    )}
                  >
                    {nomination.category === "gotm" ? "GOTM" : "NR"}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {(nominating || voting) && (
          <Link
            href="/voting"
            className={cn(
              buttonVariants(),
              "bg-ink text-paper hover:bg-ink/85",
            )}
          >
            {nominating ? <Plus data-icon="inline-start" /> : <Vote data-icon="inline-start" />}
            {nominating
              ? viewerNominated
                ? "Your nomination"
                : "Nominate a game"
              : "Cast your votes"}
          </Link>
        )}
        <Link
          href="/voting"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-ink text-ink hover:border-ink hover:bg-ink/10",
          )}
        >
          {nominating || voting
            ? `See all ${nominations.length}`
            : "See results"}
        </Link>
      </div>
    </section>
  );
}
