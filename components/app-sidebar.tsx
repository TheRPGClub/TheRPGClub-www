"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  discordAvatarUrl,
  type SessionMembership,
  type SessionPrincipal,
} from "@/lib/auth-types";
import { signOut } from "@/app/actions/auth";
import { LayoutDashboard, Library, LogOut, Users, Vote } from "lucide-react";

const navMain = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/games", icon: Library, label: "Games" },
  { href: "/members", icon: Users, label: "Members" },
  { href: "/voting", icon: Vote, label: "Voting" },
];

interface AppSidebarProps {
  principal: SessionPrincipal;
  membership: SessionMembership | null;
}

export function AppSidebar({ principal, membership }: AppSidebarProps) {
  const pathname = usePathname();
  const isAdmin = membership?.admin || membership?.moderator || membership?.dev;
  const displayName = principal.global_name ?? principal.username;
  const avatarUrl = discordAvatarUrl(
    principal.discord_id,
    principal.avatar,
    64,
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">The RPG Club</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map(({ href, icon: Icon, label }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    render={<Link href={href} />}
                    isActive={
                      pathname === href || pathname.startsWith(href + "/")
                    }
                    tooltip={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-1 py-1.5">
              <Avatar size="sm">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback>
                  {displayName[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{displayName}</span>
                {principal.global_name && (
                  <span className="truncate text-xs text-muted-foreground">
                    @{principal.username}
                  </span>
                )}
              </div>
              <form
                action={signOut}
                className="group-data-[collapsible=icon]:hidden"
              >
                <button
                  type="submit"
                  title="Sign out"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
