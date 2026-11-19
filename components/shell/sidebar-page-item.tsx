import { useLayoutEffect, useRef, useState } from "react";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { SidebarPage } from "@/lib/sidebar";
import { useLongPress } from "@/hooks/use-long-press";
import type { PinDragRow } from "@/hooks/use-pin-drag";
import type { SidebarNavModel } from "@/components/shell/sidebar-page";
import { SidebarPageMenu } from "@/components/shell/sidebar-page-menu";

// The keys that open a row's menu from the keyboard, for `aria-keyshortcuts`
// on the row's link. The menu key (ContextMenu) does too.
export const ROW_MENU_KEYS = "Shift+F10";

const opensMenu = (e: React.KeyboardEvent) => e.key === "ContextMenu" || (e.shiftKey && e.key === "F10");

// A page's row in the sidebar (a group's entry or a Pinned row). With
// `pressable`, a long press on a touchscreen or Shift+F10 / the menu key
// opens the row's menu; a tap still follows the link. Off on the icon rail
// and its panel, where there is no pinning. A Pinned row passes `drag`: it
// can be dragged, shows the drop line, and its menu has Move up and down.
export function SidebarPageItem({
  page,
  nav,
  pressable,
  drag,
  children,
}: {
  page: SidebarPage;
  nav: SidebarNavModel;
  pressable: boolean;
  drag?: PinDragRow;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const [open, setOpen] = useState(false);
  // The keyboard opened the menu: focus goes back to the row's link.
  const byKey = useRef(false);
  const press = useLongPress(pressable, () => {
    byKey.current = false;
    setOpen(true);
  });
  // The lifting finger isn't a tap outside the menu it just opened.
  const change = (next: boolean) => {
    if (!next && press.held()) return;
    setOpen(next);
  };
  const link = () => ref.current?.querySelector<HTMLElement>("[data-slot=sidebar-menu-button]") ?? null;

  // A move re-inserts the row, which drops focus; keep it on the row.
  const at = nav.pins.keys.indexOf(page.key);
  useLayoutEffect(() => {
    if (!byKey.current || open) return;
    const active = document.activeElement;
    if (!active || active === document.body) link()?.focus({ preventScroll: true });
  }, [at, open]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
    if (!pressable || !opensMenu(e) || !e.currentTarget.contains(e.target as Node)) return;
    e.preventDefault();
    byKey.current = true;
    setOpen(true);
  };

  return (
    // No text selection or link preview under a holding finger.
    <SidebarMenuItem
      ref={ref}
      {...press.handlers}
      {...drag?.handlers}
      onKeyDown={onKeyDown}
      // The menu key's own context menu, after it opened this one.
      onContextMenu={(e) => {
        if (byKey.current && open) e.preventDefault();
        else if ("onContextMenu" in press.handlers) press.handlers.onContextMenu(e);
      }}
      className={cn("[-webkit-touch-callout:none] [@media(hover:none)]:select-none", drag?.dragging && "opacity-40")}
    >
      {children}
      {drag?.edge && (
        <span
          aria-hidden
          className={cn("pointer-events-none absolute inset-x-1 z-10 h-0.5 bg-highlight", drag.edge === "before" ? "-top-0.5" : "-bottom-0.5")}
        />
      )}
      {pressable && (
        <SidebarPageMenu
          page={page}
          nav={nav}
          anchor={ref}
          reorder={drag !== undefined}
          open={open}
          onOpenChange={change}
          finalFocus={() => (byKey.current ? (link() ?? true) : true)}
        />
      )}
    </SidebarMenuItem>
  );
}
