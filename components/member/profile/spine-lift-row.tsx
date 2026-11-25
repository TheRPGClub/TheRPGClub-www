"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// A shelf row that hangs a paper tag off the lifted spine: its hours, title
// and date (or platform). A spine lifts on hover or keyboard focus; on a
// phone the first tap lifts it (the tag stays until another tap or a
// scroll) and a second tap opens the game. Spines opt in with `lift`
// (Spine's data-lift-* attributes); the tag repeats what the spine already
// says to a screen reader, so it's hidden from one.

type Lifted = { el: HTMLElement; touch: boolean; hours: string; title: string; sub: string };

function spineOf(target: EventTarget | null, row: HTMLElement | null): HTMLElement | null {
  if (!(target instanceof Element) || !row) return null;
  const el = target.closest<HTMLElement>("[data-spine]");
  return el && row.contains(el) ? el : null;
}

function lift(el: HTMLElement, touch: boolean): Lifted {
  const { liftHours = "", liftTitle = "", liftSub = "" } = el.dataset;
  return { el, touch, hours: liftHours, title: liftTitle, sub: liftSub };
}

export function SpineLiftRow({ className, children }: { className: string; children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLDivElement>(null);
  const pointer = useRef("mouse");
  const [lifted, setLifted] = useState<Lifted | null>(null);

  // The lifted spine stands raised while its tag shows.
  useEffect(() => {
    if (!lifted) return;
    lifted.el.setAttribute("data-lifted", "");
    return () => lifted.el.removeAttribute("data-lifted");
  }, [lifted]);

  // A tapped spine's tag goes on a scroll or a tap anywhere else.
  useEffect(() => {
    if (!lifted?.touch) return;
    const clear = () => setLifted(null);
    const away = (e: PointerEvent) => {
      if (!spineOf(e.target, wrap.current)) clear();
    };
    window.addEventListener("scroll", clear, { passive: true });
    document.addEventListener("pointerdown", away);
    return () => {
      window.removeEventListener("scroll", clear);
      document.removeEventListener("pointerdown", away);
    };
  }, [lifted]);

  // Hang the tag over the spine's head, kept inside the shelf's width.
  useLayoutEffect(() => {
    const box = wrap.current;
    const paper = tag.current;
    if (!lifted || !box || !paper) return;
    const max = box.clientWidth - paper.offsetWidth;
    paper.style.left = `${Math.max(0, Math.min(lifted.el.offsetLeft - 4, max))}px`;
    paper.style.top = `${lifted.el.offsetTop - 26}px`;
  }, [lifted]);

  const hover = (target: EventTarget | null) => {
    const el = spineOf(target, wrap.current);
    if (el && el !== lifted?.el) setLifted(lift(el, false));
  };

  return (
    <div
      ref={wrap}
      className="relative flex min-w-0 flex-col"
      onPointerDown={(e) => {
        pointer.current = e.pointerType;
      }}
      onPointerOver={(e) => {
        if (e.pointerType !== "touch") hover(e.target);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "touch" && !lifted?.touch) setLifted(null);
      }}
      onFocus={(e) => {
        if (pointer.current !== "touch") hover(e.target);
      }}
      onBlur={(e) => {
        if (!lifted?.touch && !wrap.current?.contains(e.relatedTarget as Node | null)) setLifted(null);
      }}
      onClickCapture={(e) => {
        const touch = pointer.current === "touch";
        pointer.current = "mouse";
        const el = spineOf(e.target, wrap.current);
        if (!touch || !el || lifted?.el === el) return;
        e.preventDefault();
        setLifted(lift(el, true));
      }}
    >
      <div className={cn(className, "flex-1")}>{children}</div>
      {lifted && (
        <div
          ref={tag}
          aria-hidden
          className="pointer-events-none absolute z-20 max-w-60 -rotate-2 rounded-xs bg-foreground px-2.5 py-2 whitespace-nowrap text-background shadow-[0_12px_30px_rgb(0_0_0/0.5)] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150"
        >
          <b className="font-headline block text-2xl leading-[0.9] font-normal">{lifted.hours}</b>
          <small className="font-label mt-[3px] block truncate text-[0.68rem] leading-[1.3] font-extrabold tracking-[0.07em] text-[color-mix(in_oklab,var(--color-background)_72%,transparent)]">
            {lifted.title}
            {lifted.sub && (
              <>
                <br />
                {lifted.sub}
              </>
            )}
          </small>
        </div>
      )}
    </div>
  );
}
