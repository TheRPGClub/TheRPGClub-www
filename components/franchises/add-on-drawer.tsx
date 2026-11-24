"use client";

import Link from "next/link";
import { Pencil, X } from "lucide-react";
import type { FranchiseGame } from "@/lib/franchises/types";
import type { FranchiseEditor } from "@/hooks/use-franchise-editor";
import { Button } from "@/components/ui/button";
import { GameCover } from "@/components/issue/game-cover";

// The drawer an Add-on insert slides out: a full-width row under its
// parent's row with each Add-on as a small cover, its name and year, and a
// note on the ones a member linked by hand. In edit mode each gets Unlink.
// It is also how the Add-ons of games outside the Franchise are listed.
export function AddOnDrawer({
  parent,
  games,
  editor,
  as: Tag = "li",
}: {
  parent: string;
  games: FranchiseGame[];
  editor: FranchiseEditor;
  as?: "li" | "div";
}) {
  return (
    <Tag className="col-span-full flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-sm bg-card px-4 py-3 shadow-[inset_0_0_0_1px_var(--color-border)]">
      <span className="font-label text-[0.78rem] font-bold tracking-[0.08em] whitespace-nowrap text-faint-foreground">
        {parent} · Add-ons
      </span>
      <ul className="contents">
        {games.map((g) => (
          <li key={g.game_id} className="flex items-center gap-2.5 rounded-xs bg-muted py-1.5 pr-2 pl-1.5 text-[0.92rem]">
            <GameCover title={g.title} coverUrl={g.cover_url} className="w-7.5 flex-none" fallbackClassName="p-0.5 text-[0.4rem]" />
            <Link href={`/games/${g.game_id}`} className="font-semibold hover:text-highlight">
              {g.title}
            </Link>
            <span className="text-[0.8rem] text-faint-foreground">{g.release_year ?? "TBA"}</span>
            {g.source === "manual" && (
              <span title="Linked by hand" className="text-dim-foreground">
                <Pencil aria-label="Linked by hand" className="size-3" />
              </span>
            )}
            {editor.editing && (
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Unlink ${g.title}`}
                disabled={editor.pending}
                onClick={() => editor.unlink(g, false)}
              >
                <X />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Tag>
  );
}
