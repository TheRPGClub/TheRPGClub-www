import type { Platform } from "@/lib/api/types";
import { backlogPickHref, type BacklogPickParams } from "@/lib/api/backlog-pick";
import { HAND, type Deal } from "@/lib/members/backlog-deal";
import { PickDeal } from "@/components/issue/member-pick-deal";

// The dealt hand, with a note when it came up short or wrapped round.
export function PickHand({
  userId,
  deal,
  filters,
  platforms,
}: {
  userId: string;
  deal: Extract<Deal, { kind: "ok" }>;
  filters: BacklogPickParams;
  platforms: Platform[] | undefined;
}) {
  const dealt = deal.picks.length;
  return (
    <div className="space-y-3">
      <PickDeal
        userId={userId}
        picks={deal.picks}
        platforms={platforms}
        redealHref={backlogPickHref(userId, {
          ...filters,
          seed: deal.meta.seed,
          position: deal.next,
        })}
      />
      {dealt < HAND && (
        <p className="text-sm text-faint-foreground">
          Only {dealt} game{dealt === 1 ? "" : "s"}{" "}
          fit{dealt === 1 ? "s" : ""} these filters, so the hand
          is short.
        </p>
      )}
      {deal.wrapped && (
        <p className="text-sm text-faint-foreground">
          Back to the start of your list, so picks may repeat.
        </p>
      )}
    </div>
  );
}
