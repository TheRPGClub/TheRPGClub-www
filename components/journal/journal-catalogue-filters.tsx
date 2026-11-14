"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";
import { GamePicker } from "@/components/member/game-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CHIP =
  "font-label inline-flex h-9 items-center gap-1.5 rounded-sm bg-card px-3 text-[0.85rem] text-dim-foreground shadow-[inset_0_0_0_1px_var(--color-border-strong)] transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-highlight/50 focus-visible:outline-none";

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
  const [text, setText] = useState(q);
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
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go({ q: text.trim() || null });
        }}
        className="relative w-full max-w-[520px] min-w-0 sm:flex-1"
      >
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint-foreground"
        />
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search every entry…"
          aria-label="Search every entry"
          className="h-9 w-full rounded-sm border border-border-strong bg-card pr-9 pl-9 text-foreground caret-highlight outline-none placeholder:text-faint-foreground focus-visible:border-highlight focus-visible:ring-3 focus-visible:ring-highlight/25 [&::-webkit-search-cancel-button]:hidden"
        />
        {text && (
          <button
            type="button"
            aria-label="Clear the search"
            onClick={() => {
              setText("");
              go({ q: null });
            }}
            className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-faint-foreground hover:text-foreground"
          >
            <X aria-hidden className="size-4" />
          </button>
        )}
      </form>

      <label className="relative">
        <span className="sr-only">Member</span>
        <select
          value={by ?? ""}
          onChange={(e) => go({ by: e.target.value || null })}
          className={cn(CHIP, "appearance-none pr-8")}
        >
          <option value="">Any member</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-faint-foreground"
        />
      </label>

      {game ? (
        <span className={cn(CHIP, "bg-muted pr-1 text-foreground")}>
          <span className="max-w-[14rem] truncate">{game.title}</span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Any game (clear ${game.title})`}
            onClick={() => go({ game: null })}
          >
            <X />
          </Button>
        </span>
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
        <button type="button" className={CHIP} onClick={() => setPicking(true)}>
          Any game
          <ChevronDown aria-hidden className="size-3.5 text-faint-foreground" />
        </button>
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
