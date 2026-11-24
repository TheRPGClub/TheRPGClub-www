import { X } from "lucide-react";

import type { MemberShelfEntry, MemberShelfKind } from "@/lib/api/member-shelf-entry";
import { entryMeta } from "@/lib/member-shelf/entry-meta";
import { Button } from "@/components/ui/button";

// One entry on a list's shelf: its cover (or its title where it has none)
// carrying the remove button, then the title and a line of facts.
export function ListEntryTile({
  kind,
  entry,
  removable,
  onRemove,
}: {
  kind: MemberShelfKind;
  entry: MemberShelfEntry;
  removable: boolean;
  onRemove: () => void;
}) {
  const gameTitle = entry.game?.title ?? `Game #${entry.gamedb_game_id ?? "?"}`;
  const meta = entryMeta(kind, entry);

  return (
    <>
      <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] bg-muted">
        {entry.game?.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
          <img src={entry.game.cover_url} alt="" className="size-full object-cover" />
        ) : (
          <span className="font-headline grid size-full place-items-center p-2 text-center text-base text-faint-foreground sm:text-lg">
            {gameTitle}
          </span>
        )}
        <Button
          type="button"
          variant="cover-remove"
          size="icon"
          onClick={onRemove}
          disabled={!removable}
          aria-label={`Remove ${gameTitle}`}
          className="absolute top-1.5 right-1.5 size-7.5 border-0"
        >
          <X aria-hidden className="size-4" />
        </Button>
      </div>
      <p className="font-label mt-2 line-clamp-2 text-[0.95rem] leading-[1.1] font-extrabold tracking-[0.02em]">
        {gameTitle}
      </p>
      {meta && (
        <p className="font-label mt-1 truncate text-[0.75rem] font-extrabold tracking-[0.08em] text-faint-foreground">
          {meta}
        </p>
      )}
      {entry.note && (
        <p className="mt-1 line-clamp-2 text-[0.8rem] text-faint-foreground">{entry.note}</p>
      )}
    </>
  );
}
