"use client";

import { useState } from "react";
import type { ChallengeFormState } from "@/hooks/use-challenge-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GameCover } from "@/components/issue/game-cover";
import { AlsoAddSwitch } from "@/components/challenges/also-add-switch";

// "Also add to the list?" (www#172, the 8A gallery's prompt): saving an
// edit that adds games by hand to a Pool fed by a Game List the Host may add
// to asks first whether those games go into the list too. The API adds them
// all or none (`add_to_list`), so the prompt names every one.
export function AddToListDialog({ form }: { form: ChallengeFormState }) {
  const games = form.listPrompt;
  const list = form.draft.gameList;
  return (
    <Dialog open={games !== null} onOpenChange={(open) => !open && form.closeListPrompt()}>
      <DialogContent className="max-w-md">
        {games && list && <Prompt key={games.length} form={form} games={games} listName={list.name} />}
      </DialogContent>
    </Dialog>
  );
}

function Prompt({
  form,
  games,
  listName,
}: {
  form: ChallengeFormState;
  games: NonNullable<ChallengeFormState["listPrompt"]>;
  listName: string;
}) {
  const [add, setAdd] = useState(false);
  const one = games.length === 1;
  return (
    <div className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Also add to the list?</DialogTitle>
        <DialogDescription>
          {one ? <b className="text-foreground">{games[0].title}</b> : `${games.length} games`} {one ? "joins" : "join"} the
          Pool. <b className="text-foreground">{listName}</b> feeds this Challenge, so you can add {one ? "it" : "them"} there
          too.
        </DialogDescription>
      </DialogHeader>
      <ul className="flex flex-wrap gap-2" aria-label="Games added to the Pool">
        {games.slice(0, 8).map((g) => (
          <li key={g.game_id} title={g.title}>
            <GameCover title={g.title} coverUrl={g.cover_url} className="w-14" fallbackClassName="p-1 text-[0.6rem]" />
          </li>
        ))}
        {games.length > 8 && (
          <li className="font-label self-end text-[0.8rem] tracking-[0.08em] text-faint-foreground">+ {games.length - 8} more</li>
        )}
      </ul>
      <AlsoAddSwitch listName={listName} checked={add} onChange={setAdd} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={form.closeListPrompt}>
          Cancel
        </Button>
        <Button type="button" variant="highlight" onClick={() => form.saveWithList(add)}>
          Save
        </Button>
      </div>
    </div>
  );
}
