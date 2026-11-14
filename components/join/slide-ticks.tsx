"use client";

import { Pause, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SLIDE_SECONDS, type useSlideshow } from "@/hooks/use-slideshow";
import { cn } from "@/lib/utils";

// The slideshow's foot: a labelled tick per slide that fills as its slide
// runs, and the pause control (first in tab order, drawn last). On a phone the
// ticks drop their labels and the current slide's name and place show above.

export function SlideTicks({
  ref,
  labels,
  slideId,
  show,
}: {
  ref: React.Ref<HTMLDivElement>;
  labels: string[];
  slideId: (index: number) => string;
  show: ReturnType<typeof useSlideshow>;
}) {
  const { selected, reduced, paused, timing, run, goTo, togglePaused } = show;
  return (
    <div className="absolute inset-x-4 bottom-4 z-10 sm:inset-x-10 sm:bottom-9">
      <p aria-hidden className="font-label mb-1.5 flex items-center gap-2 text-sm text-foreground sm:hidden">
        {labels[selected]}
        <Badge variant="secondary">
          {selected + 1} / {labels.length}
        </Badge>
      </p>
      <div className="flex items-end gap-3.5">
        {!reduced && (
          <Button
            variant="outline"
            size="icon-lg"
            onClick={togglePaused}
            aria-label={paused ? "Play the slideshow" : "Pause the slideshow"}
            className="order-last size-10"
          >
            {paused ? <Play /> : <Pause />}
          </Button>
        )}
        <div ref={ref} role="tablist" aria-label="Why join" className="grid flex-1 grid-cols-6 gap-2 sm:gap-3.5">
          {labels.map((label, index) => {
            const current = index === selected;
            return (
              <a
                key={label}
                href={`#${slideId(index)}`}
                role="tab"
                aria-selected={current}
                aria-controls={slideId(index)}
                tabIndex={current ? 0 : -1}
                onClick={(event) => {
                  event.preventDefault();
                  goTo(index);
                }}
                className={cn(
                  "font-label block py-2.5 text-[0.85rem] leading-tight tracking-[0.08em] text-faint-foreground transition-colors hover:text-foreground sm:pt-0 sm:pb-0",
                  current && "text-foreground",
                )}
              >
                <span
                  className={cn(
                    "relative block h-[3px] overflow-hidden sm:mb-2.5",
                    current ? "bg-faint-foreground" : "bg-border-strong",
                  )}
                >
                  {current && (
                    <span
                      key={run}
                      style={{ animationDuration: `${SLIDE_SECONDS}s`, animationPlayState: timing ? "running" : "paused" }}
                      className={cn(
                        "absolute inset-0 origin-left bg-primary",
                        reduced ? "scale-x-100" : "animate-[tick-fill_linear_both]",
                      )}
                    />
                  )}
                </span>
                <span className="max-sm:sr-only">{label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
