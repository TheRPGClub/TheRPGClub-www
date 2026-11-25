"use client";

import { useState } from "react";
import { ListPlus } from "lucide-react";
import { CARDS_SHOWN, type GameListsSectionData } from "@/lib/game-lists/game-cards";
import { Button } from "@/components/ui/button";
import { DetailSection, SectionLink } from "@/components/templates/detail-template";
import { AddToListTray } from "@/components/game-lists/game/add-to-list-tray";
import { GameListCard } from "@/components/game-lists/game/game-list-card";

// "In Game Lists" as its own full-width department (pick 5C): the count on
// the paper rule with a yellow Add to list at its right, which opens the
// tray above the cards; four cards a row, and past eight a link to all of
// them on /lists.
export function GameListsDepartment({ gameId, gameTitle, data }: { gameId: number; gameTitle: string; data: GameListsSectionData }) {
  const [open, setOpen] = useState(false);
  return (
    <DetailSection
      id="game-lists"
      title="In Game Lists"
      count={data.count}
      className="mt-10 min-w-0"
      headingClassName="mb-5"
      action={
        <div className="flex items-center gap-4">
          {data.count > CARDS_SHOWN && <SectionLink href={`/lists?game=${gameId}`}>All {data.count} lists</SectionLink>}
          <Button variant="highlight" size="sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <ListPlus aria-hidden />
            Add to list
          </Button>
        </div>
      }
    >
      {open && <AddToListTray gameId={gameId} gameTitle={gameTitle} own={data.own} onClose={() => setOpen(false)} />}
      {data.cards.length === 0 ? (
        <p className="text-sm text-faint-foreground">Not in any Game List yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {data.cards.map((card) => (
            <GameListCard key={card.list.id} card={card} />
          ))}
        </div>
      )}
    </DetailSection>
  );
}
