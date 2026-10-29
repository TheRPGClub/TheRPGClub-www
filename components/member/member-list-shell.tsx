import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/issue/page-header";
import { MemberAvatar } from "@/components/issue/member-cover";
import {
  MEMBER_LISTS,
  memberListHref,
  type MemberCounts,
  type MemberListKey,
} from "@/components/member/member-lists";
import { cn } from "@/lib/utils";

export interface MemberListShellProps {
  userId: string;
  displayName: string;
  title: ReactNode;
  count?: number;
  // Unit for the count, e.g. "games" → "24 games".
  countNoun?: [singular: string, plural: string];
  action?: ReactNode;
  // The list switcher: which list this page is, and every list's size from
  // the profile payload. Pages outside the lists (imports) leave it off.
  current?: MemberListKey;
  counts?: MemberCounts;
  // Extra breadcrumb steps between the member and this page.
  trail?: { href: string; label: string }[];
  children: ReactNode;
}

// The frame every member sub-page shares: a breadcrumb, the member's name
// with a switcher across their lists, then the page title on the paper rule
// with its actions.
export function MemberListShell({
  userId,
  displayName,
  title,
  count,
  countNoun = ["game", "games"],
  action,
  current,
  counts,
  trail = [],
  children,
}: MemberListShellProps) {
  const crumbs = [
    { href: "/members", label: "Members" },
    { href: `/members/${userId}`, label: displayName },
    ...trail,
  ];
  const label =
    typeof title === "string"
      ? title
      : MEMBER_LISTS.find((l) => l.key === current)?.label;

  return (
    <div className="mx-auto w-full max-w-[90rem] space-y-6">
      <nav
        aria-label="Breadcrumb"
        className="font-label flex min-w-0 items-center gap-2 text-sm font-bold tracking-[0.08em] text-paper-mute"
      >
        {crumbs.map((crumb) => (
          <span key={crumb.href} className="flex min-w-0 items-center gap-2">
            <Link
              href={crumb.href}
              className="truncate transition-colors hover:text-paper"
            >
              {crumb.label}
            </Link>
            <span aria-hidden className="text-rule-strong">
              /
            </span>
          </span>
        ))}
        {label && (
          <span aria-current="page" className="truncate text-paper">
            {label}
          </span>
        )}
      </nav>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href={`/members/${userId}`}
            className="flex items-center gap-2.5 transition-colors hover:text-highlight"
          >
            <MemberAvatar
              userId={userId}
              name={displayName}
              className="size-8"
              fallbackClassName="text-lg"
            />
            <span className="font-headline text-2xl">{displayName}</span>
          </Link>
          {counts && (
            <ul aria-label="Lists" className="flex flex-wrap gap-0.5">
              {MEMBER_LISTS.map((list) => {
                const on = list.key === current;
                const n = counts[list.key];
                return (
                  <li key={list.key}>
                    <Link
                      href={memberListHref(userId, list.key)}
                      aria-current={on ? "page" : undefined}
                      className={cn(
                        "font-label inline-flex h-7.5 items-center gap-1.5 rounded-[3px] px-2 text-[0.88rem] font-extrabold tracking-[0.06em] transition-colors",
                        on
                          ? "bg-paper text-ink"
                          : "text-paper-mute hover:bg-ink-3 hover:text-paper",
                      )}
                    >
                      {list.label}
                      {n != null && (
                        <span className="font-headline text-[1.05rem] font-normal tracking-normal">
                          {n}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <PageHeader
          title={title}
          count={
            count != null
              ? `${count} ${count === 1 ? countNoun[0] : countNoun[1]}`
              : undefined
          }
          actions={action}
        />
      </div>

      {children}
    </div>
  );
}
