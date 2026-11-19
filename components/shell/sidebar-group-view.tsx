import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import type { SidebarGroup } from "@/lib/sidebar";
import { PAGE_ICON } from "@/components/shell/nav-items";
import { PageBadges, hasBadges, pageLabel, type SidebarNavModel } from "@/components/shell/sidebar-page";
import { EntryPin } from "@/components/shell/sidebar-pin";

// A group's view, slid in beside the main one: the way back, the group's
// name on the paper rule, then each page with its one-line note.
export function SidebarGroupView({
  group,
  nav,
  backRef,
  onBack,
}: {
  group: SidebarGroup;
  nav: SidebarNavModel;
  backRef: React.Ref<HTMLButtonElement>;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col p-2">
      <Button
        ref={backRef}
        variant="sidebar-back"
        size="bare"
        onClick={onBack}
        className="items-center gap-1.5 self-start px-2 pt-2.5 pb-3.5 text-[0.8125rem] [&_svg]:transition-transform hover:[&_svg]:-translate-x-0.5"
      >
        <ArrowLeft className="size-[15px]" />
        All sections
      </Button>
      <h2 className="mx-2 font-headline text-[1.625rem] leading-none uppercase">{group.label}</h2>
      <div aria-hidden className="mx-2 mt-2 mb-2.5 h-0.5 bg-foreground" />
      <SidebarMenu className="gap-0.5">
        {group.pages.map((page) => {
          const Icon = PAGE_ICON[page.key];
          const label = pageLabel(page, nav.votingPhase);
          return (
            <SidebarMenuItem key={page.key}>
              <SidebarMenuButton
                variant="entry"
                render={<Link href={page.href} />}
                isActive={nav.current?.key === page.key}
                className="grid h-auto grid-cols-[18px_minmax(0,1fr)_auto] items-start gap-x-2.5 gap-y-px p-2 [&_svg]:size-[17px]"
              >
                <Icon className="mt-0.5 text-dim-foreground group-data-active/menu-button:text-gotm-foreground" />
                <span className="font-label text-[1.05rem] leading-[1.15] font-semibold text-foreground transition-colors [[data-slot=sidebar-menu-button]:hover:not([data-active])_&]:text-highlight group-data-active/menu-button:font-bold group-data-active/menu-button:text-gotm-foreground">
                  {label}
                </span>
                <PageBadges page={page} nav={nav} className="col-start-3 row-start-1 flex gap-1 self-center" />
                <span className="col-start-2 text-[0.78rem] leading-[1.3]">{page.note}</span>
              </SidebarMenuButton>
              <EntryPin page={page} nav={nav} badged={hasBadges(page, nav)} />
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </div>
  );
}
