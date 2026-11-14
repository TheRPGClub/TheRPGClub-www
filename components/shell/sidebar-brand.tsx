"use client";

import Image from "next/image";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

// The sidebar's head: the club's mark, and the control that collapses the
// panel to its icon rail or expands it again.
export function SidebarBrand() {
  const { toggleSidebar } = useSidebar();

  return (
    // Extra top padding so the logo isn't crowded against the top edge.
    <SidebarHeader className="pt-4 pb-1">
      <SidebarMenu>
        <SidebarMenuItem className="flex items-center gap-2">
          {/* Collapsed rail: nothing but the logo fits, so it doubles as the
              expand control and reveals the panel icon on hover. */}
          <Button
            variant="sidebar-toggle"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="group/logo relative hidden group-data-[collapsible=icon]:flex"
          >
            <Image
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              className="size-8 transition-opacity group-hover/logo:opacity-0"
            />
            <PanelLeftOpen className="absolute size-4 opacity-0 transition-opacity group-hover/logo:opacity-100" />
          </Button>

          {/* Expanded: logo and lettering are one branding link, with the
              collapse control alongside it rather than hidden on the logo. */}
          <Link
            href="/dashboard"
            className="flex min-w-0 flex-1 items-center gap-2 group-data-[collapsible=icon]:hidden"
          >
            <Image
              src="/logo.png"
              alt=""
              width={40}
              height={40}
              priority
              className="size-10 shrink-0"
            />
            <span className="font-headline truncate pt-0.5 text-[1.35rem] leading-none tracking-[0.01em]">
              The <span className="text-gotm">RPG</span> Club
            </span>
          </Link>
          <Button
            variant="sidebar-toggle"
            size="icon-sm"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="group-data-[collapsible=icon]:hidden"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
