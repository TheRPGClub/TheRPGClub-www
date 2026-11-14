"use client";

import { useRef, type ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DICTIONARY_LETTERS, groupByLetter } from "@/lib/desk";
import { useUndoDelete, type UndoCommitResult } from "@/hooks/use-undo-delete";
import { UndoBar } from "@/components/admin/desk/undo-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DictionaryListProps<T, K extends string | number> {
  items: readonly T[];
  getKey: (item: T) => K;
  // The entry's headword: what it files under and is sorted by.
  headword: (item: T) => string;
  // The other forms, printed in italics after `alsoLabel`.
  also?: (item: T) => readonly string[];
  alsoLabel?: string;
  // Sent when the Undo bar runs out (or the page is left), never before.
  onDelete: (item: T) => Promise<UndoCommitResult>;
  // The Undo bar's message, e.g. `Deleted. Searches for "fft" stop finding these games.`
  deletedMessage?: (item: T) => ReactNode;
  // Shows the pencil and swaps the entry for `renderEditor` while its key
  // is `editingKey`.
  onEdit?: (item: T) => void;
  editingKey?: K | null;
  renderEditor?: (item: T) => ReactNode;
  // Shown when there are no items (after the page's own search filter).
  empty?: ReactNode;
  // The A to Z jump bar above the list.
  showIndex?: boolean;
  undoMs?: number;
  className?: string;
}

// A dictionary-style list: entries filed under big letters in two columns,
// an A to Z jump bar, and edit and delete on each entry. Delete strikes the
// entry through and holds it behind an Undo bar; the request is sent only
// when the bar runs out. A refused delete brings the entry back with the
// reason. The page owns search and add, and filters `items` itself.
export function DictionaryList<T, K extends string | number>({
  items,
  getKey,
  headword,
  also,
  alsoLabel = "Also",
  onDelete,
  deletedMessage,
  onEdit,
  editingKey,
  renderEditor,
  empty,
  showIndex = true,
  undoMs,
  className,
}: DictionaryListProps<T, K>) {
  // The item as it was when its delete was held, so the delete still goes
  // out if a search filters it off the list meanwhile.
  const heldItems = useRef(new Map<K, T>());
  const undo = useUndoDelete<K>({
    delayMs: undoMs,
    commit: async (key) => {
      const item = heldItems.current.get(key);
      heldItems.current.delete(key);
      return item === undefined ? undefined : onDelete(item);
    },
  });
  const hold = (item: T) => {
    heldItems.current.set(getKey(item), item);
    undo.hold(getKey(item));
  };
  const visible = items.filter((item) => !undo.gone.has(getKey(item)));
  const groups = groupByLetter(visible, headword);
  const present = new Set(groups.map((g) => g.letter));

  return (
    <div className={className}>
      {showIndex && (
        <nav aria-label="Jump to a letter" className="mt-4.5 flex flex-wrap gap-0.5">
          {DICTIONARY_LETTERS.filter((l) => l !== "#" || present.has("#")).map((letter) =>
            present.has(letter) ? (
              <a
                key={letter}
                href={`#dict-${letter}`}
                className="font-headline grid size-[30px] place-items-center rounded-xs text-[1.05rem] text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                {letter}
              </a>
            ) : (
              <span
                key={letter}
                aria-hidden
                className="font-headline grid size-[30px] place-items-center text-[1.05rem] text-faint-foreground/60"
              >
                {letter}
              </span>
            ),
          )}
        </nav>
      )}

      {groups.length === 0 ? (
        <div className="mt-5 text-dim-foreground">{empty ?? "Nothing here yet."}</div>
      ) : (
        <div className="mt-5 gap-x-11 md:columns-2">
          {groups.map((group) => (
            <section key={group.letter} id={`dict-${group.letter}`} className="mb-4.5 scroll-mt-20 break-inside-avoid">
              <h2 className="font-headline mb-1 border-b-2 border-foreground pb-1 text-[3.4rem] leading-[0.85]">
                {group.letter}
              </h2>
              <ul>
                {group.items.map((item) => {
                  const key = getKey(item);
                  const word = headword(item);
                  const others = also?.(item) ?? [];
                  const held = undo.held.has(key);
                  const error = undo.errors.get(key);

                  if (editingKey === key && renderEditor) {
                    return (
                      <li
                        key={key}
                        className="-mx-3 my-1.5 break-inside-avoid rounded-md bg-card p-3 ring-1 ring-highlight ring-inset"
                      >
                        {renderEditor(item)}
                      </li>
                    );
                  }

                  return (
                    <li
                      key={key}
                      className="grid break-inside-avoid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 border-b border-border py-2.5"
                    >
                      <span
                        className={cn(
                          "text-[1.05rem] font-bold break-words",
                          held && "text-faint-foreground line-through decoration-destructive",
                        )}
                      >
                        {word}
                      </span>
                      {others.length > 0 && (
                        <span
                          className={cn(
                            "col-start-1 text-[0.93rem] break-words text-dim-foreground italic",
                            held && "text-faint-foreground line-through decoration-destructive",
                          )}
                        >
                          <b className="font-label mr-1.5 text-[0.72rem] tracking-[0.08em] text-faint-foreground not-italic">
                            {alsoLabel}
                          </b>
                          {others.join(", ")}
                        </span>
                      )}
                      {!held && (
                        <span className="col-start-2 row-span-2 row-start-1 flex gap-0.5 self-center">
                          {onEdit && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-dim-foreground"
                              onClick={() => onEdit(item)}
                              aria-label={`Edit ${word}`}
                              title="Edit"
                            >
                              <Pencil />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-dim-foreground hover:text-destructive"
                            onClick={() => hold(item)}
                            aria-label={`Delete ${word}`}
                            title="Delete"
                          >
                            <Trash2 />
                          </Button>
                        </span>
                      )}
                      {held && (
                        <UndoBar
                          className="col-span-2 mt-1.5"
                          message={deletedMessage?.(item) ?? "Deleted."}
                          delayMs={undo.delayMs}
                          onUndo={() => undo.undo(key)}
                        />
                      )}
                      {error && (
                        <p role="alert" className="col-span-2 mt-1 text-sm text-destructive">
                          {"Couldn't delete it: "}
                          {error}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
