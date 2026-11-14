"use client";

import { useEffect, useId, useRef } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { SlideTicks } from "@/components/join/slide-ticks";
import { useSlideshow } from "@/hooks/use-slideshow";
import { cn } from "@/lib/utils";

// The /join slideshow: the club's reasons to join, crossfading about every
// seven seconds under a row of labelled ticks. The pause control comes first
// in its tab order, the ticks are tabs (and jump links before the script
// loads), and the slides are not announced as they advance.

export interface JoinSlide {
  label: string;
  content: React.ReactNode;
}

export function JoinSlideshow({
  slides,
  className,
}: {
  slides: JoinSlide[];
  // Placement and size only.
  className?: string;
}) {
  const show = useSlideshow();
  const id = useId();
  const tabs = useRef<HTMLDivElement>(null);
  const slideId = (index: number) => `${id}-slide-${index + 1}`;

  // Keyboard on the ticks: the arrows move the slideshow (the carousel's own
  // keys), and focus follows the selected tick.
  useEffect(() => {
    const list = tabs.current;
    if (!list?.contains(document.activeElement)) return;
    list.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
  }, [show.selected]);

  return (
    <Carousel
      setApi={show.setApi}
      plugins={show.plugins}
      opts={{ loop: true }}
      aria-label="Why join the club"
      {...show.holdHandlers}
      className={cn("h-full [&>[data-slot=carousel-content]]:h-full", className)}
    >
      <SlideTicks
        ref={tabs}
        labels={slides.map((slide) => slide.label)}
        slideId={slideId}
        show={show}
      />
      <CarouselContent className="ml-0 h-full" aria-live={show.playing ? "off" : "polite"}>
        {slides.map((slide, index) => (
          <CarouselItem
            key={slide.label}
            id={slideId(index)}
            role="tabpanel"
            aria-label={`${index + 1} of ${slides.length}`}
            inert={index !== show.selected}
            className="relative isolate h-full pl-0"
          >
            {slide.content}
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
