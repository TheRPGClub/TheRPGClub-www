"use client";

import { useMemo } from "react";
import Link from "next/link";
import { LogOut, Settings, User, type LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { discordAvatarUrl, type SessionMembership, type SessionPrincipal } from "@/lib/auth-types";
import type { SessionFeature } from "@/lib/features";
import { sidebarGroups } from "@/lib/sidebar";
import { signOut } from "@/app/actions/auth";
import { PAGE_ICON, SETTINGS_HREF, TAB_CLASS } from "@/components/shell/nav-items";

const ITEM_CLASS = "gap-3 py-2.5 [&_svg]:mt-0.5 [&_svg]:size-[18px]";
const NAME_CLASS = "font-label text-[1.05rem] leading-tight font-bold tracking-[0.04em] uppercase";

function Entry({ href, icon: Icon, name, note }: { href: string; icon: LucideIcon; name: string; note: string }) {
  return (
    <DropdownMenuItem render={<Link href={href} />} className={ITEM_CLASS}>
      <Icon aria-hidden />
      <span className="grid min-w-0">
        <span className={NAME_CLASS}>{name}</span>
        <span className="truncate text-[0.8rem] text-faint-foreground">{note}</span>
      </span>
    </DropdownMenuItem>
  );
}

// The member's own corner on a phone, the tab bar's last tab ("You", their
// avatar; www#164): it opens their profile, Settings, the staff tools their
// role can use, and sign-out. On wider screens the sidebar's foot holds the
// same.
export function AccountMenu({
  principal,
  membership,
  features,
}: {
  principal: SessionPrincipal;
  membership: SessionMembership | null;
  features: SessionFeature[] | undefined;
}) {
  const staff = useMemo(
    () => sidebarGroups(features, membership).find((g) => g.key === "staff")?.pages ?? [],
    [features, membership],
  );
  const displayName = principal.global_name ?? principal.username;
  const avatarUrl = discordAvatarUrl(principal.discord_id, principal.avatar, 64);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="tab" size="bare" aria-label="Your account" className={TAB_CLASS} />}
      >
        <Avatar variant="tab" className="size-5.5">
          <AvatarImage src={avatarUrl} alt="" />
          <AvatarFallback>{displayName[0]?.toUpperCase() ?? "?"}</AvatarFallback>
        </Avatar>
        You
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" sideOffset={10} className="w-[min(18.5rem,calc(100vw-1.25rem))] pb-1.5">
        <div className="mx-2 mt-2 mb-1 flex items-center gap-3 border-b-2 border-foreground pb-2">
          <Avatar>
            <AvatarImage src={avatarUrl} alt="" />
            <AvatarFallback>{displayName[0]?.toUpperCase() ?? "?"}</AvatarFallback>
          </Avatar>
          <span className="grid min-w-0">
            <span className="font-headline truncate text-[1.5rem] leading-none uppercase">{displayName}</span>
            <span className="truncate text-[0.8rem] text-faint-foreground">@{principal.username}</span>
          </span>
        </div>
        <DropdownMenuGroup>
          <Entry href={`/members/${principal.discord_id}`} icon={User} name="Your profile" note="Lists, reviews and imports" />
          <Entry href={SETTINGS_HREF} icon={Settings} name="Settings" note="Features, birthday, news" />
        </DropdownMenuGroup>
        {staff.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="mt-1">Staff</DropdownMenuLabel>
            {staff.map((page) => (
              <Entry key={page.key} href={page.href} icon={PAGE_ICON[page.key]} name={page.label} note={page.note} />
            ))}
          </DropdownMenuGroup>
        )}
        <DropdownMenuItem onClick={() => void signOut()} className={ITEM_CLASS}>
          <LogOut aria-hidden className="text-destructive" />
          <span className={`${NAME_CLASS} text-destructive`}>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
