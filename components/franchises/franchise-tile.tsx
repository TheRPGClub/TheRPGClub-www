"use client";

import Link from "next/link";
import { Paperclip, Plus, X } from "lucide-react";
import type { FranchiseGame } from "@/lib/franchises/types";
import type { FranchiseEditor } from "@/hooks/use-franchise-editor";
import type { FranchiseItemProps } from "@/hooks/use-franchise-board";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GameCover } from "@/components/issue/game-cover";

// One cover on the Franchise page, linking to its game. In edit mode the
// cover drags to another section (`item`) and carries Unlink (top right); a
// game just unlinked is greyed with a plus to link it back, and doesn't
// drag. A game with Add-ons gets the paper insert that opens them.
export function FranchiseTile({
  game,
  editor,
  item,
  gone,
  caption,
  addOns,
  open,
  onToggleAddOns,
  fallbackClassName,
}: {
  game: FranchiseGame;
  editor: FranchiseEditor;
  // The drag board's props for this cover (edit mode).
  item?: FranchiseItemProps;
  // Unlinked while editing.
  gone?: boolean;
  caption: React.ReactNode;
  addOns: number;
  open?: boolean;
  onToggleAddOns?: () => void;
  fallbackClassName?: string;
}) {
  const busy = editor.busy === `move:${game.game_id}` || editor.busy === `x:${game.game_id}`;
  return (
    <li {...(gone ? {} : item)} className={cn("relative min-w-0", busy && "opacity-60")}>
      {editor.editing && (
        <Button
          variant="cover-token"
          size="icon-xs"
          aria-label={gone ? `Link ${game.title} again` : `Unlink ${game.title}`}
          title={gone ? "Link again" : "Unlink"}
          disabled={editor.pending}
          onClick={() => (gone ? editor.relink(game) : editor.unlink(game))}
          className="absolute top-1.5 right-1.5 z-10"
        >
          {gone ? <Plus /> : <X />}
        </Button>
      )}
      <Link
        href={`/games/${game.game_id}`}
        className={cn(
          "block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-highlight",
          gone && "opacity-35 grayscale",
        )}
      >
        <GameCover title={game.title} coverUrl={game.cover_url} alt={game.title} className="w-full" fallbackClassName={fallbackClassName} />
      </Link>
      <div className={cn(gone && "opacity-50")}>{caption}</div>
      {addOns > 0 && onToggleAddOns && (
        <Button
          variant="insert"
          size="xs"
          aria-expanded={!!open}
          onClick={onToggleAddOns}
          className="mt-1.5 h-auto gap-1 px-1.5 pt-1 pb-[3px]"
        >
          <Paperclip aria-hidden className="size-2.75" />
          {addOns} Add-on{addOns === 1 ? "" : "s"}
        </Button>
      )}
    </li>
  );
}
