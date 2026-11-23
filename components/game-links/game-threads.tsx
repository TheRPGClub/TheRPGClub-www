import { MessageSquare } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ApiCollection, Thread } from "@/lib/api/types";
import { RailHeading } from "@/components/issue/game-rail";

// The rail's "Discord threads": the club's threads linked to this game, each a
// jump link into Discord. Read-only: they're linked and unlinked on the Game
// Edit page. Hidden when the game has no threads, or when they can't be read
// (signed out).
export async function GameThreads({ gameId }: { gameId: number }) {
  const threads = await fetchGameThreads(gameId);
  if (!threads?.length) return null;

  return (
    <section>
      <RailHeading
        title="Discord threads"
        count={`${threads.length} ${threads.length === 1 ? "thread" : "threads"}`}
      />
      <ul className="space-y-1.5">
        {threads.map((thread) => (
          <li key={thread.thread_id} className="text-sm">
            {thread.jump_url ? (
              <a
                href={thread.jump_url}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-2 text-foreground hover:text-highlight"
              >
                <MessageSquare
                  aria-hidden
                  className="size-4 shrink-0 text-faint-foreground"
                />
                <span className="truncate">{thread.thread_name}</span>
              </a>
            ) : (
              <span className="flex min-w-0 items-center gap-2 text-foreground">
                <MessageSquare
                  aria-hidden
                  className="size-4 shrink-0 text-faint-foreground"
                />
                <span className="truncate">{thread.thread_name}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
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
