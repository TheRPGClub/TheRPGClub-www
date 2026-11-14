"use client";

import { Pause, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SLIDE_SECONDS, type useSlideshow } from "@/hooks/use-slideshow";
import { cn } from "@/lib/utils";

// The slideshow's foot: a labelled tick per slide that fills as its slide
// runs, and the pause control (first in tab order, drawn last). The ticks are
// tabs (the arrows move between them and the slides follow) and jump links
// before the script loads. On a phone the ticks drop their labels and the
// current slide's name and place show above.

export function SlideTicks({
  labels,
  slideId,
  show,
}: {
  labels: string[];
  slideId: (index: number) => string;
  show: ReturnType<typeof useSlideshow>;
}) {
  const { selected, reduced, paused, timing, run, goTo, togglePaused } = show;
  return (
    <div className="absolute inset-x-4 bottom-4 z-10 sm:inset-x-10 sm:bottom-9">
      <p aria-hidden className="font-label mb-1.5 flex items-center gap-2 text-sm text-foreground sm:hidden">
        {labels[selected]}
        <Badge tone="secondary">
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
        <Tabs
          value={selected}
          onValueChange={(index) => goTo(index as number)}
          className="block flex-1"
        >
          <TabsList
            variant="ticks"
            activateOnFocus
            aria-label="Why join"
            // The arrows move between ticks (and so the slides): keep them
            // from the carousel, which would move the slides a second time.
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft" || event.key === "ArrowRight") event.stopPropagation();
            }}
            className="grid w-auto grid-cols-6 gap-2 p-0 group-data-horizontal/tabs:h-auto sm:gap-3.5"
          >
            {labels.map((label, index) => {
              const current = index === selected;
              return (
                <TabsTrigger
                  key={label}
                  value={index}
                  nativeButton={false}
                  // A jump link to its slide before the script loads.
                  render={<a href={`#${slideId(index)}`} />}
                  aria-controls={slideId(index)}
                  onClick={(event) => {
                    event.preventDefault();
                    goTo(index);
                  }}
                  className="block h-auto flex-initial border-0 px-0 py-2.5 text-[0.85rem] leading-tight whitespace-normal transition-colors after:hidden sm:pt-0 sm:pb-0"
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
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
