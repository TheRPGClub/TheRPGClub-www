"use client";

import type { ReactNode } from "react";
import { useShelfOrder } from "@/hooks/use-shelf-order";
import { resolveEntryId } from "@/lib/api/member-shelf-entry";
import { isOrderedKind } from "@/lib/shelf-forms/manage";
import type {
  SimpleShelfEntry,
  SimpleShelfKind,
} from "@/lib/shelf-forms/values";
import { EntryEditor } from "./entry-editor";
import { EntryTools } from "./entry-tools";
import { LiftBar } from "./lift-bar";
import { RemovedHole, UndoLines } from "./removed-hole";
import { ShelfCard } from "./shelf-card";
import { useShelfManageContext } from "./shelf-manage-context";

const titleOf = (entry: SimpleShelfEntry) =>
  entry.game?.title ?? "Unknown game";

// A Now Playing, Backlog, Favorites or Collection page as its owner sees it
// (spec api#451, pick 3A): today's cards, each with Edit, Move (ordered
// lists) and Remove on its picture. Edit opens the entry in place across
// its row; a removed entry leaves a dashed hole with Undo; an ordered list
// moves an entry by dragging it or with the lift bar.
export function ManagedShelf<T extends SimpleShelfEntry>({
  kind,
  entries,
  offset = 0,
  gridClass,
  wide,
  renderCard,
}: {
  kind: SimpleShelfKind;
  entries: T[];
  // How many entries the earlier pages hold.
  offset?: number;
  gridClass: string;
  // Now Playing's wide key art.
  wide?: boolean;
  // The entry's card as everyone sees it, with its place in the list.
  renderCard: (entry: T, place: number) => ReactNode;
}) {
  const { owner, listName, manage } = useShelfManageContext();
  const byId = new Map(
    entries.flatMap((e) => {
      const id = resolveEntryId(kind, e);
      return id === undefined ? [] : [[id, e] as const];
    }),
  );
  const ordered = isOrderedKind(kind);
  const order = useShelfOrder({
    userId: owner.userId,
    kind,
    ids: [...byId.keys()],
    offset,
  });
  const { undo } = manage;
  const lifted = order.lifted !== null ? byId.get(order.lifted) : undefined;

  return (
    <div className="space-y-4">
      <UndoLines manage={manage} listName={listName} />
      {order.error && (
        <p role="alert" className="text-[0.84rem] text-destructive">
          Couldn&apos;t move it: {order.error}
        </p>
      )}
      {lifted && <LiftBar order={order} title={titleOf(lifted)} />}
      <ul className={gridClass}>
        {order.order.map((id, index) => {
          const entry = byId.get(id);
          if (!entry || undo.gone.has(id)) return null;
          const title = titleOf(entry);
          if (undo.held.has(id)) {
            return (
              <li key={id}>
                <RemovedHole
                  title={title}
                  wide={wide}
                  onUndo={() => undo.undo(id)}
                />
              </li>
            );
          }
          if (manage.editing === id && entry.game) {
            return (
              <li key={id} className="col-span-full">
                <EntryEditor
                  kind={kind}
                  userId={owner.userId}
                  game={entry.game}
                  entry={entry}
                  platforms={owner.platforms}
                  onSaved={manage.saved}
                  onCancel={() => manage.edit(null)}
                  onRemove={() => manage.remove(id, title)}
                />
              </li>
            );
          }
          const isLifted = order.lifted === id;
          return (
            <ShelfCard key={id} id={id} order={order} ordered={ordered}>
              {renderCard(entry, offset + index + 1)}
              <EntryTools
                title={title}
                lifted={isLifted}
                onEdit={entry.game ? () => manage.edit(id) : undefined}
                onMove={
                  ordered
                    ? () => (isLifted ? order.cancel() : order.pickUp(id))
                    : undefined
                }
                onRemove={() => manage.remove(id, title)}
                className={wide ? "top-2 right-2" : undefined}
              />
            </ShelfCard>
          );
        })}
      </ul>
    </div>
  );
}
