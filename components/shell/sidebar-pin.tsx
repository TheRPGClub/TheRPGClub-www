import { Pin, PinOff } from "lucide-react";
import { SidebarMenuAction } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SidebarPage } from "@/lib/sidebar";
import { pinsFullMessage } from "@/lib/pinned-pages";
import { cn } from "@/lib/utils";
import {
  pageLabel,
  type SidebarNavModel,
} from "@/components/shell/sidebar-page";

// The pin beside a group's entry, shown on hover or keyboard focus: grey to
// pin, yellow while pinned (pressing it unpins). With no room left an unpinned
// page's pin is disabled and says why; nothing is dropped. Centered on the
// entry, or on its note line when badges hold the right of its name.
export function EntryPin({
  page,
  nav,
  badged,
}: {
  page: SidebarPage;
  nav: SidebarNavModel;
  badged: boolean;
}) {
  const pinned = nav.pins.keys.includes(page.key);
  const blocked = !pinned && nav.pins.full;
  const name = pageLabel(page, nav.votingPhase);
  const full = pinsFullMessage(nav.pins.rules);
  const tip = blocked ? full : pinned ? "Unpin" : "Pin to sidebar";
  return (
    <PinAction
      tip={tip}
      label={blocked ? full : `${pinned ? "Unpin" : "Pin"} ${name}`}
      pressed={pinned}
      blocked={blocked}
      onPress={() => nav.pins.toggle(page.key)}
      className={cn(
        "right-1.5 size-6.5",
        badged
          ? "bottom-1.5 peer-data-[size=default]/menu-button:top-auto"
          : "-translate-y-1/2 peer-data-[size=default]/menu-button:top-1/2",
      )}
    >
      <Pin />
    </PinAction>
  );
}

// The unpin beside a Pinned row, shown on hover or keyboard focus.
export function PinnedRowUnpin({
  page,
  nav,
}: {
  page: SidebarPage;
  nav: SidebarNavModel;
}) {
  return (
    <PinAction
      tip="Unpin"
      label={`Unpin ${pageLabel(page, nav.votingPhase)}`}
      onPress={() => nav.pins.toggle(page.key)}
      className="right-2 size-6 peer-data-[size=default]/menu-button:top-2"
    >
      <PinOff />
    </PinAction>
  );
}

function PinAction({
  tip,
  label,
  pressed,
  blocked = false,
  onPress,
  className,
  children,
}: {
  tip: string;
  label: string;
  // A toggle's state; undefined for a plain unpin.
  pressed?: boolean;
  blocked?: boolean;
  onPress: () => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <SidebarMenuAction
        showOnHover
        variant="pin"
        render={<TooltipTrigger />}
        aria-label={label}
        aria-pressed={pressed}
        aria-disabled={blocked || undefined}
        onClick={() => !blocked && onPress()}
        className={cn("[&>svg]:size-3.5", className)}
      >
        {children}
      </SidebarMenuAction>
      <TooltipContent side="right">{tip}</TooltipContent>
    </Tooltip>
  );
}
