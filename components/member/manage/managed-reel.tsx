"use client";

import {
  CompletedReel,
  type ReelManage,
} from "@/components/issue/member-completed-reel";
import type { GameCompletion } from "@/lib/api/types";
import { EntryTools } from "./entry-tools";
import { RemovedHole, UndoLines } from "./removed-hole";
import { useShelfManageContext } from "./shelf-manage-context";
import { SpotlightCompletionEditor } from "./spotlight-completion-editor";

// The Completed page's reel as its owner sees it (spec api#451, pick 3A):
// the same spotlight and filmstrip, with Edit turning the spotlight into the
// completion's form, a remove x on every frame, and a dashed hole with Undo
// where a removed completion stood.
export function ManagedReel(props: {
  entries: GameCompletion[];
  ownerName: string;
  offset: number;
  total: number;
}) {
  const { owner, listName, manage } = useShelfManageContext();
  const { undo } = manage;
  const titleOf = (entry: GameCompletion) =>
    entry.game?.title ?? "Unknown game";
  const remove = (entry: GameCompletion) =>
    manage.remove(entry.completion_id, titleOf(entry));

  const reel: ReelManage = {
    isRemoved: (entry) =>
      undo.held.has(entry.completion_id) || undo.gone.has(entry.completion_id),
    onEdit: (entry) => manage.edit(entry.completion_id),
    editor: (entry) =>
      manage.editing === entry.completion_id &&
      !undo.held.has(entry.completion_id) ? (
        <SpotlightCompletionEditor
          // A fresh form for each completion opened.
          key={entry.completion_id}
          userId={owner.userId}
          entry={entry}
          platforms={owner.platforms}
          onSaved={manage.saved}
          onCancel={() => manage.edit(null)}
          onRemove={() => remove(entry)}
        />
      ) : null,
    renderFrame: (entry, frame) => {
      const id = entry.completion_id;
      if (undo.gone.has(id)) return null;
      if (undo.held.has(id))
        return (
          <RemovedHole title={titleOf(entry)} onUndo={() => undo.undo(id)} />
        );
      return (
        <div className="relative">
          {frame}
          <EntryTools
            title={titleOf(entry)}
            onRemove={() => remove(entry)}
            className="top-1 right-1"
          />
        </div>
      );
    },
  };

  return (
    <div className="space-y-4">
      <UndoLines manage={manage} listName={listName} />
      <CompletedReel {...props} manage={reel} />
    </div>
  );
}
