import { MessageSquare } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ApiCollection, Thread } from "@/lib/api/types";
import { RailHeading } from "@/components/issue/game-rail";
import {
  LinkThreadPicker,
  UnlinkThreadButton,
} from "@/components/game-links/thread-controls";

// The rail's "Discord threads": the club's threads linked to this game, each a
// jump link into Discord. Regulars and staff (`canEdit`) also get unlink and a
// thread search to link one. Hidden for everyone else when the game has no
// threads, or when they can't be read (signed out).
export async function GameThreads({
  gameId,
  canEdit,
}: {
  gameId: number;
  canEdit: boolean;
}) {
  const threads = await fetchGameThreads(gameId);
  if (!canEdit && !threads?.length) return null;

  return (
    <section>
      <RailHeading
        title="Discord threads"
        count={
          threads?.length
            ? `${threads.length} ${threads.length === 1 ? "thread" : "threads"}`
            : undefined
        }
      />
      {threads === null ? (
        <p className="text-sm text-faint-foreground">
          Threads couldn&apos;t be loaded right now.
        </p>
      ) : threads.length === 0 ? (
        <p className="text-sm text-faint-foreground">No thread is linked to this game.</p>
      ) : (
        <ul className="space-y-1.5">
          {threads.map((thread) => (
            <li
              key={thread.thread_id}
              className="grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-1 text-sm"
            >
              {thread.jump_url ? (
                <a
                  href={thread.jump_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-2 text-foreground hover:text-highlight"
                >
                  <MessageSquare aria-hidden className="size-4 shrink-0 text-faint-foreground" />
                  <span className="truncate">{thread.thread_name}</span>
                </a>
              ) : (
                <span className="flex min-w-0 items-center gap-2 text-foreground">
                  <MessageSquare aria-hidden className="size-4 shrink-0 text-faint-foreground" />
                  <span className="truncate">{thread.thread_name}</span>
                </span>
              )}
              {canEdit ? (
                <UnlinkThreadButton
                  threadId={thread.thread_id}
                  threadName={thread.thread_name}
                  gameId={gameId}
                />
              ) : (
                <span />
              )}
            </li>
          ))}
        </ul>
      )}
      {canEdit && <LinkThreadPicker gameId={gameId} />}
    </section>
  );
}

// The game's linked threads, or null when the read fails.
async function fetchGameThreads(gameId: number): Promise<Thread[] | null> {
  try {
    const res = await apiFetch(`/api/v1/games/${gameId}/threads?per=50`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return ((await res.json()) as ApiCollection<Thread>).data;
  } catch {
    return null;
  }
}
