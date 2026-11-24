"use client";

import { useEffect } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShelfOrder } from "@/hooks/use-shelf-order";
import { liftLine } from "@/lib/shelf-forms/manage";

// The bar while an entry is picked up (spec api#451, pick 3A): where it is
// going, then Earlier, Later, Put it here and Cancel. It is how touch,
// keyboards and screen readers move an entry; the arrow keys step it, Enter
// puts it down and Esc puts it back.
export function LiftBar({
  order,
  title,
}: {
  order: ShelfOrder;
  title: string;
}) {
  const { places } = order;
  useKeys(order);
  if (!places) return null;
  return (
    <div
      role="group"
      aria-label={`Moving ${title}`}
      className="sticky top-2 z-20 flex flex-wrap items-center gap-x-2.5 gap-y-2 rounded-sm bg-card px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--color-highlight),0_10px_24px_rgb(0_0_0/0.45)]"
    >
      <p
        role="status"
        className="flex min-w-0 flex-wrap items-baseline gap-x-2.5 text-sm text-dim-foreground"
      >
        Moving
        <b className="font-headline text-[1.2rem] leading-none font-normal text-foreground uppercase">
          {title}
        </b>
        {liftLine(places.from, places.to)}
      </p>
      <div className="ml-auto flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => order.step(-1)}
          disabled={order.atStart}
        >
          <ArrowLeft data-icon="inline-start" aria-hidden />
          Earlier
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => order.step(1)}
          disabled={order.atEnd}
        >
          <ArrowRight data-icon="inline-start" aria-hidden />
          Later
        </Button>
        <Button type="button" size="sm" variant="highlight" onClick={order.put}>
          <Check data-icon="inline-start" aria-hidden />
          Put it here
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={order.cancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// Arrow keys step the lifted entry, Enter puts it down, Esc puts it back,
// unless the key is meant for a field or a button.
function useKeys(order: ShelfOrder) {
  const lifted = order.lifted !== null;
  const { step, put, cancel } = order;
  useEffect(() => {
    if (!lifted) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable]")) return;
      // Enter on a button presses that button.
      if (event.key === "Enter" && target?.closest("button, a")) return;
      const act = {
        ArrowLeft: () => step(-1),
        ArrowUp: () => step(-1),
        ArrowRight: () => step(1),
        ArrowDown: () => step(1),
        Escape: cancel,
        Enter: put,
      }[event.key];
      if (!act) return;
      event.preventDefault();
      act();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lifted, step, put, cancel]);
}
