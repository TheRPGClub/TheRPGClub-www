"use client";

import { useState, type ReactNode } from "react";
import { Dices } from "lucide-react";
import { Button } from "@/components/ui/button";

// The Fun Fact panel's changing part: one Fun Fact at a time (drawn on the
// server, with its "Read the story"), and "Another one" to step to the next
// of the newest few. It only changes what the page shows: the Daily Fun
// Fact's queue never moves.
export function FactCycler({ slides }: { slides: { id: number; figure: ReactNode; story: ReactNode }[] }) {
  const [index, setIndex] = useState(0);
  const slide = slides[index % slides.length];
  return (
    <>
      <div aria-live="polite" key={slide.id} className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
        {slide.figure}
      </div>
      <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
        {slide.story}
        {slides.length > 1 && (
          <Button variant="ghost" className="flex-1 lg:flex-none" onClick={() => setIndex((i) => (i + 1) % slides.length)}>
            <Dices aria-hidden />
            Another one
          </Button>
        )}
      </div>
    </>
  );
}
