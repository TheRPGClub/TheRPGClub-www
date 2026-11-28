"use client";

import { useState, type ReactNode } from "react";
import { Flag, Pencil, Plus } from "lucide-react";
import type { GameList } from "@/lib/game-lists/types";
import { gamesCount } from "@/lib/game-lists/text";
import { useGameListBoard } from "@/hooks/use-game-list-board";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/templates/page-header";
import { ListPageByline } from "@/components/game-lists/page/list-page-byline";
import { ListTools } from "@/components/game-lists/page/list-tools";
import { ListWall } from "@/components/game-lists/page/list-wall";
import { NoteDialog } from "@/components/game-lists/page/note-dialog";
import { SaveSlip } from "@/components/game-lists/page/save-slip";
import { TakeoverDialog } from "@/components/game-lists/page/takeover-dialog";

// A Game List's own page (pick 2D): the name on the paper rule, its byline
// and description, then the numbered wall. Whoever may edit it turns on
// Editing, which brings the editing bar and every cover's control strip.
export function ListBoard({
  initial,
  isOwner,
  now,
  badge,
  startChallengeHref = null,
  challengeHref = null,
}: {
  initial: GameList;
  // Only the owner changes who sees a list.
  isOwner: boolean;
  now: string;
  badge?: ReactNode;
  // "Start a Challenge" from this list (www#172): its games become Core.
  startChallengeHref?: string | null;
  // The Challenge this list feeds, which takes the Start button's place.
  challengeHref?: string | null;
}) {
  const board = useGameListBoard(initial);
  const { list, entries } = board;
  const [editing, setEditing] = useState(false);
  const [noteFor, setNoteFor] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const noteEntry = entries.find((e) => e.game_id === noteFor) ?? null;
  const today = new Date(now);

  return (
    <div className="space-y-5">
      <PageHeader
        back={{ href: "/lists", label: "Lists" }}
        title={list.name}
        badge={badge}
        count={gamesCount(list.entry_count)}
        actions={
          !editing &&
          (startChallengeHref || challengeHref || list.viewer.can_edit) && (
            <>
              {challengeHref && list.challenge && (
                <ButtonLink href={challengeHref} variant="outline" title="The Challenge this list feeds">
                  <Flag aria-hidden />
                  <span className="max-w-56 truncate">{list.challenge.name}</span>
                </ButtonLink>
              )}
              {startChallengeHref && list.entry_count > 0 && (
                <ButtonLink href={startChallengeHref} variant="outline">
                  <Plus aria-hidden />
                  Start a Challenge
                </ButtonLink>
              )}
              {list.viewer.can_edit && (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Pencil aria-hidden />
                  Edit list
                </Button>
              )}
            </>
          )
        }
      />
      <ListPageByline list={list} now={today} />
      {editing && (
        <ListTools
          sort={list.sort}
          isPrivate={list.visibility === "private"}
          canChangeVisibility={isOwner && !list.club}
          canDelete={list.viewer.can_delete}
          pending={board.pending}
          onSort={board.setSort}
          onPrivate={(on) => board.setPrivate(on)}
          onDelete={() => setConfirmDelete(true)}
          onDone={() => setEditing(false)}
        />
      )}
      <div data-slot="list-wall" className="pt-3">
        <ListWall board={board} editing={editing} now={today} onNote={setNoteFor} />
      </div>
      <NoteDialog
        target={noteEntry && { gameId: noteEntry.game_id, title: noteEntry.game.title, note: noteEntry.note }}
        onClose={() => setNoteFor(null)}
        onSave={board.note}
      />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this list?"
        description={`${list.name} and its ${gamesCount(list.entry_count)} go for good.`}
        confirmLabel="Delete list"
        pendingLabel="Deleting"
        cancelLabel="Keep my list"
        onConfirm={() => board.destroy()}
      />
      <TakeoverDialog
        takeover={board.takeover}
        list={list}
        onClose={board.closeTakeover}
        onConfirm={async (mode) => {
          if (mode === "delete") return board.destroy(true);
          board.setPrivate(true, true);
          return null;
        }}
      />
      {board.error && <SaveSlip message={board.error} onDismiss={board.dismissError} />}
    </div>
  );
}
