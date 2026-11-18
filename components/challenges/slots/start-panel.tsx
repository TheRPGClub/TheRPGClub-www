import type { ChallengePage } from "@/lib/challenges/challenge-page";
import { previewMatrix } from "@/lib/challenges/slots";
import { RunMatrix } from "@/components/challenges/slots/run-matrix";
import { RunPanelHeader } from "@/components/challenges/slots/run-panel-header";

// The Run panel before the viewer has a Run (surface brief challenges-slots,
// "No Run yet"): the years their Run would have, all ghosts, with Start a
// Run. A birth-year range says the birth year will show; without a Birth
// Date the years can't be drawn, and starting asks for the date first.
export function StartPanel({ page, runAction }: { page: ChallengePage; runAction: React.ReactNode }) {
  const slots = page.challenge.slots;
  const thisYear = Number(page.today.slice(0, 4));
  const birth = slots?.first_year === "birth_year";
  const first = birth ? page.birthYear : (slots?.first_year as number | undefined) ?? null;
  const last = slots?.last_year === "current_year" || !slots ? thisYear : slots.last_year;
  const matrix = first !== null && first <= last ? previewMatrix(first, last, page.today) : null;
  return (
    <>
      <RunPanelHeader
        title={first !== null ? `Your Run · from ${first}` : "Your Run"}
        score={matrix ? { cleared: 0, target: matrix.target } : undefined}
        line={matrix ? `${matrix.target} open years` : undefined}
        actions={runAction}
      />
      {birth && (
        <p className="mb-4 max-w-[65ch] text-[0.95rem] text-dim-foreground">
          {page.birthYear
            ? "Your Run starts at your birth year, and your birth year will show on it. Only you and staff see the full date."
            : "Your Run starts at your birth year. Starting asks for your Birth Date first: your birth year will show on your Run, never the full date."}
        </p>
      )}
      {matrix && <RunMatrix rows={matrix.rows} label="The years your Run would have" />}
    </>
  );
}
