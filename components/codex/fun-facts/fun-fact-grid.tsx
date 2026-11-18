"use client";

import type { CodexEntry } from "@/lib/codex/types";
import { cardTilt } from "@/lib/codex/wall";
import { FunFactCard } from "./fun-fact-card";
import { useWall } from "./wall-state";

// The wall's cards in the order and at the tilts they're dealt: newest first
// at each card's own tilt, until "Shuffle the wall" deals this page again.
export function FunFactGrid({ cards, label }: { cards: { fact: CodexEntry; number: number }[]; label: string }) {
  const { deal, nextDaily } = useWall();
  const byId = new Map(cards.map((card) => [card.fact.id, card]));
  const ordered = deal ? deal.order.flatMap((id) => byId.get(id) ?? []) : cards;
  return (
    <ol aria-label={label} className="mt-9.5 grid gap-x-6.5 gap-y-7 px-1.5 sm:grid-cols-2 sm:gap-y-8.5 lg:grid-cols-3 xl:grid-cols-4">
      {ordered.map(({ fact, number }) => (
        <li key={fact.id} className="min-w-0">
          <FunFactCard
            fact={fact}
            number={number}
            light={fact.id % 3 === 2}
            tilt={deal?.tilts[fact.id] ?? cardTilt(fact.id)}
            next={fact.id === nextDaily}
          />
        </li>
      ))}
    </ol>
  );
}
