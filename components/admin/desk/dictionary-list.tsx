"use client";

import { useRef, type ReactNode } from "react";
import { groupByLetter } from "@/lib/desk";
import { useUndoDelete, type UndoCommitResult } from "@/hooks/use-undo-delete";
import { DictionaryEntry } from "@/components/admin/desk/dictionary-entry";
import { DictionaryIndex } from "@/components/admin/desk/dictionary-index";
import { UndoBar } from "@/components/admin/desk/undo-bar";

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

// A dictionary-style list: entries filed under big letters, each letter's
// entries in up to five columns across the page,
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
      {showIndex && <DictionaryIndex present={present} />}

      {groups.length === 0 ? (
        <div className="mt-5 text-dim-foreground">{empty ?? "Nothing here yet."}</div>
      ) : (
        <div className="mt-5">
          {groups.map((group) => (
            <section key={group.letter} id={`dict-${group.letter}`} className="mb-6 scroll-mt-20">
              <h2 className="font-headline mb-1 border-b-2 border-foreground pb-1 text-[3.4rem] leading-[0.85]">
                {group.letter}
              </h2>
              <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {group.items.map((item) => {
                  const key = getKey(item);
                  if (editingKey === key && renderEditor) {
                    return (
                      <li
                        key={key}
                        className="col-span-full -mx-3 my-1.5 rounded-md bg-card p-3 ring-1 ring-highlight ring-inset"
                      >
                        {renderEditor(item)}
                      </li>
                    );
                  }
                  return (
                    <DictionaryEntry
                      key={key}
                      word={headword(item)}
                      others={also?.(item) ?? []}
                      alsoLabel={alsoLabel}
                      held={undo.held.has(key)}
                      error={undo.errors.get(key)}
                      onEdit={onEdit && (() => onEdit(item))}
                      onDelete={() => hold(item)}
                      undo={
                        <UndoBar
                          className="col-span-2 mt-1.5"
                          message={deletedMessage?.(item) ?? "Deleted."}
                          delayMs={undo.delayMs}
                          onUndo={() => undo.undo(key)}
                        />
                      }
                    />
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
