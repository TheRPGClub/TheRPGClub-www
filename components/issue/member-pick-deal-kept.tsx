import { ExternalLink } from "lucide-react";
import type { BacklogPick, Platform } from "@/lib/api/types";
import { StartPlayingForm } from "@/components/member/start-playing-form";

// The bar under the hand: the kept game, its HowLongToBeat page, and the
// start-playing form.
export function KeptBar({
  userId,
  keptPick,
  platforms,
}: {
  userId: string;
  keptPick: BacklogPick;
  platforms?: Platform[];
}) {
  return (
    <section
      aria-label="Start playing"
      className="flex flex-wrap items-end justify-between gap-4 rounded-md border border-border bg-card px-4.5 py-4"
    >
      <div className="min-w-0">
        {/* One line, the verb leading the title, rather than a label
            stacked over it. */}
        <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="font-label text-[0.9rem] font-extrabold tracking-[0.06em] text-dim-foreground">
            You kept
          </span>
          <span className="font-headline text-[1.65rem] leading-none">
            {keptPick.game.title}
          </span>
        </p>
        {keptPick.hltb?.url && (
          <a
            href={keptPick.hltb.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-label mt-2 inline-flex items-center gap-1 text-xs font-extrabold tracking-[0.08em] text-faint-foreground transition-colors hover:text-highlight"
          >
            HowLongToBeat
            <ExternalLink aria-hidden className="size-3" />
          </a>
        )}
      </div>
      <StartPlayingForm
        // A new keep is a new form: its platform choice and error reset.
        key={keptPick.entry_id}
        userId={userId}
        gamedbGameId={keptPick.gamedb_game_id}
        platformId={keptPick.platform_id}
        platforms={platforms}
      />
    </section>
  );
}
