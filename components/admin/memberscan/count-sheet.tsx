import type { BotJob } from "@/lib/api/types";
import { parseMemberScanCounts } from "@/lib/memberscan";

// The scan's three counts in Anton, as the bot reported them; dashes until
// the job is done. A result text without the counts is shown as it is.
export function CountSheet({ job, heading }: { job: BotJob | null; heading: string }) {
  const done = job?.status === "done";
  const counts = done ? parseMemberScanCounts(job.result_text) : null;
  const cells = [
    { label: "Updated", value: counts?.updated },
    { label: "Failed", value: counts?.failed },
    { label: "Departed", value: counts?.departed },
  ];
  return (
    <div className="bg-card p-5">
      <p className="font-label text-[0.85rem] tracking-[0.08em] text-dim-foreground">{heading}</p>
      <dl className="mt-4 grid grid-cols-3 border-t border-border">
        {cells.map((cell, i) => (
          <div key={cell.label} className={i > 0 ? "border-l border-border pt-3 pl-4" : "pt-3 pr-4"}>
            <dt className="font-label text-[0.78rem] tracking-[0.06em] text-faint-foreground">
              {cell.label}
            </dt>
            <dd className="font-headline mt-1 text-[2.6rem] leading-[0.9] tabular-nums">
              {cell.value ?? "--"}
            </dd>
          </div>
        ))}
      </dl>
      {done && !counts && job.result_text && (
        <p className="mt-4 border-t border-dashed border-border-strong pt-3 text-[0.92rem] text-dim-foreground italic">
          &ldquo;{job.result_text}&rdquo;
        </p>
      )}
    </div>
  );
}
