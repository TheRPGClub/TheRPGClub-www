"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import {
  addGameToListAction,
  removeGameListEntryAction,
} from "@/app/actions/game-lists";
import {
  resolveEntryId,
  type GameListEntry,
  type GameListKind,
} from "@/lib/api/game-list-entry";
import type { Game, Platform } from "@/lib/api/types";
import { SectionHeading } from "@/components/issue/page-header";
import { Button } from "@/components/ui/button";
import { GamePicker } from "./game-picker";

export interface GameListEditorProps {
  userId: string;
  kind: GameListKind;
  title: string;
  description?: string;
  entries: GameListEntry[];
  // Total count from the backend — we may only have a partial preview window.
  total?: number;
  platforms: Platform[];
}

// Backend validates these as check constraints; the order here drives the
// default selection so the "no choice" path still produces a valid request.
const COMPLETION_TYPES = [
  "Main Story",
  "Main Story + Side Content",
  "Completionist",
] as const;
const OWNERSHIP_TYPES = ["Digital", "Physical", "Subscription", "Other"] as const;

// In-world native selects: ink field, paper text, yellow focus.
export const EDIT_SELECT_CLASS =
  "h-9 w-full min-w-0 rounded-sm border border-rule-strong bg-ink-2 px-2.5 text-sm text-paper outline-none transition-colors focus-visible:border-highlight focus-visible:ring-3 focus-visible:ring-highlight/25 disabled:opacity-50";

