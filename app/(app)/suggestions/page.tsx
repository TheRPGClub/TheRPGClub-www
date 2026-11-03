import type { CSSProperties } from "react";
import Link from "next/link";
import { MessageSquarePlus, Pin } from "lucide-react";
import { fetchMemberNames, fetchSuggestions } from "@/lib/api/suggestions";
import { requireAuth } from "@/lib/session";
import { PHASE_INK, byReviewedDesc, canSuggest } from "@/lib/suggestions";
import { PageHeader } from "@/components/issue/page-header";
import { BoardCard } from "@/components/suggestions/board-card";
import { SuggestionCard } from "@/components/suggestions/suggestion-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The Suggestion Board: Suggestions pinned to a wall, most upvoted first.
// Open shows Pending and Approved (Done is the stamp on an Approved card
// whose issue is closed); Rejected sits on its own tab with each reason.

type Tab = "open" | "rejected";

const KEY = [
  { ink: PHASE_INK.pending, label: "Pending" },
  { ink: PHASE_INK.approved, label: "Approved, issue open" },
  { ink: PHASE_INK.done, label: "Done" },
] as const;

const TAB_CLASS =
  "font-label inline-flex h-9 items-center gap-2 rounded-t-sm px-3.5 text-[0.95rem] font-extrabold transition-colors";

export default async function SuggestionBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; pinned?: string }>;
}) {
  const session = await requireAuth();
  const { tab: rawTab, pinned: rawPinned } = await searchParams;
  const tab: Tab = rawTab === "rejected" ? "rejected" : "open";
  const pinned = Number(rawPinned);
  const viewerId = session.principal.discord_id;
  const canVote = canSuggest(session.membership);

  const [open, rejected] = await Promise.all([
    fetchSuggestions(["pending", "approved"], tab === "open" ? undefined : 1),
    fetchSuggestions(["rejected"], tab === "rejected" ? undefined : 1),
  ]);
  const shown = tab === "open" ? open : rejected;
  // The banner after a submit: only for the viewer's own, still Pending one.
  const pinnedIsViewersPending = !!open?.rows.some(
    (s) =>
      s.suggestion_id === pinned &&
      s.created_by === viewerId &&
      s.status === "pending",
  );
  const reviewers =
    tab === "rejected" && rejected
      ? await fetchMemberNames(rejected.rows.map((s) => s.reviewed_by))
      : new Map<string, string>();

  const tabs: { key: Tab; label: string; count?: number; href: string }[] = [
    { key: "open", label: "Open", count: open?.total, href: "/suggestions" },
    {
      key: "rejected",
      label: "Rejected",
      count: rejected?.total,
      href: "/suggestions?tab=rejected",
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Suggestion Board"
        count={
          shown ? `${shown.total} ${tab === "open" ? "open" : "rejected"}` : undefined
        }
        actions={
          canVote && (
            <Link
              href="/suggestions/new"
              className={buttonVariants({ variant: "highlight" })}
            >
              <MessageSquarePlus aria-hidden />
              Suggest something
            </Link>
          )
        }
      />

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <nav aria-label="Suggestion Board tabs" className="flex gap-1">
          {tabs.map((t) => {
            const active = t.key === tab;
            return (
              <Link
                key={t.key}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  TAB_CLASS,
                  active
                    ? "bg-ink-2 text-paper shadow-[inset_0_2px_0_var(--color-paper)]"
                    : "bg-ink-3 text-paper-mute hover:text-paper",
                )}
              >
                {t.label}
                {t.count != null && (
                  <span
                    className={cn(
                      "font-bold",
                      active ? "text-paper-dim" : "text-paper-mute",
                    )}
                  >
                    {t.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        {tab === "open" ? (
          <ul className="font-label flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[0.8rem] text-paper-dim">
            {KEY.map((k) => (
              <li key={k.label} className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  style={{ background: k.ink } as CSSProperties}
                  className="size-3 rounded-xs"
                />
                {k.label}
              </li>
            ))}
            <li className="text-paper-mute">Most upvoted first</li>
          </ul>
        ) : (
          <p className="text-[0.82rem] text-paper-mute">
            Newest first. Each one carries the reason it was turned down.
          </p>
        )}
      </div>

      {!canVote && tab === "open" && (
        <p className="text-sm text-paper-mute">
          Only Members role holders and staff can suggest and upvote. If you
          think your role is out of date, sign out and back in to refresh it
          from Discord.
        </p>
      )}

      {tab === "open" && pinnedIsViewersPending && (
        <p
          role="status"
          className="inline-flex items-center gap-2.5 rounded-md bg-highlight px-3.5 py-2.5 text-[0.92rem] font-semibold text-ink shadow-[0_12px_30px_rgb(0_0_0/0.5)]"
        >
          <Pin aria-hidden className="size-[18px]" />
          Pinned. Your Suggestion is Pending.
        </p>
      )}

      {shown === null ? (
        <p role="alert" className="text-destructive">
          {"Couldn't load the Suggestions. Refresh to try again."}
        </p>
      ) : shown.rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-rule-strong px-4 py-6 text-paper-mute">
          {tab === "open"
            ? "Nothing on the board yet."
            : "No Suggestions have been rejected."}
        </p>
      ) : tab === "open" ? (
        <ul className="grid items-start gap-x-[22px] gap-y-6 pt-2 sm:grid-cols-2 xl:grid-cols-3">
          {shown.rows.map((s) => (
            <li key={s.suggestion_id}>
              <BoardCard
                suggestion={s}
                viewerId={viewerId}
                canVote={canVote}
                highlight={s.suggestion_id === pinned}
              />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid items-start gap-x-7 gap-y-8 pt-2 lg:grid-cols-2">
          {[...shown.rows].sort(byReviewedDesc).map((s) => (
            <li key={s.suggestion_id}>
              <SuggestionCard
                suggestion={s}
                reviewerName={s.reviewed_by ? reviewers.get(s.reviewed_by) : null}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
