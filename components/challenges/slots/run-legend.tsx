import type { RunMatrix } from "@/lib/challenges/slots";

// The line under a Run's matrix: what its Past and Moved tags mean, the
// Cleared games still waiting for an open year, and, on another member's
// Run, that only they can change it.
export function RunLegend({ matrix, owner }: { matrix: RunMatrix; owner: string | null }) {
  const by = owner ? "them" : "you";
  const waiting = matrix.waiting.map((g) => g.title);
  const items = [
    matrix.tags.past && { tag: "Past", text: `Cleared before ${owner ? "their" : "your"} Run, picked by ${by}` },
    matrix.tags.moved && { tag: "Moved", text: `Moved by ${by} to another year it was released in` },
  ].filter((item): item is { tag: string; text: string } => !!item);
  if (items.length === 0 && waiting.length === 0 && !owner) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-[18px] gap-y-2 text-[0.875rem] text-dim-foreground">
      {items.map((item) => (
        <span key={item.tag} className="inline-flex items-center gap-1.5">
          <span className="font-label rounded-xs bg-foreground px-1 pt-[3px] pb-0.5 text-[0.625rem] leading-none font-extrabold tracking-[0.06em] text-background uppercase">
            {item.tag}
          </span>
          {item.text}
        </span>
      ))}
      {waiting.length > 0 && (
        <span>
          {waiting.join(", ")} {waiting.length === 1 ? "is" : "are"} Cleared and waiting for an open year{" "}
          {waiting.length === 1 ? "it fits" : "they fit"}.
        </span>
      )}
      {owner && (
        <span className="text-faint-foreground sm:ml-auto">Read-only: only {owner} can pick or move games here.</span>
      )}
    </div>
  );
}
