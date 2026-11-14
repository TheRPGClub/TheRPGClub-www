"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { SessionMembership } from "@/lib/auth-types";
import { staffSectionsFor } from "@/lib/staff";
import { NAV_BUTTON_CLASS, STAFF_ICON, isCurrent } from "@/components/shell/nav-items";

// The /admin sections this member's role can use and the sidebar lists;
// none for most members (then nothing renders). The desk lists the rest.
export function SidebarStaffNav({ membership }: { membership: SessionMembership | null }) {
  const pathname = usePathname();
  const sections = staffSectionsFor(membership).filter((s) => s.nav);
  if (sections.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[0.78rem]">Staff</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {sections.map(({ key, href, label }) => {
            const Icon = STAFF_ICON[key] ?? ShieldCheck;
            return (
              <SidebarMenuItem key={key}>
                <SidebarMenuButton
                  render={<Link href={href} />}
                  // The overview is the section root: only its own path
                  // marks it, so a tool page doesn't light both items.
                  isActive={key === "overview" ? pathname === href : isCurrent(pathname, href)}
                  tooltip={label}
                  className={NAV_BUTTON_CLASS}
                >
                  <Icon />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
