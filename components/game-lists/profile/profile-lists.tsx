"use client";

import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import type { GameList } from "@/lib/game-lists/types";
import { SORT_LABEL } from "@/lib/game-lists/types";
import { privateNote, updatedText } from "@/lib/game-lists/text";
import { ButtonLink } from "@/components/ui/button";
import { GameCover } from "@/components/issue/game-cover";
import { ListSpine } from "@/components/game-lists/profile/list-spine";

// A member's Game Lists on their profile (pick 4A): the monumental count
// and the section's name beside a bookcase shelf of box-set spines. The
// first is picked to start with; the picked spine's pull-out under the
// shelf fans its covers beside its name and description. Your own profile
// adds your Private lists and a dashed New list spine.
export function ProfileLists({ lists, own, now }: { lists: GameList[]; own: boolean; now: string }) {
  const [pickedId, setPickedId] = useState(lists[0]?.id ?? null);
  const picked = lists.find((l) => l.id === pickedId) ?? null;
  return (
    <section aria-labelledby="profile-lists" className="grid gap-4 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:gap-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 sm:flex-col sm:items-start">
        <p className="font-headline text-[2.5rem] leading-[0.82] sm:text-[5.75rem]">{lists.length}</p>
        <h2 id="profile-lists" className="font-headline text-2xl sm:text-[1.9rem] sm:leading-[0.95]">
          Game Lists
        </h2>
        <p className="font-label w-full text-[0.74rem] font-bold tracking-[0.08em] text-faint-foreground">{privateNote(lists, own)}</p>
        {own && (
          <ButtonLink href="/lists/new" variant="highlight" size="sm" className="mt-1">
            <Plus aria-hidden />
            New list
          </ButtonLink>
        )}
      </div>
      <div className="min-w-0 rounded-md bg-card px-3.5 pt-6 sm:px-5.5">
        <div className="flex h-[17rem] items-end gap-2 overflow-x-auto pt-5 [scrollbar-width:none] max-sm:h-[15rem]">
          {lists.map((list, i) => (
            <ListSpine key={list.id} list={list} index={i} picked={list.id === pickedId} onPick={() => setPickedId(list.id)} />
          ))}
          {own && (
            <ButtonLink href="/lists/new" variant="add" size="bare" className="h-[11.5rem] w-[4.4rem] shrink-0 flex-col items-center justify-center gap-2 self-end">
              <span className="font-headline text-[1.05rem] leading-none [writing-mode:vertical-rl] rotate-180">
                {lists.length === 0 ? "Start a list" : "New list"}
              </span>
              <Plus aria-hidden />
            </ButtonLink>
          )}
        </div>
        <div aria-hidden className="-mx-3.5 h-4 bg-border-strong shadow-[0_8px_16px_rgb(0_0_0/0.5)] sm:-mx-5.5" />
        {picked ? <PullOut list={picked} now={now} /> : (
          <p className="py-4 text-sm text-faint-foreground">No Game Lists yet. A list can be ranked, A to Z or by date added, and Members-visible or Private.</p>
        )}
      </div>
    </section>
  );
}

function PullOut({ list, now }: { list: GameList; now: string }) {
  return (
    <div aria-live="polite" className="grid gap-3 py-4.5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-5">
      <div className="flex max-sm:hidden" aria-hidden>
        {list.preview_games.map((game, i) => (
          <GameCover key={game.game_id} title={game.title} coverUrl={game.cover_url} className={i > 0 ? "-ml-4.5 w-[3.6rem] shadow-[0_6px_12px_rgb(0_0_0/0.5)]" : "w-[3.6rem] shadow-[0_6px_12px_rgb(0_0_0/0.5)]"} fallbackClassName="p-1 text-[0.55rem]" />
        ))}
      </div>
      <div className="min-w-0">
        <h3 className="font-headline text-[1.7rem] leading-[0.95]">{list.name}</h3>
        <p className="font-label mt-1.5 text-[0.78rem] font-bold tracking-[0.08em] text-faint-foreground">
          {SORT_LABEL[list.sort]} · Updated {updatedText(list.updated_at, new Date(now))}
          {list.visibility === "private" && " · Private"}
        </p>
        {list.description && <p className="mt-1.5 line-clamp-2 max-w-[58ch] text-[0.95rem] text-dim-foreground">{list.description}</p>}
      </div>
      <ButtonLink href={`/lists/${list.id}`} variant="outline" className="justify-self-start">
        Open the list
        <ArrowRight aria-hidden />
      </ButtonLink>
    </div>
  );
}

