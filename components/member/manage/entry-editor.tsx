"use client";

import { useId } from "react";
import type { ShelfSaved } from "@/hooks/use-shelf-save";
import type { Game, Platform } from "@/lib/api/types";
import type {
  SimpleShelfEntry,
  SimpleShelfKind,
} from "@/lib/shelf-forms/values";
import { MemberCover } from "@/components/issue/member-cover";
import { ShelfEntryForm } from "@/components/member/shelf-forms/shelf-entry-form";
import { cn } from "@/lib/utils";

// An entry open for editing on its list page (spec api#451, pick 3A): it
// opens where the entry stood, across the row, as a spotlight on the game's
// key art under the yellow ring, with the list's own form beside the cover.
export function EntryEditor({
  kind,
  userId,
  game,
  entry,
  platforms,
  onSaved,
  onCancel,
  onRemove,
}: {
  kind: SimpleShelfKind;
  userId: string;
  game: Game;
  entry: SimpleShelfEntry;
  platforms: Platform[];
  onSaved: (saved: ShelfSaved) => void;
  onCancel: () => void;
  onRemove: () => void;
}) {
  const titleId = useId();
  const art = game.art_url ?? game.cover_url ?? null;
  return (
    <section
      aria-labelledby={titleId}
      data-slot="entry-editor"
      onKeyDown={(event) => event.key === "Escape" && onCancel()}
      className="relative isolate grid items-start gap-4 overflow-hidden rounded-md bg-black p-4 shadow-[0_0_0_2px_var(--color-highlight)] sm:grid-cols-[10rem_minmax(0,32rem)] sm:gap-7 sm:p-7"
    >
      {art && (
        // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
        <img
          src={art}
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover object-[50%_30%]"
        />
      )}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10",
          art
            ? "bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-background)_94%,transparent)_0%,color-mix(in_oklab,var(--color-background)_75%,transparent)_55%,color-mix(in_oklab,var(--color-background)_45%,transparent)_100%)]"
            : "bg-card",
        )}
      />
      <div className="flex items-end gap-4 sm:block">
        <MemberCover
          game={game}
          title={game.title}
          className="w-24 shadow-[0_14px_34px_rgb(0_0_0/0.55)] sm:w-full"
        />
        <h2 className="font-headline text-[1.9rem] leading-[0.9] text-balance sm:mt-3 sm:text-[1.6rem]">
          {game.title}
        </h2>
      </div>
      <ShelfEntryForm
        kind={kind}
        userId={userId}
        game={game}
        entry={entry}
        platforms={platforms}
        titleId={titleId}
        onSaved={onSaved}
        onCancel={onCancel}
        onRemove={onRemove}
        className="sm:shadow-[0_24px_60px_rgb(0_0_0/0.6)]"
      />
    </section>
  );
}
