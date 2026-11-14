import { backlogPickHref, type BacklogPickParams } from "@/lib/api/backlog-pick";
import { pickEmptyMessage } from "@/lib/members/backlog-deal";
import { ButtonLink } from "@/components/ui/button";

// Nothing to deal: why, and a way to drop the filters that narrowed it.
export function PickEmpty({
  userId,
  filters,
  total,
}: {
  userId: string;
  filters: BacklogPickParams;
  total: number;
}) {
  return (
    <div className="space-y-3 rounded-sm border border-dashed border-border-strong px-4 py-10 text-center">
      <p className="text-sm text-faint-foreground">{pickEmptyMessage(filters, total)}</p>
      {(filters.platformId !== null || filters.maxHours !== null) && (
        <ButtonLink
          href={backlogPickHref(userId, {
            source: filters.source,
            platformId: null,
            maxHours: null,
            seed: null,
            position: 0,
          })}
          variant="ghost"
          size="sm"
        >
          Clear filters
        </ButtonLink>
      )}
    </div>
  );
}
