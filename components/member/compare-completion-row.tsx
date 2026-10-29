import type { CommonCompletion, CommonCompletionSide } from "@/lib/api/types";
import { formatCompletedMonth } from "@/lib/completions";
import { MemberGameCard } from "@/components/member/member-game-card";

export interface CompareCompletionRowProps {
  row: CommonCompletion;
  leftName: string;
  rightName: string;
}

// One shared game: its cover card, then each member's latest completion of it
// side by side (left = the page's member, right = the one compared with).
export function CompareCompletionRow({
  row,
  leftName,
  rightName,
}: CompareCompletionRowProps) {
  return (
    <li className="flex gap-4 rounded-lg border bg-card p-3">
      <MemberGameCard game={row.game} className="w-24 shrink-0 sm:w-28" />
      <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 self-start sm:grid-cols-2">
        <CompareSide name={leftName} side={row.left} />
        <CompareSide name={rightName} side={row.right} />
      </div>
    </li>
  );
}

function CompareSide({
  name,
  side,
}: {
  name: string;
  side: CommonCompletionSide;
}) {
  const { latest, count } = side;
  const platform = latest.platform?.platform_name ?? null;
  return (
    <div className="min-w-0 space-y-1 rounded-md bg-muted/40 px-3 py-2 text-sm">
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate font-medium">{name}</p>
        {count > 1 && (
          <span
            className="shrink-0 text-xs text-muted-foreground tabular-nums"
            title={`Completed ${count} times`}
          >
            ×{count}
          </span>
        )}
      </div>
      <dl className="space-y-0.5 text-xs text-muted-foreground">
        <div>
          <dt className="sr-only">Completed</dt>
          <dd className="text-brand-500">
            {formatCompletedMonth(latest.completed_at) ?? "No date"}
          </dd>
        </div>
        <div>
          <dt className="sr-only">Type</dt>
          <dd>{latest.completion_type}</dd>
        </div>
        {platform && (
          <div>
            <dt className="sr-only">Platform</dt>
            <dd className="truncate">{platform}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
