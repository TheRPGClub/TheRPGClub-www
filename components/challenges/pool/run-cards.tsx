import type { RunCardView } from "@/lib/challenges/runs";
import { RunCard } from "@/components/challenges/pool/run-card";

// The Runs view: every member's Run of the Season shown as a card, who is
// ahead first and Abandoned Runs last, three to a row.
export function RunCards({ runs }: { runs: RunCardView[] | null }) {
  if (runs === null) {
    return <Empty>The Runs couldn&apos;t be read just now. Try again in a moment.</Empty>;
  }
  if (runs.length === 0) return <Empty>No Runs yet. Be the first.</Empty>;
  return (
    <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {runs.map((run) => (
        <li key={run.id}>
          <RunCard run={run} />
        </li>
      ))}
    </ul>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-border-strong px-4 py-3.5 text-faint-foreground">{children}</p>
  );
}
