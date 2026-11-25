import { ArrowLeftRight, Loader2, Plus } from "lucide-react";
import type { GotyNominationsState } from "@/hooks/use-goty-nominations";
import { Button } from "@/components/ui/button";

// Under the search: the picked game and the action that nominates it, or
// swaps it in for the nomination being changed. No reason field: Game of
// the Year nominations are only the game.
export function NominateBar({ state, full }: { state: GotyNominationsState; full: boolean }) {
  const { picked, replacing, pending, error } = state;
  if (!picked && !error) return null;
  const swapFrom = replacing?.game?.title;
  return (
    <div className="flex max-w-[40rem] flex-col gap-2 border-t border-border pt-3">
      {picked && (
        <>
          <p className="font-label text-sm font-extrabold tracking-[0.08em] uppercase">
            {swapFrom ? `Swap ${swapFrom} for ${picked.title}` : `Nominate ${picked.title}`}
          </p>
          {full && <p className="text-sm text-dim-foreground">You have three nominations. Swap or withdraw one to make room.</p>}
          <div className="flex gap-2">
            <Button type="button" variant="highlight" onClick={state.submit} disabled={pending || full}>
              {pending ? (
                <Loader2 className="motion-safe:animate-spin" />
              ) : swapFrom ? (
                <ArrowLeftRight data-icon="inline-start" />
              ) : (
                <Plus data-icon="inline-start" />
              )}
              {swapFrom ? "Swap" : "Nominate"}
            </Button>
            <Button type="button" variant="outline" onClick={state.cancel} disabled={pending}>
              Cancel
            </Button>
          </div>
        </>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
