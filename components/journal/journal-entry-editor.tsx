"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import type { GameSummary } from "@/lib/api/types";
import { JOURNAL_BODY_MAX, JOURNAL_TITLE_MAX, chapterHref } from "@/lib/journals";
import {
  createJournalEntryAction,
  updateJournalEntryAction,
} from "@/app/actions/journals";
import { GamePicker } from "@/components/member/game-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type JournalEditorGame = Pick<GameSummary, "game_id" | "title" | "cover_url">;

const FIELD =
  "w-full min-w-0 rounded-sm border border-rule-strong bg-ink text-paper caret-highlight outline-none transition-colors placeholder:text-paper-mute focus-visible:border-highlight focus-visible:ring-3 focus-visible:ring-highlight/25 disabled:opacity-50";

// The owner's editor, open for their own edits (the yellow edge): optional
// title, the entry, and the game it files under. Writes the next entry, or
// rewrites one in place. A save that files the entry under another game opens
// that game's chapter.
export function JournalEntryEditor({
  userId,
  entryId,
  game: initialGame,
  chapterGameId,
  initialTitle = "",
  initialBody = "",
  label,
  onCancel,
  onSaved,
  autoFocus,
  className,
}: {
  userId: string;
  // Set when rewriting an entry; absent for the next one.
  entryId?: number;
  game: JournalEditorGame | null;
  // The chapter the editor sits in, if any: saving elsewhere navigates.
  chapterGameId?: number | null;
  initialTitle?: string;
  initialBody?: string;
  label: string;
  onCancel?: () => void;
  onSaved?: () => void;
  autoFocus?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const ids = useId();
  const [game, setGame] = useState<JournalEditorGame | null>(initialGame);
  const [picking, setPicking] = useState(initialGame === null);
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!game) {
      setError("Pick the game this entry is about.");
      return;
    }
    startTransition(async () => {
      const res = entryId
        ? await updateJournalEntryAction({
            entryId,
            gameId: game.game_id,
            title,
            body,
            previousGameId: initialGame?.game_id,
          })
        : await createJournalEntryAction({ userId, gameId: game.game_id, title, body });
      if (!res.ok) {
        setError(res.error ?? "Couldn't save the entry. Try again.");
        return;
      }
      if (game.game_id !== chapterGameId) {
        router.push(chapterHref(userId, game.game_id));
      } else if (!entryId) {
        setTitle("");
        setBody("");
      }
      onSaved?.();
    });
  }

  return (
    <form
      onSubmit={save}
      noValidate
      aria-label={entryId ? "Edit entry" : "Write an entry"}
      className={cn(
        "rounded-md bg-ink-2 px-4 py-3.5 shadow-[inset_0_0_0_1.5px_var(--color-highlight)] sm:px-4.5",
        className,
      )}
    >
      <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
        <span className="font-label text-[0.88rem] text-highlight">{label}</span>
        {game && !picking && (
          <button
            type="button"
            onClick={() => setPicking(true)}
            disabled={pending}
            aria-label={`Game: ${game.title}. Change the game`}
            className="font-label ml-auto inline-flex h-7 max-w-full min-w-0 items-center gap-2 rounded-sm bg-ink py-0 pr-2.5 pl-1 text-[0.82rem] text-paper shadow-[inset_0_0_0_1px_var(--color-rule-strong)] transition-colors hover:shadow-[inset_0_0_0_1px_var(--color-paper-mute)] focus-visible:ring-3 focus-visible:ring-highlight/50 focus-visible:outline-none"
          >
            <span className="block h-[21px] w-4 shrink-0 overflow-hidden rounded-[1.5px] bg-ink-3">
              {game.cover_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={game.cover_url} alt="" className="size-full object-cover" />
              )}
            </span>
            <span className="min-w-0 truncate">{game.title}</span>
            <ChevronDown aria-hidden className="size-3.5 shrink-0 text-paper-mute" />
          </button>
        )}
      </div>

      {picking && (
        <div className="mb-2.5">
          <GamePicker
            compact
            autoFocus={initialGame !== null}
            placeholder="Which game is this entry about…"
            onPick={(picked) => {
              setGame({
                game_id: picked.game_id,
                title: picked.title,
                cover_url: picked.cover_url,
              });
              setPicking(false);
              setError(null);
            }}
          />
          {initialGame && (
            <button
              type="button"
              onClick={() => setPicking(false)}
              className="font-label mt-1.5 text-[0.8rem] text-paper-mute hover:text-highlight"
            >
              Keep {game?.title ?? initialGame.title}
            </button>
          )}
        </div>
      )}

      <label htmlFor={`${ids}-title`} className="sr-only">
        Title (optional)
      </label>
      <input
        id={`${ids}-title`}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setError(null);
        }}
        maxLength={JOURNAL_TITLE_MAX}
        placeholder="Title (optional)"
        disabled={pending}
        className={cn(FIELD, "mb-2 h-9 px-3 font-semibold italic placeholder:font-normal")}
      />
      <label htmlFor={`${ids}-body`} className="sr-only">
        Entry
      </label>
      <textarea
        id={`${ids}-body`}
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          setError(null);
        }}
        maxLength={JOURNAL_BODY_MAX}
        rows={4}
        required
        autoFocus={autoFocus}
        placeholder="Where you are, what happened, what you think of it so far."
        disabled={pending}
        className={cn(FIELD, "min-h-[88px] px-3 py-2.5 text-[0.98rem] leading-[1.55]")}
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <Button type="submit" variant="highlight" disabled={pending}>
          <Check aria-hidden />
          {pending ? "Saving" : "Save entry"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        )}
        <span className="font-label ml-auto text-[0.78rem] tracking-[0.08em] text-paper-mute tabular-nums">
          Title {title.length} / {JOURNAL_TITLE_MAX} · Entry {body.length} / {JOURNAL_BODY_MAX}
        </span>
      </div>
    </form>
  );
}
