import type { ReactNode } from "react";
import type { GameCompletion } from "@/lib/api/types";
import { MemberCover } from "@/components/issue/member-cover";
import type { ReelGroup } from "@/components/issue/member-completed-reel-entries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The reel's filmstrip: the page's completions as frames grouped by month.
// On a phone it is a grid of frames, never a sideways scroll. Picking a
// frame fills the spotlight. `renderFrame` lets the list's owner wrap a
// frame with its tools, or stand a hole in its place (null drops it).
export function ReelStrip({
  groups,
  selected,
  onPick,
  renderFrame,
}: {
  groups: ReelGroup[];
  selected: number;
  onPick: (index: number) => void;
  renderFrame?: (entry: GameCompletion, frame: ReactNode) => ReactNode;
}) {
  return (
    <div
      role="list"
      aria-label="Completions by month"
      className="space-y-6 md:flex md:gap-5.5 md:space-y-0 md:overflow-x-auto md:px-0.5 md:pt-3 md:pb-3.5 md:[scrollbar-color:var(--color-border-strong)_transparent]"
    >
      {groups.map((group) => (
        <section
          key={group.key}
          id={`m-${group.key}`}
          role="listitem"
          aria-label={group.label}
          className="flex scroll-mt-24 flex-col gap-2.5 md:shrink-0"
        >
          <h3 className="font-label border-b border-border pb-1.5 text-[0.84rem] font-extrabold tracking-[0.1em] text-faint-foreground">
            <span className="text-foreground">{group.label}</span>
            <span className="ml-2">{group.entries.length}</span>
          </h3>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:flex">
            {group.entries.map(({ entry, index }) => {
              const on = index === selected;
              const name = entry.game?.title ?? "Unknown game";
              const frame = (
                <Button
                  variant="frame"
                  onClick={() => onPick(index)}
                  aria-pressed={on}
                  className="group/cover relative block h-auto w-full p-0 text-left whitespace-normal"
                >
                  {on && (
                    <span
                      aria-hidden
                      className="absolute -top-3 left-1/2 hidden -translate-x-1/2 border-[6px] border-transparent border-t-foreground md:block"
                    />
                  )}
                  <MemberCover
                    game={entry.game}
                    title={name}
                    className={cn(
                      "transition-[box-shadow] motion-safe:transition-[transform,box-shadow] duration-200 motion-safe:group-hover/cover:-translate-y-1 group-focus-visible/cover:shadow-[0_0_0_3px_var(--color-highlight)]",
                      on && "shadow-[0_0_0_3px_var(--color-foreground)]",
                    )}
                    fallbackClassName="text-sm p-1.5"
                  />
                  <span
                    className={cn(
                      "font-label mt-1.5 line-clamp-2 block text-[0.8rem] leading-tight font-bold",
                      on ? "text-foreground" : "text-dim-foreground",
                    )}
                  >
                    {name}
                  </span>
                </Button>
              );
              const shown = renderFrame ? renderFrame(entry, frame) : frame;
              if (shown === null) return null;
              return (
                <li key={entry.completion_id} className="md:w-26">
                  {shown}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
