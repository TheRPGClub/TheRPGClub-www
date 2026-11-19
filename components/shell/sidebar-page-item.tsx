import { useRef, useState } from "react";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import type { SidebarPage } from "@/lib/sidebar";
import { useLongPress } from "@/hooks/use-long-press";
import type { SidebarNavModel } from "@/components/shell/sidebar-page";
import { SidebarPageMenu } from "@/components/shell/sidebar-page-menu";

// A page's row in the sidebar (a group's entry or a Pinned row). With
// `pressable`, a long press on a touchscreen opens the row's menu; a tap
// still follows the link. Off on the icon rail and its panel, where there
// is no pinning.
export function SidebarPageItem({
  page,
  nav,
  pressable,
  children,
}: {
  page: SidebarPage;
  nav: SidebarNavModel;
  pressable: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const [open, setOpen] = useState(false);
  const press = useLongPress(pressable, () => setOpen(true));
  // The lifting finger isn't a tap outside the menu it just opened.
  const change = (next: boolean) => {
    if (!next && press.held()) return;
    setOpen(next);
  };

  return (
    // No text selection or link preview under a holding finger.
    <SidebarMenuItem ref={ref} {...press.handlers} className="[-webkit-touch-callout:none] [@media(hover:none)]:select-none">
      {children}
      {pressable && (
        <SidebarPageMenu page={page} nav={nav} anchor={ref} open={open} onOpenChange={change} />
      )}
    </SidebarMenuItem>
  );
}
