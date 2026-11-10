import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/issue/page-header";
import { MemberAvatar } from "@/components/issue/member-cover";
import {
  MEMBER_LISTS,
  memberListHref,
  type MemberCounts,
  type MemberListKey,
} from "@/components/member/member-lists";
import { getFeatures } from "@/lib/session";
import type { FeatureKey } from "@/lib/features";
import { PreviewBadge } from "@/components/feature/preview-badge";
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
  // The Feature this page belongs to, for the staff Preview badge; defaults
  // to the current list's.
  feature?: FeatureKey;
  children: ReactNode;
}

// The frame every member sub-page shares (the top bar carries the trail): the
// member's name with a switcher across their lists, then the page title on the paper rule
// with its actions. The switcher leaves out lists whose Feature this viewer
// isn't shown, except the one being read (a list hidden by preference still
// opens from a link). Not-found when the page's Feature flag hides it.
export async function MemberListShell({
  userId,
  displayName,
  title,
  count,
  countNoun = ["game", "games"],
  action,
  current,
  counts,
  feature,
  children,
}: MemberListShellProps) {
  const features = await getFeatures();
  const lists = MEMBER_LISTS.filter(
    (l) => l.key === current || !l.feature || features.shown(l.feature),
  );
  const pageFeature =
    feature ?? MEMBER_LISTS.find((l) => l.key === current)?.feature;
  // The page's own Feature check (see requireFeature): its segment layout
  // doesn't re-run on a soft navigation inside the member's pages.
  if (pageFeature && !features.canOpen(pageFeature)) notFound();
  return (
    <div className="space-y-6">
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
              {lists.map((list) => {
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
          badge={pageFeature && features.preview(pageFeature) && <PreviewBadge />}
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
