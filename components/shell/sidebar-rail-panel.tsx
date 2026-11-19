"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { SidebarGroup } from "@/lib/sidebar";
import { cn } from "@/lib/utils";
import { SidebarGroupView } from "@/components/shell/sidebar-group-view";
import type { SidebarNavModel } from "@/components/shell/sidebar-page";

const EASE = "ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none";

// On the icon rail, a group's pages slide out in a panel beside it, over a
// scrim on the page. Picking a page, Esc, or a click or focus anywhere
// outside closes it; a group's row on the rail toggles it (so those don't
// count as outside). Esc hands focus back to the group's row.
export function SidebarRailPanel({
  group,
  nav,
  onClose,
}: {
  group: SidebarGroup | null;
  nav: SidebarNavModel;
  onClose: (refocusRow: boolean) => void;
}) {
  // The group last opened stays drawn while the panel slides away.
  const [shown, setShown] = useState(group);
  if (group && group.key !== shown?.key) setShown(group);
  const ref = useRef<HTMLElement>(null);
  const key = group?.key ?? null;

  const close = useEffectEvent(() => onClose(false));
  useEffect(() => {
    if (!key) return;
    ref.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    const away = (e: PointerEvent) => {
      const target = e.target as Element;
      if (!ref.current?.contains(target) && !target.closest?.("[data-group]")) close();
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [key]);

  const outside = (el: EventTarget | null) =>
    el instanceof Element && !ref.current?.contains(el) && !el.closest("[data-group]");

  return (
    <>
      <div
        aria-hidden
        className={cn(
          "fixed inset-y-0 right-0 left-(--sidebar-width-icon) bg-background/60 transition-opacity duration-200",
          EASE,
          !group && "pointer-events-none opacity-0",
        )}
      />
      <nav
        ref={ref}
        aria-label={shown ? `${shown.label} pages` : undefined}
        inert={!group}
        onKeyDown={(e) => e.key === "Escape" && onClose(true)}
        onBlur={(e) => outside(e.relatedTarget) && onClose(false)}
        onClick={(e) => (e.target as Element).closest("a") && onClose(false)}
        className={cn(
          "no-scrollbar fixed inset-y-0 left-(--sidebar-width-icon) w-[19.5rem] overflow-y-auto border-r border-sidebar-border bg-sidebar px-1.5 pt-3.5 text-sidebar-foreground shadow-[24px_0_60px_rgb(0_0_0/0.6)] transition-[translate,opacity] duration-260",
          EASE,
          !group && "pointer-events-none -translate-x-3.5 opacity-0",
        )}
      >
        {shown && <SidebarGroupView group={shown} nav={nav} />}
      </nav>
    </>
  );
}
