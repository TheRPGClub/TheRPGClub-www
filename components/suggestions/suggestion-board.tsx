import type { ReactNode } from "react";
import { MessageSquarePlus, Pin } from "lucide-react";
import type { BoardData } from "@/lib/suggestion-board";
import { PageHeader } from "@/components/templates/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { BoardKey } from "./board-key";
import { BoardList } from "./board-list";
import { BoardTabList } from "./board-tab-list";

// The Suggestion Board: Suggestions pinned to a wall, most upvoted first.
// Open shows Pending and Approved (Done is the stamp on an Approved card
// whose issue is closed); Rejected sits on its own tab with each reason.
export function SuggestionBoard({
  board,
  viewerId,
  canVote,
  pinned,
  badge,
}: {
  board: BoardData;
  viewerId: string;
  // Members role holders and staff can suggest and upvote.
  canVote: boolean;
  pinned: number;
  badge: ReactNode;
}) {
  const { tab } = board;
  const total = tab === "open" ? board.openTotal : board.rejectedTotal;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Suggestion Board"
        badge={badge}
        count={board.rows ? `${total} ${tab === "open" ? "open" : "rejected"}` : undefined}
        actions={
          canVote && (
            <ButtonLink href="/suggestions/new" variant="highlight">
              <MessageSquarePlus aria-hidden />
              Suggest something
            </ButtonLink>
          )
        }
      />

      <Tabs value={tab} className="block space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <BoardTabList tab={tab} openTotal={board.openTotal} rejectedTotal={board.rejectedTotal} />
          <BoardKey tab={tab} />
        </div>

        {!canVote && tab === "open" && (
          <p className="text-sm text-faint-foreground">
            Only Members role holders and staff can suggest and upvote. If you think your role is
            out of date, sign out and back in to refresh it from Discord.
          </p>
        )}

        {tab === "open" && board.pinnedIsViewersPending && (
          <p
            role="status"
            className="inline-flex items-center gap-2.5 rounded-md bg-highlight px-3.5 py-2.5 text-[0.92rem] font-semibold text-highlight-foreground shadow-[0_12px_30px_rgb(0_0_0/0.5)]"
          >
            <Pin aria-hidden className="size-[18px]" />
            Pinned. Your Suggestion is Pending.
          </p>
        )}

        <TabsContent value={tab} className="text-base">
          <BoardList
            tab={tab}
            rows={board.rows}
            viewerId={viewerId}
            canVote={canVote}
            pinned={pinned}
            reviewers={board.reviewers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
