"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SidebarContent, useSidebar } from "@/components/ui/sidebar";
import type { SidebarGroupKey } from "@/lib/sidebar";
import { cn } from "@/lib/utils";
import { SidebarGroupView } from "@/components/shell/sidebar-group-view";
import { SidebarMain } from "@/components/shell/sidebar-main";
import type { SidebarNavModel } from "@/components/shell/sidebar-page";

const SLIDE = "duration-320 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none";

// The sidebar's two views side by side: the main view and one group's
// pages. Opening a group slides the track over; the sidebar stays in the
// group while the member moves between its pages, and goes back to the main
// view when they land anywhere else. A page load always starts on the main
// view (the state lives only in this component).
export function SidebarBrowse({ nav }: { nav: SidebarNavModel }) {
  const pathname = usePathname();
  const { state, isMobile, setOpen: setExpanded } = useSidebar();
  const [open, setOpen] = useState<SidebarGroupKey | null>(null);
  // The group last opened stays drawn while the track slides back.
  const [shown, setShown] = useState<SidebarGroupKey | null>(null);
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    if (open && nav.current?.group !== open) setOpen(null);
  }

  // Collapsed to the rail there is no room for a group's view.
  const railed = state === "collapsed" && !isMobile;
  const group = nav.groups.find((g) => g.key === (railed ? null : open)) ?? null;
  const drawn = nav.groups.find((g) => g.key === shown) ?? null;

  // Focus follows the slide: into the group's back link, and back to the
  // group's row on the way out. Skipped on the first render. preventScroll:
  // the target is still off to the side mid-slide, and scrolling the
  // clipped track to it would knock the slide off by a pane.
  const backRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<SidebarGroupKey | null>(null);
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    if (group) backRef.current?.focus({ preventScroll: true });
    else
      mainRef.current
        ?.querySelector<HTMLElement>(`[data-group="${lastFocus.current}"] button`)
        ?.focus({ preventScroll: true });
  }, [group]);

  const openGroup = (key: SidebarGroupKey) => {
    // On the rail a group widens the sidebar first.
    if (railed) setExpanded(true);
    lastFocus.current = key;
    moved.current = true;
    setShown(key);
    setOpen(key);
  };
  const back = () => {
    moved.current = true;
    setOpen(null);
  };

  return (
    <SidebarContent className="overflow-hidden">
      <div className={cn("flex h-full w-[200%] transition-transform", SLIDE, group && "-translate-x-1/2")}>
        <div
          ref={mainRef}
          inert={!!group}
          className={cn("no-scrollbar h-full w-1/2 overflow-y-auto transition-opacity", SLIDE, group && "opacity-0")}
        >
          <SidebarMain nav={nav} openGroup={group?.key ?? null} onOpenGroup={openGroup} />
        </div>
        <div
          inert={!group}
          onKeyDown={(e) => e.key === "Escape" && back()}
          className={cn("no-scrollbar h-full w-1/2 overflow-y-auto transition-opacity", SLIDE, !group && "opacity-0")}
        >
          {drawn && <SidebarGroupView group={drawn} nav={nav} backRef={backRef} onBack={back} />}
        </div>
      </div>
    </SidebarContent>
  );
}
