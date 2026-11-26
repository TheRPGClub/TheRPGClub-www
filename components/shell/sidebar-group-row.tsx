import { ChevronRight } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import type { SidebarGroup } from "@/lib/sidebar";
import { GROUP_ICON, NAV_BUTTON_CLASS } from "@/components/shell/nav-items";
import { groupNew, pageLabel, votingOpen, type SidebarNavModel } from "@/components/shell/sidebar-page";
import { NewMark } from "@/components/patch-notes/new-mark";

// A Browse group's row: one 40px line that slides the sidebar over to the
// group's pages. On an unpinned page of the group it names that page and
// carries the red you-are-here marker; Play carries the yellow dot while
// the round is open, and Club the NEW chip while a Patch is unseen (on the
// icon rail, tucked under the icon).
export function SidebarGroupRow({
  group,
  nav,
  expanded,
  onOpen,
}: {
  group: SidebarGroup;
  nav: SidebarNavModel;
  expanded: boolean;
  onOpen: () => void;
}) {
  const Icon = GROUP_ICON[group.key];
  const { current } = nav;
  const here =
    current && current.group === group.key && !nav.pinned.some((p) => p.key === current.key)
      ? current
      : null;
  const dot = group.key === "play" && votingOpen(nav.votingPhase);
  const fresh = groupNew(group, nav);

  return (
    <SidebarMenuItem data-group={group.key}>
      {here && <span aria-hidden className="absolute inset-y-2 -left-2 w-[3px] bg-gotm" />}
      <SidebarMenuButton
        variant="group"
        onClick={onOpen}
        aria-expanded={expanded}
        tooltip={fresh ? `${group.label} (new Patch Notes)` : group.label}
        className={NAV_BUTTON_CLASS}
      >
        <Icon />
        <span>{group.label}</span>
        <span className="ml-auto min-w-0 truncate pt-px font-label text-[0.875rem] tracking-[0.03em] text-foreground group-data-[collapsible=icon]:hidden">
          {here ? pageLabel(here, nav.votingPhase) : null}
        </span>
        {fresh && (
          <NewMark
            size="nav"
            label="(new Patch Notes)"
            rail
            className="group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:bottom-0 group-data-[collapsible=icon]:left-1/2 group-data-[collapsible=icon]:-translate-x-1/2 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:text-[0.6875rem]"
          />
        )}
        <ChevronRight className="text-faint-foreground transition-transform duration-200 group-hover/menu-button:translate-x-0.5 group-data-[collapsible=icon]:hidden motion-reduce:transition-none" />
        {dot && (
          <>
            <span className="sr-only">(round open)</span>
            <span
              aria-hidden
              className="absolute top-[7px] left-[19px] size-2 rounded-full bg-highlight ring-2 ring-sidebar"
            />
          </>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
