import type { RunCardView } from "@/lib/challenges/runs";
import { RunCard } from "@/components/challenges/pool/run-card";

// The Runs view: every member's Run of the Season shown as a card, who is
// ahead first and Abandoned Runs last, three to a row. With none yet, the
// empty panel carries Start a Run.
export function RunCards({ runs, emptyAction }: { runs: RunCardView[] | null; emptyAction?: React.ReactNode }) {
  if (runs === null) {
    return <Empty>The Runs couldn&apos;t be read just now. Try again in a moment.</Empty>;
  }
  if (runs.length === 0) return <Empty action={emptyAction}>No Runs yet. Be the first.</Empty>;
  return (
    <ul data-slot="run-cards" className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {runs.map((run) => (
        <li key={run.id}>
          <RunCard run={run} />
        </li>
      ))}
    </ul>
  );
}

function Empty({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div data-slot="community-note" className="flex flex-wrap items-center gap-4 rounded-md border border-dashed border-border-strong px-4 py-3.5 text-faint-foreground">
      <p>{children}</p>
      {action}
    </div>
  );
}
