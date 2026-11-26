"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { shelfScroll, shelfStep } from "@/lib/news-shelves";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// A shelf's sideways row: scrolls with snap on every width, and from `md`
// carries arrow buttons over the art's middle that move it by the cards in
// view. An arrow with nothing more to scroll is hidden and leaves the tab
// order (its focus moves to the other one). Arrows jump rather than glide
// under reduced motion.

export function NewsShelfScroller({ label, children }: { label: string; children: ReactNode }) {
  const row = useRef<HTMLUListElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [can, setCan] = useState({ prev: false, next: false });

  const measure = useCallback(() => {
    const el = row.current;
    if (!el) return;
    const state = shelfScroll(el.scrollLeft, el.scrollWidth, el.clientWidth);
    // Focus on an arrow that is about to hide goes to the other one.
    if (!state.next && document.activeElement === nextRef.current && state.prev) prevRef.current?.focus();
    if (!state.prev && document.activeElement === prevRef.current && state.next) nextRef.current?.focus();
    setCan((was) => (was.prev === state.prev && was.next === state.next ? was : state));
  }, []);

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  const move = (dir: -1 | 1) => {
    const el = row.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const card = first ? first.getBoundingClientRect().width + gap : 0;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * shelfStep(el.clientWidth, card), behavior: still ? "auto" : "smooth" });
  };

  return (
    <div className="relative">
      <ul
        ref={row}
        onScroll={measure}
        // Positioned, so what the cards place absolutely (the screen-reader
        // notes) scrolls and clips with them instead of widening the page.
        aria-label={label}
        className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      <Arrow side="prev" show={can.prev} label={`Earlier in ${label}`} onClick={() => move(-1)} buttonRef={prevRef} />
      <Arrow side="next" show={can.next} label={`More in ${label}`} onClick={() => move(1)} buttonRef={nextRef} />
    </div>
  );
}

function Arrow({
  side,
  show,
  label,
  onClick,
  buttonRef,
}: {
  side: "prev" | "next";
  show: boolean;
  label: string;
  onClick: () => void;
  buttonRef: React.Ref<HTMLButtonElement>;
}) {
  const Icon = side === "prev" ? ChevronLeft : ChevronRight;
  return (
    <div
      className={cn(
        // Centred on the 16:9 art (14.75rem wide, so 8.3rem tall).
        "absolute top-[4.15rem] z-10 hidden -translate-y-1/2 transition-opacity duration-150 md:block",
        side === "prev" ? "left-2" : "right-2",
        !show && "invisible opacity-0",
      )}
    >
      <Button ref={buttonRef} type="button" variant="scroll" size="icon-lg" aria-label={label} onClick={onClick}>
        <Icon aria-hidden className="size-5" />
      </Button>
    </div>
  );
}
