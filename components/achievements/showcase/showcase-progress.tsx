import type { GameAchievementSet } from "@/lib/api/types";
import type { SetMember } from "@/lib/achievements/game-page";
import { hadBy, showcaseCells, type ShowcaseLens } from "@/lib/achievements/showcase";
import { ReviewerAvatar } from "@/components/issue/review-meta";
import { TickStrip } from "../frame/tick-strip";

const AVATARS = 6;

// Where the lens stands in the set: "You: 31 of 54 · 57%" (or the club's
// tally) beside a strip with a cell per Achievement, then one quiet line of
// the club members who have the set and how many completed it.
export function ShowcaseProgress({
  set,
  lens,
  members,
}: {
  set: GameAchievementSet;
  lens: ShowcaseLens;
  members: SetMember[];
}) {
  const total = set.achievements.length;
  const had = set.achievements.filter((a) => hadBy(a, lens)).length;
  const percent = total ? Math.round((had / total) * 100) : 0;
  const completed = members.filter((m) => m.completedAt).length;
  const who = lens === "me" ? "You" : "The club";

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <p className="font-headline shrink-0 text-[1.6rem] leading-none">
          {who}: {had} of {total}
          <span className="text-faint-foreground"> · {percent}%</span>
        </p>
        <TickStrip
          cells={showcaseCells(set, lens)}
          label={`${who} ${lens === "me" ? "have" : "has"} ${had} of ${total} Achievements`}
          className="min-w-40 flex-1"
        />
      </div>
      {members.length > 0 && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.9rem] text-dim-foreground">
          <span className="flex gap-1">
            {members.slice(0, AVATARS).map((m) => (
              <ReviewerAvatar key={m.userId} userId={m.userId} name={m.name} size="sm" />
            ))}
          </span>
          <span>
            <b className="font-semibold text-foreground">
              {members.length} {members.length === 1 ? "member" : "members"}
            </b>{" "}
            {members.length === 1 ? "has" : "have"} this set
            {completed > 0 && (
              <>
                {" · "}
                <b className="font-semibold text-foreground">{completed} completed</b>
              </>
            )}
          </span>
        </p>
      )}
    </div>
  );
}
