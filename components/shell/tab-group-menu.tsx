"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { VotingPhase } from "@/lib/api/voting-round";
import type { SidebarGroup, SidebarPage } from "@/lib/sidebar";
import { cn } from "@/lib/utils";
import { GROUP_ICON, PAGE_ICON, TAB_CLASS } from "@/components/shell/nav-items";
import { pageLabel, votingOpen } from "@/components/shell/sidebar-page";
import { NavBadge } from "@/components/feature/preview-badge";
import { NewMark } from "@/components/patch-notes/new-mark";

// A Browse group's tab. A tap pops up a card above the bar: the group's name
// in the headline face over the paper rule, then its pages as entries, each
// an icon, its name and its one-line note, as in the sidebar's group view.
// The current page's entry is masthead red; picking one follows the link.
// While a Patch is unseen, Patch Notes' entry and its group's tab wear NEW
// (www#238).
export function TabGroupMenu({
  group,
  current,
  votingPhase,
  patchUnseen = false,
}: {
  group: SidebarGroup;
  current: SidebarPage | null;
  votingPhase: VotingPhase | null;
  patchUnseen?: boolean;
}) {
  const Icon = GROUP_ICON[group.key];
  const here = current?.group === group.key;
  const isNew = (page: SidebarPage) => patchUnseen && page.key === "patch_notes";
  const fresh = group.pages.some(isNew);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="tab" size="bare" data-current={here || undefined} className={cn(TAB_CLASS, "relative")} />}
      >
        <Icon aria-hidden />
        {group.label}
        {fresh && (
          <NewMark size="nav" label="(new Patch Notes)" className="absolute top-1 left-1/2 ml-2.5 bg-sidebar px-1" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="center" sideOffset={10} className="w-[min(24rem,calc(100vw-1.25rem))] pb-1.5">
        <DropdownMenuGroup>
          <p className="font-headline mx-2 mt-2 mb-1 border-b-2 border-foreground pb-1.5 text-[1.75rem] leading-none uppercase">
            {group.label}
          </p>
          {group.pages.map((page) => {
            const PageIcon = PAGE_ICON[page.key];
            const on = current?.key === page.key;
            return (
              <DropdownMenuItem
                key={page.key}
                render={<Link href={page.href} aria-current={on ? "page" : undefined} />}
                data-current={on || undefined}
                className="gap-3 py-2.5 [&_svg]:mt-0.5 [&_svg]:size-[18px]"
              >
                <PageIcon aria-hidden />
                <span className="grid min-w-0">
                  <span className="flex items-center gap-2 font-label text-[1.05rem] leading-tight font-bold tracking-[0.04em] uppercase">
                    {pageLabel(page, votingPhase)}
                    {page.key === "voting" && votingOpen(votingPhase) && <NavBadge>Open</NavBadge>}
                    {isNew(page) && <NewMark size="nav" />}
                  </span>
                  <span className="truncate text-[0.8rem] text-faint-foreground in-data-current:text-gotm-foreground/80">
                    {page.note}
                  </span>
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
