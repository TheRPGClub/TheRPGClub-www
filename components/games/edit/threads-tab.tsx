"use client";

import { MessageSquare, Undo2, Unlink, X } from "lucide-react";
import type { GameThreadRef, ThreadsStage } from "@/lib/games/game-edit";
import {
  stageThreadLink,
  stageThreadUnlink,
  threadPicked,
  threadsView,
  unstageThread,
} from "@/lib/games/game-edit/threads";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EditSection, StagedMark } from "@/components/games/edit/edit-section";
import { ThreadLinkSearch } from "@/components/games/edit/thread-link-search";

// The Game Threads tab (design www#156, round 3), the only one a Regular
// sees: the game's Discord threads, each with Unlink, and a search at the
// right to link another. Links show as Added and unlinks struck through as
// Unlinking, each with an undo, until Save all.
export function ThreadsTab({
  gameId,
  loaded,
  staged,
  error,
  onStage,
}: {
  gameId: number;
  loaded: GameThreadRef[];
  staged: ThreadsStage | undefined;
  error?: string;
  onStage: (next: ThreadsStage | undefined) => void;
}) {
  const rows = threadsView(loaded, staged);

  return (
    <EditSection
      title="Game Threads"
      error={error}
      actions={
        <ThreadLinkSearch
          gameId={gameId}
          picked={(id) => threadPicked(loaded, staged, id)}
          onPick={(thread) => onStage(stageThreadLink(loaded, staged, thread))}
        />
      }
    >
      {rows.length === 0 ? (
        <p className="py-6 text-[0.95rem] text-faint-foreground">No thread is linked to this game.</p>
      ) : (
        <ul aria-label="Game Threads">
          {rows.map((t) => (
            <li
              key={t.thread_id}
              className="grid grid-cols-[20px_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 border-b border-border py-2 sm:grid-cols-[20px_minmax(0,1fr)_auto]"
            >
              <MessageSquare aria-hidden className={cn("size-4.5 text-faint-foreground", t.mark === "unlinking" && "opacity-50")} />
              {t.jump_url && t.mark !== "unlinking" ? (
                <a href={t.jump_url} target="_blank" rel="noreferrer" className="truncate font-semibold hover:text-highlight">
                  {t.thread_name}
                </a>
              ) : (
                <span
                  className={cn(
                    "truncate font-semibold",
                    t.mark === "unlinking" &&
                      "text-faint-foreground line-through decoration-destructive decoration-[1.5px]",
                  )}
                >
                  {t.thread_name}
                </span>
              )}
              <div className="col-start-2 flex items-center gap-2.5 sm:col-start-3">
                {t.mark === "added" ? (
                  <>
                    <StagedMark kind="added">Added</StagedMark>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Don't link ${t.thread_name}`}
                      onClick={() => onStage(unstageThread(staged, t.thread_id))}
                    >
                      <X />
                    </Button>
                  </>
                ) : t.mark === "unlinking" ? (
                  <>
                    <StagedMark kind="removing">Unlinking</StagedMark>
                    <Button
                      variant="inline-link"
                      size="inline"
                      aria-label={`Keep ${t.thread_name} linked`}
                      onClick={() => onStage(unstageThread(staged, t.thread_id))}
                      className="gap-1 text-[0.8rem]"
                    >
                      <Undo2 aria-hidden className="mr-1 inline size-3.5" />
                      Undo
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Unlink ${t.thread_name}`}
                    onClick={() => onStage(stageThreadUnlink(loaded, staged, t.thread_id))}
                  >
                    <Unlink data-icon="inline-start" />
                    Unlink
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </EditSection>
  );
}
