"use client";

import Image from "next/image";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  discordAvatarUrl,
  type SessionMembership,
  type SessionPrincipal,
} from "@/lib/auth-types";
import { signOut } from "@/app/actions/auth";
import {
  LayoutDashboard,
  Library,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Vote,
} from "lucide-react";

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
  const { toggleSidebar } = useSidebar();
  const isAdmin = membership?.admin || membership?.moderator || membership?.dev;
  const displayName = principal.global_name ?? principal.username;
  const avatarUrl = discordAvatarUrl(
    principal.discord_id,
    principal.avatar,
    64,
  );

  return (
    <Sidebar collapsible="icon">
      {/* Extra top padding so the logo isn't crowded against the top edge. */}
      <SidebarHeader className="pt-4">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            {/* Collapsed rail: nothing but the logo fits, so it doubles as the
                expand control and reveals the panel icon on hover. */}
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="group/logo relative hidden size-8 shrink-0 items-center justify-center rounded-md transition-colors group-data-[collapsible=icon]:flex hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-hidden"
            >
              <Image
                src="/logo.png"
                alt=""
                width={32}
                height={32}
                className="size-8 transition-opacity group-hover/logo:opacity-0"
              />
              <PanelLeftOpen className="absolute size-4 opacity-0 transition-opacity group-hover/logo:opacity-100" />
            </button>

            {/* Expanded: logo and lettering are one branding link, with the
                collapse control alongside it rather than hidden on the logo. */}
            <Link
              href="/dashboard"
              className="flex min-w-0 flex-1 items-center gap-2 group-data-[collapsible=icon]:hidden"
            >
              <Image
                src="/logo.png"
                alt=""
                width={32}
                height={32}
                priority
                className="size-8 shrink-0"
              />
              <span className="truncate text-sm leading-tight font-semibold">
                The RPG Club
              </span>
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-hidden"
            >
              <PanelLeftClose className="size-4" />
            </button>
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
    </Sidebar>
  );
}
