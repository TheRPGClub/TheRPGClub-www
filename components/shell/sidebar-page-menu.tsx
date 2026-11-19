import { useId } from "react";
import { ArrowDown, ArrowUp, Pin, PinOff, type LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import type { SidebarPage } from "@/lib/sidebar";
import { pageMenuItems, type PageMenuAction } from "@/lib/pinned-pages";
import { pageLabel, type SidebarNavModel } from "@/components/shell/sidebar-page";

const ICON: Record<PageMenuAction, LucideIcon> = {
  pin: Pin,
  unpin: PinOff,
  "move-up": ArrowUp,
  "move-down": ArrowDown,
};

// The small menu a long press (touch, www#136) or Shift+F10 / the menu key
// (www#137) opens on a page's row, under the row: the page's name, then Pin
// to sidebar or Unpin, and on a Pinned row (`reorder`) Move up and Move
// down. At the limit Pin to sidebar is disabled with the full-list message
// under it. Its items come from `pageMenuItems`; each action is a case here.
export function SidebarPageMenu({
  page,
  nav,
  anchor,
  reorder,
  open,
  onOpenChange,
  finalFocus,
}: {
  page: SidebarPage;
  nav: SidebarNavModel;
  anchor: React.RefObject<HTMLElement | null>;
  reorder: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Where focus goes when the menu closes (the row, when the keyboard opened it).
  finalFocus: () => HTMLElement | true;
}) {
  const hintId = useId();
  const run = (action: PageMenuAction) => {
    switch (action) {
      case "pin":
      case "unpin":
        return nav.pins.toggle(page.key);
      case "move-up":
        return nav.pins.move(page.key, -1);
      case "move-down":
        return nav.pins.move(page.key, 1);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuContent anchor={anchor} finalFocus={finalFocus} align="start" sideOffset={2} className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{pageLabel(page, nav.votingPhase)}</DropdownMenuLabel>
          {pageMenuItems(nav.pins.keys, page.key, { reorder }).map((item) => {
            const Icon = ICON[item.action];
            return (
              <div key={item.action}>
                <DropdownMenuItem
                  disabled={item.disabled}
                  aria-describedby={item.hint ? hintId : undefined}
                  onClick={() => run(item.action)}
                  className="items-center py-2.5 [&_svg]:size-4"
                >
                  <Icon aria-hidden />
                  {item.label}
                </DropdownMenuItem>
                {item.hint && (
                  <p id={hintId} className="max-w-52 px-2 pb-1.5 text-[0.78rem] leading-snug text-faint-foreground">
                    {item.hint}
                  </p>
                )}
              </div>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
