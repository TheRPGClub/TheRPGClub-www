import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The Game Edit page's sticky save bar: the count of unsaved changes in
// yellow with what they are, then Discard and Save all. After a failed save
// its top edge turns signal orange. On a phone it rides above the tab bar,
// its breakdown left out.
export function SaveBar({
  count,
  breakdown,
  failed,
  saving,
  onDiscard,
  onSave,
}: {
  count: number;
  // "Text & video 2", one per changed section.
  breakdown: string[];
  failed: boolean;
  saving: boolean;
  onDiscard: () => void;
  onSave: () => void;
}) {
  if (count === 0) return null;
  return (
    <div
      role="region"
      aria-label="Unsaved changes"
      data-slot="save-bar"
      data-tone={failed ? "failed" : undefined}
      className={cn(
        "sticky bottom-[calc(3.875rem+env(safe-area-inset-bottom))] z-20 -mx-4 mt-11 flex items-center gap-3 bg-card px-4 py-2.5 sm:mx-0 sm:gap-4 sm:rounded-t-md sm:px-4.5 sm:py-3 md:bottom-0",
        failed
          ? "shadow-[inset_0_2px_0_var(--color-destructive),0_-14px_30px_rgb(0_0_0/0.55)]"
          : "shadow-[inset_0_2px_0_var(--color-highlight),0_-14px_30px_rgb(0_0_0/0.55)]",
      )}
    >
      <span data-slot="save-bar-count" className="font-headline text-[2rem] leading-[0.8] text-highlight sm:text-[2.5rem]">{count}</span>
      <span className="font-label text-[0.9rem] leading-[1.1] font-extrabold tracking-[0.07em]">
        unsaved change{count === 1 ? "" : "s"}
        <small className="mt-0.5 hidden font-sans text-[0.8rem] leading-[1.35] font-semibold tracking-normal text-faint-foreground normal-case sm:block">
          {breakdown.join(" · ")}
        </small>
      </span>
      <span className="ml-auto flex gap-2">
        <Button variant="outline" onClick={onDiscard} disabled={saving}>
          Discard
        </Button>
        <Button variant="highlight" onClick={onSave} disabled={saving}>
          <Check aria-hidden />
          {saving ? "Saving" : "Save all"}
        </Button>
      </span>
    </div>
  );
}
