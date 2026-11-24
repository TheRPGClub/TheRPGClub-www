import type { PoolGoal } from "@/lib/challenges/runs";
import { cn } from "@/lib/utils";

// A Pool Run's goal on its card (spec api#442; the Run card of the picks'
// gallery): a labelled bar each for Core ("Core 9/14") and Optional
// ("Optional 1/2"), a segment per game in the tint's hi, then, once the
// member Cleared more Optional Games than needed, every one of them.
export function RunGoal({ goal }: { goal: PoolGoal }) {
  return (
    <div className="space-y-1.5">
      {goal.core.total > 0 && (
        <GoalBar label="Core" cleared={goal.core.cleared} of={goal.core.total} segments={goal.core.segments} />
      )}
      {(goal.optional.target > 0 || goal.optional.cleared > 0) && (
        <GoalBar
          label="Optional"
          cleared={goal.optional.cleared}
          of={goal.optional.target}
          segments={goal.optional.segments}
        />
      )}
      {goal.extra > 0 && (
        <p className="text-[0.82rem] leading-snug text-faint-foreground">
          Optional Cleared: <span className="text-dim-foreground">{goal.optionalCleared.join(", ")}</span> ·{" "}
          {goal.optional.target > 0 ? `${goal.extra} more than needed` : "beyond the goal"}
        </p>
      )}
    </div>
  );
}

function GoalBar({ label, cleared, of, segments }: { label: string; cleared: number; of: number; segments: boolean[] }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-2.5">
      <span className="font-label text-[0.72rem] tracking-[0.08em] text-faint-foreground uppercase">{label}</span>
      <div className="flex gap-1" aria-hidden>
        {segments.map((on, i) => (
          <i
            key={i}
            className={cn("h-1.5 flex-1 rounded-[1px]", on ? "bg-(--challenge-tint-hi)" : "bg-border-strong")}
          />
        ))}
        {segments.length === 0 && <i className="h-1.5 flex-1 rounded-[1px] bg-border" />}
      </div>
      <span className="font-headline text-[1.05rem] leading-none tabular-nums">
        {cleared}
        <span className="text-faint-foreground">/{of}</span>
        <span className="sr-only"> {label} Games Cleared</span>
      </span>
    </div>
  );
}
