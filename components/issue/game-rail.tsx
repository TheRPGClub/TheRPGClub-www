import type { ReactNode } from "react";
import Link from "next/link";
import type { User } from "@/lib/api/types";
import type { LatestMember } from "@/lib/games/hero-panel";
import { ReviewerAvatar } from "@/components/issue/review-meta";
import { reviewerName } from "@/lib/reviews/reviewer-name";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// The game page's small sections (design www#156, round 3). The hero panel's
// four share one 34px head on a 1px strong rule, so their titles and rules
// sit level; the row under the hero opens each on the 2px paper rule. Either
// carries a link or a tool at its right end, opposite the title. No counts.

export function PanelHeading({ id, title, action }: { id?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex h-8.5 items-center justify-between gap-3 border-b border-border-strong">
      <h2 id={id} className="font-headline text-[1.3rem] leading-none">
        {title}
      </h2>
      {action}
    </div>
  );
}

export function RailHeading({ id, title, action }: { id?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-3 border-b-2 border-foreground pb-2">
      <h2 id={id} className="font-headline text-[1.3rem] leading-none">
        {title}
      </h2>
      {action}
    </div>
  );
}

// Who's playing or finished the game: every member's avatar, overlapping and
// wrapping (no "+N"), then the latest one and when.
export function PanelMembers({
  title,
  users,
  empty,
  latest,
}: {
  title: string;
  users: User[];
  empty: string;
  // "Tavi started 20 Nov" / "Latest: Rowan, Oct 2025".
  latest?: ReactNode;
}) {
  return (
    <section>
      <PanelHeading title={title} />
      {users.length === 0 ? (
        <p className="text-sm text-faint-foreground">{empty}</p>
      ) : (
        <>
          <ul className="flex flex-wrap items-center gap-y-1.5 pl-2">
            {users.map((user) => {
              const name = reviewerName(user, user.user_id);
              return (
                <li key={user.user_id} className="-ml-2">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Link
                          href={`/members/${user.user_id}`}
                          aria-label={name}
                          className="relative block rounded-full ring-3 ring-background motion-safe:transition-transform hover:z-10 motion-safe:hover:-translate-y-0.5 focus-visible:z-10"
                        />
                      }
                    >
                      <ReviewerAvatar userId={user.user_id} discordAvatar={user.discord_avatar} name={name} size="sm" className="size-7.5" />
                    </TooltipTrigger>
                    <TooltipContent>{name}</TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
          {latest && <p className="mt-2 text-[0.86rem] text-dim-foreground">{latest}</p>}
        </>
      )}
    </section>
  );
}

// The latest line's wording, the member's name in paper.
export function LatestLine({ latest, verb }: { latest: LatestMember; verb: "started" | "latest" }) {
  const name = <b className="font-semibold text-foreground">{latest.name}</b>;
  return verb === "started" ? (
    <>
      {name} started {latest.when}
    </>
  ) : (
    <>
      Latest: {name}, {latest.when}
    </>
  );
}
