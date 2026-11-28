import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

// One Game Edit section (design www#156, round 3): its name in Anton on a
// paper rule, its add, search or refresh controls at the right, and, after
// a failed save, a "Didn't save" mark and its error inline above the
// section's body (its edits are still staged).
export function EditSection({
  title,
  actions,
  error,
  children,
}: {
  title: string;
  actions?: ReactNode;
  // The section's error from the last Save all.
  error?: string;
  children: ReactNode;
}) {
  return (
    <section data-slot="edit-section" aria-label={title}>
      <div data-slot="edit-section-head" className="flex min-h-12 flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-b-2 border-foreground pt-1.5 pb-2">
        <h2 className="flex items-center gap-3 font-headline text-[1.65rem] leading-none">
          {title}
          {/* A space between, so the heading reads "Franchises Didn't save"
              (the flex gap only spaces it on screen). */}
          {error && " "}
          {error && (
            <StagedMark kind="fail">
              <TriangleAlert aria-hidden className="size-3" />
              Didn&apos;t save
            </StagedMark>
          )}
        </h2>
        {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
      </div>
      {error && (
        <div role="alert" className="mt-3 grid grid-cols-[20px_minmax(0,1fr)] gap-x-2.5 gap-y-1 rounded-sm border-[1.5px] border-dashed border-destructive px-3.5 py-3">
          <TriangleAlert aria-hidden className="mt-px size-4.5 text-destructive" />
          <p className="font-label text-[0.9rem] font-extrabold tracking-[0.07em] text-destructive">
            {title} didn&apos;t save
          </p>
          <p className="col-start-2 text-[0.92rem]">{error}</p>
        </div>
      )}
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

// The marks on a staged edit: "Edited" (yellow outline), "Added" (yellow),
// "Removing" (orange outline), and "Didn't save" (orange).
export function StagedMark({ kind, children }: { kind: "edited" | "added" | "removing" | "fail"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "font-label inline-flex flex-none items-center gap-1 rounded-xs px-1.5 pt-1 pb-[3px] text-[0.72rem] leading-none font-extrabold tracking-[0.07em] whitespace-nowrap",
        kind === "edited" && "text-highlight shadow-[inset_0_0_0_1.5px_var(--color-highlight)]",
        kind === "added" && "bg-highlight text-highlight-foreground",
        kind === "removing" && "text-destructive shadow-[inset_0_0_0_1.5px_var(--color-destructive)]",
        kind === "fail" && "bg-destructive text-destructive-foreground",
      )}
    >
      {children}
    </span>
  );
}
