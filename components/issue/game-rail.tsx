import Link from "next/link";
import type { User } from "@/lib/api/types";
import { ReviewerAvatar, reviewerName } from "@/components/issue/review-meta";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// The game page's right rail: who's playing it, who finished it, and the
// facts. Each block opens on the same small Anton heading over a paper rule.

export function RailHeading({
  title,
  count,
}: {
  title: string;
  count?: string;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3 border-b-2 border-paper pb-2">
      <h2 className="font-headline text-[1.4rem] leading-none">{title}</h2>
      {count && (
        <span className="font-label text-[0.82rem] font-extrabold tracking-[0.08em] text-paper-mute">
          {count}
        </span>
      )}
    </div>
  );
}

const MAX_VISIBLE = 6;

export function RailMembers({
  title,
  users,
  empty,
}: {
  title: string;
  users: User[];
  empty: string;
}) {
  const shown = users.slice(0, MAX_VISIBLE);
  const rest = users.length - shown.length;
  return (
    <section>
      <RailHeading
        title={title}
        count={
          users.length > 0
            ? `${users.length} ${users.length === 1 ? "member" : "members"}`
            : undefined
        }
      />
      {users.length === 0 ? (
        <p className="text-sm text-paper-mute">{empty}</p>
      ) : (
        <ul className="flex items-center">
          {shown.map((user, i) => {
            const name = reviewerName(user, user.user_id);
            return (
              <li key={user.user_id} className={cn(i > 0 && "-ml-2.5")}>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Link
                        href={`/members/${user.user_id}`}
                        aria-label={name}
                        className="relative block rounded-full ring-3 ring-ink transition-transform hover:z-10 hover:-translate-y-0.5 focus-visible:z-10"
                      />
                    }
                  >
                    <ReviewerAvatar userId={user.user_id} name={name} />
                  </TooltipTrigger>
                  <TooltipContent>{name}</TooltipContent>
                </Tooltip>
              </li>
            );
          })}
          {rest > 0 && (
            <li className="font-label ml-2.5 text-sm font-extrabold tracking-[0.04em] text-paper-dim">
              +{rest}
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

export function RailFacts({
  facts,
}: {
  facts: { label: string; value: React.ReactNode }[];
}) {
  if (facts.length === 0) return null;
  return (
    <section>
      <RailHeading title="Details" />
      <dl className="grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-2.5 text-sm">
        {facts.map((fact) => (
          <div key={fact.label} className="contents">
            <dt className="font-label pt-px text-[0.8rem] font-extrabold tracking-[0.08em] text-paper-mute">
              {fact.label}
            </dt>
            <dd className="leading-[1.4] text-paper">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
