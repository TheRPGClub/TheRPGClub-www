"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { CodexEntry } from "@/lib/codex/types";
import { shelfScale, spineBindings, spineWidth } from "@/lib/codex/shelf";
import { cn } from "@/lib/utils";
import { LoreSpine } from "./lore-spine";

// The shelf and its slide-out (4D): the page's Lore Entries stand as spines,
// newest on the left, and the picked one is pulled out beside the shelf.
// The shelf is a listbox: click a spine, or move along it with the arrow
// keys (Home and End jump to the ends). The pick is kept in the URL as
// `?entry=` so it survives a reload. Each slide-out is rendered on the
// server and passed in as `slides`, keyed by entry id.
export function LoreShelf({
  entries,
  slides,
  initial,
  viewerId,
}: {
  entries: CodexEntry[];
  slides: Record<number, ReactNode>;
  initial: number;
  viewerId: string | null;
}) {
  const [picked, setPicked] = useState(initial);
  const spines = useRef<Record<number, HTMLDivElement | null>>({});
  const slide = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const bindings = spineBindings(entries.map((e) => e.id));
  // From sm the spines shrink (to 0.7 at most) to stand in the panel's width;
  // past that, and on phones, the shelf scrolls sideways inside its panel.
  const [scale, setScale] = useState<number | null>(null);
  const widths = entries.map((e) => spineWidth(e.body?.length ?? 0)).join(",");
  useEffect(() => {
    const box = row.current;
    if (!box) return;
    const fit = () => {
      const wide = window.matchMedia("(min-width: 640px)").matches;
      setScale(wide ? shelfScale(widths.split(",").map(Number), 6, box.clientWidth - 8) : null);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, [widths]);

  function pick(id: number, focus = false) {
    setPicked(id);
    const url = new URL(window.location.href);
    url.searchParams.set("entry", String(id));
    window.history.replaceState(null, "", url);
    if (focus) spines.current[id]?.focus();
    // On phones the slide-out sits under the shelf.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      slide.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function onKeyDown(event: KeyboardEvent) {
    const at = entries.findIndex((e) => e.id === picked);
    const to = { ArrowRight: at + 1, ArrowDown: at + 1, ArrowLeft: at - 1, ArrowUp: at - 1, Home: 0, End: entries.length - 1 }[event.key];
    if (to === undefined) return;
    event.preventDefault();
    const next = entries[Math.min(Math.max(to, 0), entries.length - 1)];
    if (next) pick(next.id, true);
  }

  return (
    <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_440px]">
      <div className="min-w-0 rounded-md bg-card px-4 pt-6.5 sm:px-7">
        <div
          ref={row}
          style={scale ? ({ "--spine-scale": scale } as React.CSSProperties) : undefined}
          className="overflow-x-auto overflow-y-hidden [--spine-scale:0.7] sm:[--spine-scale:1]"
        >
          <div
            role="listbox"
            aria-label="Lore Entries, newest first"
            aria-orientation="horizontal"
            onKeyDown={onKeyDown}
            className="flex h-[calc(540px*var(--spine-scale))] w-max min-w-full items-end gap-1.5 px-1 pt-6"
          >
            {entries.map((entry, i) => (
              <div
                key={entry.id}
                ref={(el) => {
                  spines.current[entry.id] = el;
                }}
                role="option"
                aria-selected={entry.id === picked}
                aria-label={entry.title ?? "Lore Entry"}
                tabIndex={entry.id === picked ? 0 : -1}
                onClick={() => pick(entry.id)}
                className={cn(
                  "cursor-pointer rounded-t-[2.4px] outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-highlight",
                  entry.id !== picked && "motion-safe:transition-transform motion-safe:hover:-translate-y-2",
                )}
              >
                <LoreSpine
                  entry={entry}
                  binding={bindings[i]}
                  picked={entry.id === picked}
                  yours={entry.author.user_id === viewerId}
                />
              </div>
            ))}
          </div>
        </div>
        <div aria-hidden className="-mx-4 h-4 bg-border-strong shadow-[0_8px_16px_rgb(0_0_0/0.5)] sm:-mx-7" />
        <p className="font-label py-3 text-[0.75rem] font-bold tracking-[0.08em] text-faint-foreground">
          Newest on the left. A spine&apos;s width is its story&apos;s length.
        </p>
      </div>
      <div ref={slide} aria-live="polite" className="scroll-mt-5">
        {slides[picked]}
      </div>
    </div>
  );
}
