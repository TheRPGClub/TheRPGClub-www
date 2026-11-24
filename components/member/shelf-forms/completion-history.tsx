import { pickTitle } from "@/lib/challenges/santa-pick";
import type { HistoryNode } from "@/lib/shelf-forms/history";
import { cn } from "@/lib/utils";

// The completion dialog's left column (spec api#451, 2B): the game's cover
// and two-line title, then the member's Game Completions of it on a
// timeline, oldest first, ending on a yellow node for the one being logged
// (or ringing the one being edited).
export function CompletionHistory({
  title,
  coverUrl,
  nodes,
  pending,
}: {
  title: string;
  coverUrl?: string | null;
  nodes: HistoryNode[];
  // The new completion's node ("This one · 2nd time" / "Finishing 24 Nov
  // 2026"), or null when editing one already in `nodes`.
  pending: { label: string; when: string } | null;
}) {
  const [first, second] = pickTitle(title).lines;
  return (
    <aside className="flex flex-col border-r border-border bg-muted px-5 py-5.5">
      <div className="aspect-[3/4] w-30 overflow-hidden rounded-xs bg-card shadow-[0_12px_30px_rgb(0_0_0/0.5)]">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
          <img src={coverUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="font-headline grid size-full place-items-center p-2 text-center text-faint-foreground">{title}</span>
        )}
      </div>
      <p className="font-headline mt-3 text-[1.6rem] leading-[0.92] uppercase">
        {first && <span className="block">{first}</span>}
        <span className="block">{second}</span>
      </p>
      <h3 className="font-label mt-5.5 mb-2.5 border-b border-border-strong pb-1.5 text-[0.78rem] leading-none font-extrabold tracking-[0.08em] text-faint-foreground uppercase">
        Your completions
      </h3>
      <ol className="relative pl-5.5 before:absolute before:top-1.5 before:bottom-1.5 before:left-[5px] before:w-0.5 before:bg-foreground">
        {nodes.map((node) => (
          <Node key={node.completionId} lit={node.current} label={node.when} sub={node.facts} />
        ))}
        {pending && <Node lit label={pending.label} sub={pending.when} />}
      </ol>
    </aside>
  );
}

function Node({ lit, label, sub }: { lit: boolean; label: string; sub: string }) {
  return (
    <li
      className={cn(
        "relative pb-3.5 last:pb-0 before:absolute before:top-1 before:-left-5.5 before:size-3 before:rounded-full before:shadow-[0_0_0_3px_var(--color-muted)]",
        lit ? "before:bg-highlight" : "before:bg-foreground",
      )}
    >
      <b className={cn("block text-[0.95rem] font-semibold", lit && "text-highlight")}>{label}</b>
      <small className="font-label block text-[0.72rem] leading-[1.3] font-bold tracking-[0.07em] text-faint-foreground uppercase">
        {sub}
      </small>
    </li>
  );
}
