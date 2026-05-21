"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X } from "lucide-react";
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

  const shownCount = entries.length;
  const displayedTotal = total ?? shownCount;
  const hasMoreThanShown = total !== undefined && total > shownCount;

  return (
    <section className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          <span className="text-sm text-muted-foreground tabular-nums">
            {displayedTotal}
          </span>
        </div>
        {!adding && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setAdding(true);
              setError(null);
            }}
            disabled={pending}
          >
            <Plus />
            Add
          </Button>
        )}
      </header>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {adding && (
        <div className="space-y-2 rounded-lg border bg-background p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Add a game
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Cancel"
              onClick={() => {
                setAdding(false);
                setPlatformId(null);
              }}
              disabled={pending}
            >
              <X />
            </Button>
          </div>
          {platforms.length > 0 && kind !== "favorite" && (
            <select
              value={platformId ?? ""}
              onChange={(e) =>
                setPlatformId(e.target.value ? Number(e.target.value) : null)
              }
              className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
              className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
              className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="Ownership type"
            >
              {OWNERSHIP_TYPES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          )}
          <GamePicker compact autoFocus onPick={handleAdd} />
        </div>
      )}

      {shownCount === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
          Nothing here yet.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {entries.map((entry, index) => {
            const id = resolveEntryId(kind, entry);
            return (
              <li
                key={id ?? `unresolved-${index}`}
                className="flex items-center gap-3 px-3 py-2 text-sm"
              >
                {entry.game?.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.game.cover_url}
                    alt=""
                    className="size-10 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="size-10 shrink-0 rounded bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {entry.game?.title ?? `Game #${entry.gamedb_game_id ?? "?"}`}
                  </p>
                  {entry.platform?.platform_name && (
                    <p className="text-xs text-muted-foreground">
                      {entry.platform.platform_name}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemove(id)}
                  disabled={pending || id === undefined}
                  aria-label="Remove"
                >
                  <Trash2 />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {hasMoreThanShown && (
        <p className="text-center text-xs text-muted-foreground">
          Showing the first {shownCount}. Use the profile page to browse the full list.
        </p>
      )}
    </section>
  );
}
