import { Bot } from "lucide-react";

// On a Label the Theme gives the ink: pass the type alone.
export const PRESENCE_LABEL_TYPE = "font-label block text-[0.82rem] tracking-[0.06em]";
export const PRESENCE_LABEL = `${PRESENCE_LABEL_TYPE} text-faint-foreground`;

// A proof of the bot's presence as Discord shows it: the member list line
// and the profile's "Playing" block.
export function PresenceProof({ name }: { name: string }) {
  return (
    <div className="bg-card p-5 pt-6">
      <div className="flex items-center gap-3">
        <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-dim-foreground">
          <Bot className="size-6" />
        </span>
        <div className="min-w-0 pr-24">
          <p className="flex items-center gap-1.5 font-semibold">
            The bot
            <span className="font-label rounded-xs bg-foreground/10 px-1.5 text-[0.7rem] tracking-[0.06em] text-dim-foreground">
              App
            </span>
          </p>
          <p className="truncate text-[0.85rem] text-dim-foreground">
            Playing <b className="font-semibold text-foreground">{name || "..."}</b>
          </p>
        </div>
      </div>
      <div className="mt-5 border-t border-border pt-3">
        <p className={PRESENCE_LABEL}>Playing</p>
        <p className="font-headline mt-1 text-[2rem] leading-[0.95] break-words">
          {name || <span className="text-faint-foreground">Nothing yet</span>}
        </p>
      </div>
    </div>
  );
}
