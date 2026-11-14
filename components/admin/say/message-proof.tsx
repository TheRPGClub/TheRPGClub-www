import { Bot, CornerUpLeft } from "lucide-react";

// The message as Discord will show it: the bot's name, the reply line when
// it answers a message, and the text with its line breaks.
export function MessageProof({
  channel,
  content,
  replyingTo,
}: {
  channel: string | null;
  content: string;
  replyingTo: string | null;
}) {
  const text = content.trim();
  return (
    <div className="bg-card p-5">
      <p className="font-label text-[0.85rem] tracking-[0.08em] text-dim-foreground">
        {replyingTo ? "Reply" : "Message"} · {channel ?? "No channel yet"}
      </p>
      <div className="mt-4 border-t border-border pt-4">
        {replyingTo && (
          <p className="mb-1.5 flex items-center gap-1.5 pl-1 text-[0.82rem] text-faint-foreground">
            <CornerUpLeft aria-hidden className="size-3.5 shrink-0" />
            <span className="min-w-0 truncate">Replying to message {replyingTo}</span>
          </p>
        )}
        <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-muted text-dim-foreground">
            <Bot aria-hidden className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2">
              <span className="font-semibold">The bot</span>
              <span className="font-label rounded-xs bg-muted px-1.5 pt-0.5 text-[0.68rem] tracking-[0.06em] text-dim-foreground">
                App
              </span>
            </p>
            {text ? (
              <p className="mt-1 text-[0.95rem] leading-[1.45] break-words whitespace-pre-wrap">
                {text}
              </p>
            ) : (
              <p className="mt-1 text-[0.95rem] text-faint-foreground italic">Your message shows here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
