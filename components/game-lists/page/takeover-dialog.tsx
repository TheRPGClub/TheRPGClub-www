"use client";

import { useState, useTransition } from "react";
import { Flag, ListOrdered, Lock, Trash2, Users } from "lucide-react";
import type { GameList } from "@/lib/game-lists/types";
import type { Takeover } from "@/hooks/use-game-list-board";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// The warning before a list that feeds a Challenge is deleted or made
// Private (pick 2D): the API's own sentence, then Now beside After, so the
// owner sees the club keeps the list (or a copy) for the Challenge.
export function TakeoverDialog({
  takeover,
  list,
  onConfirm,
  onClose,
}: {
  takeover: Takeover | null;
  list: GameList;
  onConfirm: (mode: Takeover["mode"]) => Promise<string | null>;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const del = takeover?.mode === "delete";
  const names = takeover?.feeds.challenges.map((c) => c.name).join(", ") || "a Challenge";
  // The API's own `message` is written for the bot's confirm step; the
  // dialog says it in the page's words.
  const confirm = () =>
    takeover &&
    startTransition(async () => {
      const failed = await onConfirm(takeover.mode);
      if (failed) setError(failed);
      else onClose();
    });
  return (
    <AlertDialog open={takeover !== null} onOpenChange={(open) => !open && !pending && (setError(null), onClose())}>
      <AlertDialogContent className="data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{del ? "Delete this list?" : "Make this list Private?"}</AlertDialogTitle>
          <AlertDialogDescription>
            <b>{list.name}</b> feeds {names}.{" "}
            {del
              ? "If you delete it, the list isn't gone: the club takes it over so the Challenge keeps its Pool. It stops being yours, and you can't get it back."
              : "If you make it Private, the club keeps a Members-visible copy for the Challenge, and your Private list stops feeding it."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Column title="Now">
            <Row icon={list.visibility === "private" ? <Lock /> : <Users />}>
              <b>Yours</b>, {list.visibility === "private" ? "Private" : "Members-visible"}
            </Row>
            <Row icon={<Flag />}>Feeds {names}</Row>
            <Row icon={<ListOrdered />}>{list.entry_count} games and their notes</Row>
          </Column>
          <Column title={del ? "After you delete" : "After you make it Private"}>
            {del ? (
              <Row icon={<Users />}><b>The club&apos;s</b>, Members-visible</Row>
            ) : (
              <Row icon={<Lock />}><b>Yours</b>, Private, and a club copy</Row>
            )}
            <Row icon={<Flag />}>{del ? "Still feeds" : "The copy feeds"} {names}</Row>
            <Row icon={<ListOrdered />}>Same games and notes{del ? ", no longer yours" : ""}</Row>
          </Column>
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep my list</AlertDialogCancel>
          <AlertDialogAction variant="destructive-solid" onClick={confirm} disabled={pending}>
            {del ? <Trash2 aria-hidden /> : <Lock aria-hidden />}
            {pending ? "Saving" : del ? "Delete, club keeps it" : "Make Private, club keeps a copy"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm bg-background p-3">
      <h4 className="font-label mb-2 text-[0.76rem] font-bold tracking-[0.08em] text-faint-foreground">{title}</h4>
      <ul className="space-y-1.5">{children}</ul>
    </div>
  );
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-[0.9rem] text-dim-foreground [&_b]:font-semibold [&_b]:text-foreground [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-faint-foreground">
      {icon}
      <span>{children}</span>
    </li>
  );
}
