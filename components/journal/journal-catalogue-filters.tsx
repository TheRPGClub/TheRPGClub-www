"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { GamePicker } from "@/components/member/game-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CatalogueSearch, MemberFilter } from "@/components/journal/journal-catalogue-search";

// The catalogue's search bar: words to find, then narrow to one member or one
// game. Every change is a new address, so a search can be shared.
export function JournalCatalogueFilters({
  q,
  by,
  game,
  members,
  resultLabel,
  current,
}: {
  q: string;
  by: string | null;
  game: { id: number; title: string } | null;
  members: { id: string; name: string }[];
  resultLabel: string;
  // The page's other params (the pulled volume), kept across searches.
  current: Record<string, string>;
}) {
  const router = useRouter();
  const [picking, setPicking] = useState(false);
  const [pending, startTransition] = useTransition();

  function go(changes: Record<string, string | null>) {
    const next = new URLSearchParams(current);
    next.delete("page");
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    startTransition(() => {
      router.push(`/journals${qs ? `?${qs}` : ""}#catalogue`, { scroll: false });
    });
  }

  return (
    <div className="mt-3.5 flex flex-wrap items-center gap-2.5" aria-busy={pending}>
      <CatalogueSearch q={q} onSearch={(text) => go({ q: text || null })} />
      <MemberFilter by={by} members={members} onPick={(id) => go({ by: id })} />

      {game ? (
        <Badge tone="picked" className="h-9 gap-1.5 border-0 px-3 pr-1 text-[0.85rem]">
          <span className="max-w-[14rem] truncate">{game.title}</span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Any game (clear ${game.title})`}
            onClick={() => go({ game: null })}
          >
            <X />
          </Button>
        </Badge>
      ) : picking ? (
        <div className="w-full sm:w-72">
          <GamePicker
            compact
            autoFocus
            placeholder="Narrow to a game…"
            onPick={(picked) => {
              setPicking(false);
              go({ game: String(picked.game_id) });
            }}
          />
        </div>
      ) : (
        <Button variant="chip" className="gap-1.5 px-3 text-[0.85rem]" onClick={() => setPicking(true)}>
          Any game
          <ChevronDown aria-hidden className="size-3.5 text-faint-foreground" />
        </Button>
      )}

      <span
        role="status"
        className="font-label ml-auto text-[0.85rem] tracking-[0.08em] text-faint-foreground"
      >
        {pending ? "Searching" : resultLabel}
      </span>
    </div>
  );
}
