import Link from "next/link";
import type { GameAchievementSet } from "@/lib/api/types";
import { formatUnlockDate, isUnknownUnlockDate, memberSetHref } from "@/lib/achievements";
import { closestMember, type SetMember } from "@/lib/achievements/game-page";
import { ReviewerAvatar } from "@/components/issue/review-meta";
import { cn } from "@/lib/utils";

// The margin: each Completion signed on foil (oldest first), then the
// members still going, and who is closest when nobody has signed.
const UNSIGNED_SHOWN = 4;

export function ClubSetMargin({
  set,
  members,
  total,
}: {
  set: GameAchievementSet;
  members: SetMember[];
  total: number;
}) {
  const signed = members.filter((m) => m.completedAt);
  const going = members.filter((m) => !m.completedAt).slice(0, UNSIGNED_SHOWN);
  const closest = closestMember(members, total);

  return (
    <aside
      aria-label="Completions"
      className="mt-5 flex flex-col gap-3.5 border-t border-dashed border-border pt-4 lg:mt-0 lg:border-t-0 lg:border-l lg:pt-4 lg:pl-4"
    >
      <h4 className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">Completions</h4>
      {signed.length > 0 ? (
        <ol className="flex flex-wrap gap-3.5 lg:flex-col">
          {signed.map((m, i) => (
            <li key={m.userId}>
              <Link
                href={memberSetHref(m.userId, set.id)}
                className={cn(
                  "foil block rounded-[3px] p-[3px] shadow-[0_5px_12px_rgb(0_0_0/0.45)] outline-none motion-safe:transition-transform",
                  "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-highlight motion-safe:hover:rotate-0",
                  i % 2 === 0 ? "-rotate-3" : "rotate-2",
                )}
              >
                <span className="flex flex-col gap-1 rounded-[2px] bg-background px-2.5 pt-2 pb-1.5">
                  <span className="flex items-center gap-2 text-[1.05rem] font-semibold text-foreground italic">
                    <ReviewerAvatar userId={m.userId} name={m.name} size="xs" />
                    <span className="truncate">{m.name}</span>
                  </span>
                  <span className="font-label text-[0.74rem] tracking-[0.06em] text-dim-foreground">
                    {m.completedAt && isUnknownUnlockDate(m.completedAt)
                      ? "Completed, date unknown"
                      : `Completed ${formatUnlockDate(m.completedAt!)}`}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="border-b-[1.5px] border-dashed border-border-strong pb-1.5 text-[0.86rem] text-faint-foreground">
          No Completion yet
        </p>
      )}
      {going.length > 0 && (
        <ul className="flex flex-col gap-2">
          {going.map((m) => (
            <li
              key={m.userId}
              className="flex items-center gap-2 border-b-[1.5px] border-dashed border-border-strong pb-1.5 text-[0.86rem] text-faint-foreground"
            >
              <ReviewerAvatar userId={m.userId} name={m.name} size="xs" />
              <span className="truncate">{m.name}</span>
              <span className="ml-auto shrink-0 tabular-nums">
                {m.held} / {total}
              </span>
            </li>
          ))}
        </ul>
      )}
      {signed.length === 0 && closest && (
        <p className="text-[0.82rem] leading-snug text-faint-foreground italic">
          Closest: {closest.member.name}, {closest.toGo} to go.
        </p>
      )}
    </aside>
  );
}