// One of the member's lists as a shelf of covers: each cover carries its
// remove button, and the dashed Add tile at the end opens the game picker
// inline above the shelf.
export function GameListEditor({
  userId,
  kind,
  title,
  description,
  entries,
  total,
  platforms,
}: GameListEditorProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [platformId, setPlatformId] = useState<number | null>(null);
  const [completionType, setCompletionType] = useState<string>(
    COMPLETION_TYPES[0],
  );
  const [ownershipType, setOwnershipType] = useState<string>(
    OWNERSHIP_TYPES[0],
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleAdd = (game: Game) => {
    setError(null);
    startTransition(async () => {
      const result = await addGameToListAction(userId, kind, {
        gamedb_game_id: game.game_id,
        platform_id: platformId,
        ...(kind === "completed" ? { completion_type: completionType } : {}),
        ...(kind === "collection" ? { ownership_type: ownershipType } : {}),
      });
      if (!result.ok) {
        setError(result.error ?? "Failed to add.");
        return;
      }
      setAdding(false);
      setPlatformId(null);
      router.refresh();
    });
  };

  const handleRemove = (entryId: number | undefined) => {
    if (entryId === undefined) {
      setError(
        "Couldn't determine this entry's id — try refreshing the page.",
      );
      return;
    }
    if (!confirm("Remove this entry?")) return;
    setError(null);
    startTransition(async () => {
      const result = await removeGameListEntryAction(userId, kind, entryId);
      if (!result.ok) {
        setError(result.error ?? "Failed to remove.");
        return;
      }
      router.refresh();
    });
  };

  const openPicker = () => {
    setAdding(true);
    setError(null);
  };
  const closePicker = () => {
    setAdding(false);
    setPlatformId(null);
  };

  const shownCount = entries.length;
  const displayedTotal = total ?? shownCount;
  const hasMoreThanShown = total !== undefined && total > shownCount;
  const showPlatform = platforms.length > 0 && kind !== "favorite";

  return (
    <section aria-label={title} className="space-y-4">
      <div className="space-y-2.5">
        <SectionHeading
          as="h2"
          title={title}
          count={`${displayedTotal} ${displayedTotal === 1 ? "game" : "games"}`}
          className="[&_h2]:text-4xl sm:[&_h2]:text-[2.75rem]"
          action={
            pending ? (
              <span className="font-label inline-flex items-center gap-1.5 text-sm text-paper-mute">
                <Loader2 aria-hidden className="size-3.5 animate-spin" />
                Saving…
              </span>
            ) : undefined
          }
        />
        {description && (
          <p className="text-sm text-paper-mute">{description}</p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {adding && (
        <div className="space-y-2.5 rounded-md border border-highlight bg-ink-2 p-3 sm:p-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-label mr-auto text-[0.95rem] font-extrabold tracking-[0.06em] text-highlight">
              Add to {title}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closePicker}
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
          {(showPlatform || kind === "completed" || kind === "collection") && (
            <div className="grid gap-2 sm:grid-cols-2">
              {showPlatform && (
                <select
                  value={platformId ?? ""}
                  onChange={(e) =>
                    setPlatformId(e.target.value ? Number(e.target.value) : null)
                  }
                  aria-label="Platform"
                  className={EDIT_SELECT_CLASS}
                >
                  <option value="">Platform (optional)…</option>
                  {platforms.map((p) => (
                    <option key={p.platform_id} value={p.platform_id}>
                      {p.platform_name}
                    </option>
                  ))}
                </select>
              )}
              {kind === "completed" && (
                <select
                  value={completionType}
                  onChange={(e) => setCompletionType(e.target.value)}
                  className={EDIT_SELECT_CLASS}
                  aria-label="Completion type"
                >
                  {COMPLETION_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              )}
              {kind === "collection" && (
                <select
                  value={ownershipType}
                  onChange={(e) => setOwnershipType(e.target.value)}
                  className={EDIT_SELECT_CLASS}
                  aria-label="Ownership type"
                >
                  {OWNERSHIP_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          <GamePicker
            compact
            autoFocus
            onPick={handleAdd}
            placeholder={`Search games to add to ${title.toLowerCase()}…`}
          />
        </div>
      )}

      <ul className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {entries.map((entry, index) => {
          const id = resolveEntryId(kind, entry);
          const gameTitle =
            entry.game?.title ?? `Game #${entry.gamedb_game_id ?? "?"}`;
          const meta = entryMeta(kind, entry);
          return (
            <li key={id ?? `unresolved-${index}`} className="min-w-0">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] bg-ink-3">
                {entry.game?.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.game.cover_url}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="font-headline grid size-full place-items-center p-2 text-center text-base text-paper-mute sm:text-lg">
                    {gameTitle}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(id)}
                  disabled={pending || id === undefined}
                  aria-label={`Remove ${gameTitle}`}
                  className="absolute top-1.5 right-1.5 grid size-7.5 place-items-center rounded-full bg-ink/85 text-paper transition-colors hover:bg-paper hover:text-ink disabled:pointer-events-none disabled:opacity-50"
                >
                  <X aria-hidden className="size-4" />
                </button>
              </div>
              <p className="font-label mt-2 line-clamp-2 text-[0.95rem] leading-[1.1] font-extrabold tracking-[0.02em]">
                {gameTitle}
              </p>
              {meta && (
                <p className="font-label mt-1 truncate text-[0.75rem] font-extrabold tracking-[0.08em] text-paper-mute">
                  {meta}
                </p>
              )}
              {entry.note && (
                <p className="mt-1 line-clamp-2 text-[0.8rem] text-paper-mute">
                  {entry.note}
                </p>
              )}
            </li>
          );
        })}
        {!adding && (
          <li>
            <button
              type="button"
              onClick={openPicker}
              disabled={pending}
              className="font-label flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-[3px] border border-dashed border-rule-strong text-[0.85rem] font-extrabold tracking-[0.08em] text-paper-dim transition-colors hover:border-highlight hover:text-highlight disabled:opacity-50"
            >
              <Plus aria-hidden className="size-5" />
              Add a game
            </button>
          </li>
        )}
      </ul>

      {shownCount === 0 && (
        <p className="text-sm text-paper-mute">
          Nothing here yet. Add a game to start this list.
        </p>
      )}

      {hasMoreThanShown && (
        <p className="text-sm text-paper-mute">
          Showing the first {shownCount}. Use the profile page to browse the
          full list.
        </p>
      )}
    </section>
  );
}

const MONTH = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

// The one line of facts under a cover: when it was finished, how it's
// owned, or just the platform.
function entryMeta(kind: GameListKind, entry: GameListEntry): string | null {
  const platform =
    entry.platform?.platform_abbreviation ?? entry.platform?.platform_name ?? null;
  if (kind === "completed" && "completion_id" in entry) {
    const date = entry.completed_at ? new Date(entry.completed_at) : null;
    const when =
      date && !Number.isNaN(date.getTime()) ? MONTH.format(date) : null;
    return [when, platform].filter(Boolean).join(" · ") || entry.completion_type;
  }
  if (kind === "collection" && "ownership_type" in entry) {
    return [platform, entry.ownership_type].filter(Boolean).join(" · ") || null;
  }
  return platform;
}
