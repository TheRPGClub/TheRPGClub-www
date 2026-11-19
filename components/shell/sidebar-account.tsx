"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { discordAvatarUrl, type SessionPrincipal } from "@/lib/auth-types";
import { signOut } from "@/app/actions/auth";
import { NAV_BUTTON_CLASS, SETTINGS_HREF, isCurrent } from "@/components/shell/nav-items";

// The sidebar's foot: the member's own settings (never flagged, so every
// signed-in member has it), their profile and sign-out.
export function SidebarAccount({ principal }: { principal: SessionPrincipal }) {
  const pathname = usePathname();
  const displayName = principal.global_name ?? principal.username;
  const avatarUrl = discordAvatarUrl(principal.discord_id, principal.avatar, 64);
  // Member pages are keyed by Discord id, the same id the owner checks use.
  const profileHref = `/members/${principal.discord_id}`;

  return (
    <SidebarFooter className="border-t">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link href={SETTINGS_HREF} />}
            isActive={isCurrent(pathname, SETTINGS_HREF)}
            tooltip="Settings"
            className={NAV_BUTTON_CLASS}
          >
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <div className="flex h-12 items-center gap-2 px-2">
            {/* A fixed 48px row, with px-2 centering the avatar on the icon
                rail: the name and sign-out folding away don't move it.
                The avatar and name open the viewer's own member page, where
                their lists, imports and profile edit live. Sign-out stays a
                sibling because a form can't nest inside a link. */}
            <Link
              href={profileHref}
              title="Your profile"
              aria-current={isCurrent(pathname, profileHref) ? "page" : undefined}
              className="-m-1 flex min-w-0 flex-1 items-center gap-2 rounded-md p-1 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-hidden aria-[current=page]:bg-sidebar-accent"
            >
              <Avatar size="sm">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback>{displayName[0]?.toUpperCase() ?? "?"}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">{displayName}</span>
                {principal.global_name && (
                  <span className="truncate text-xs text-faint-foreground">
                    @{principal.username}
                  </span>
                )}
              </div>
            </Link>
            <form action={signOut} className="group-data-[collapsible=icon]:hidden">
              <Button
                type="submit"
                variant="sidebar-action"
                size="icon"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
