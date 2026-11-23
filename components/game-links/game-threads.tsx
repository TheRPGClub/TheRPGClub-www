import { MessageSquare } from "lucide-react";
import type { Thread } from "@/lib/api/types";
import { PanelHeading } from "@/components/issue/game-rail";

// The hero panel's "Discord threads": the club's threads linked to this game,
// each a jump link into Discord. Read-only: they're linked and unlinked on
// the Game Edit page. The panel leaves it out when the game has none.
export function GameThreads({ threads }: { threads: Thread[] }) {
  return (
    <section>
      <PanelHeading title="Discord threads" />
      <ul>
        {threads.map((thread) => {
          const body = (
            <>
              <MessageSquare aria-hidden className="mt-0.5 size-4 shrink-0 text-faint-foreground" />
              <span className="min-w-0 break-words">{thread.thread_name}</span>
            </>
          );
          return (
            <li key={thread.thread_id} className="text-[0.92rem] leading-[1.3]">
              {thread.jump_url ? (
                <a
                  href={thread.jump_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2.25 py-1.25 text-foreground transition-colors hover:text-highlight"
                >
                  {body}
                </a>
              ) : (
                <span className="flex items-start gap-2.25 py-1.25 text-foreground">{body}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
