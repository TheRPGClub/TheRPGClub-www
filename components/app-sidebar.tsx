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
import type { VotingPhase } from "@/lib/api/voting-round";
import {
  LayoutDashboard,
  Library,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Trophy,
  Users,
  Vote,
} from "lucide-react";

const navMain = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/games", icon: Library, label: "Games" },
  { href: "/gotm", icon: Trophy, label: "GOTM history" },
  { href: "/members", icon: Users, label: "Members" },
  { href: "/voting", icon: Vote, label: "Voting" },
];

const VOTING_HREF = "/voting";

// The voting item is named for what the club is doing right now, so the nav
// says whether nominations or the vote are what's live without opening the
// page. Only the nomination window renames the item; a live vote, a finished
// round, and a missing or unreadable one all read as the section itself.
const PHASE_LABEL: Record<VotingPhase, string> = {
  nominating: "Nominations",
  voting: "Voting",
  closed: "Voting",
  tie: "Voting",
  decided: "Voting",
};

interface AppSidebarProps {
  principal: SessionPrincipal;
  membership: SessionMembership | null;
  // null when no round is scheduled or the read failed — the item keeps its
  // plain name rather than the nav breaking.
  votingPhase?: VotingPhase | null;
}

export function AppSidebar({
  principal,
  membership,
  votingPhase,
}: AppSidebarProps) {
  const pathname = usePathname();
  // Nominations or the vote are live: the club has open business, flagged
  // in the call-to-action yellow on the nav item itself.
  const votingOpen = votingPhase === "nominating" || votingPhase === "voting";
  const { toggleSidebar } = useSidebar();
  const isAdmin = membership?.admin || membership?.moderator || membership?.dev;
  const displayName = principal.global_name ?? principal.username;
  const avatarUrl = discordAvatarUrl(
    principal.discord_id,
    principal.avatar,
    64,
  );
  // Member pages are keyed by Discord id, the same id the owner checks use.
  const profileHref = `/members/${principal.discord_id}`;
  const onProfile =
    pathname === profileHref || pathname.startsWith(profileHref + "/");

  return (
    <Sidebar collapsible="icon">
      {/* Extra top padding so the logo isn't crowded against the top edge. */}
      <SidebarHeader className="pt-4 pb-1">
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
                width={40}
                height={40}
                priority
                className="size-10 shrink-0"
              />
              <span className="font-headline truncate pt-0.5 text-[1.35rem] leading-none tracking-[0.01em]">
                The <span className="text-gotm">RPG</span> Club
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
        <SidebarGroup className="pt-3">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navMain.map(({ href, icon: Icon, label: navLabel }) => {
                const label =
                  href === VOTING_HREF && votingPhase
                    ? PHASE_LABEL[votingPhase]
                    : navLabel;

                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      render={<Link href={href} />}
                      isActive={
                        pathname === href || pathname.startsWith(href + "/")
                      }
                      // Collapsed to the icon rail the label is the tooltip,
                      // so the phase reaches the reader there too.
                      tooltip={label}
                      className="font-label h-10 gap-3 rounded-sm px-2.5 text-[1.05rem] text-paper-dim hover:bg-ink-3 hover:text-paper data-active:bg-gotm data-active:font-bold data-active:text-white [&_svg]:size-[18px]"
                    >
                      <Icon />
                      <span>{label}</span>
                      {href === VOTING_HREF && votingOpen && (
                        <span className="font-label ml-auto rounded-xs bg-highlight px-1.5 py-px text-[0.7rem] font-extrabold text-ink group-data-[collapsible=icon]:hidden">
                          Open
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-rule">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-1 py-1.5">
              {/* The avatar and name open the viewer's own member page, where
                  their lists, imports and profile edit live. Sign-out stays a
                  sibling because a form can't nest inside a link. */}
              <Link
                href={profileHref}
                title="Your profile"
                aria-current={onProfile ? "page" : undefined}
                className="-m-1 flex min-w-0 flex-1 items-center gap-2 rounded-md p-1 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-hidden aria-[current=page]:bg-sidebar-accent"
              >
                <Avatar size="sm">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback>
                    {displayName[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">{displayName}</span>
                  {principal.global_name && (
                    <span className="truncate text-xs text-paper-mute">
                      @{principal.username}
                    </span>
                  )}
                </div>
              </Link>
              <form
                action={signOut}
                className="group-data-[collapsible=icon]:hidden"
              >
                <button
                  type="submit"
                  title="Sign out"
                  aria-label="Sign out"
                  className="grid size-8 place-items-center rounded-sm text-paper-mute transition-colors hover:bg-ink-3 hover:text-paper"
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
