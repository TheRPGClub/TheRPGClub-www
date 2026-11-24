"use client";

import { useState, useTransition } from "react";
import { MessageSquarePlus } from "lucide-react";
import type { Game } from "@/lib/api/types";
import { NOTE_MAX } from "@/lib/game-lists/types";
import { proposeGameAction } from "@/app/actions/pool-proposals";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GamePicker } from "@/components/member/game-picker";
import { NoticeSlip } from "@/components/issue/notice-slip";

const REFUSAL_TITLE: Record<string, string> = {
  already_proposed: "Already proposed",
  already_in_pool: "Already in the Pool",
};

// "Propose a game" (pick 9A, for members on the Proposals view): a GameDB
// search, an optional note for whoever decides, and Send. A game already in
// the Pool or already waiting comes back as a slip with the API's sentence.
export function ProposeForm({ challengeId, decider }: { challengeId: number; decider: string }) {
  const [game, setGame] = useState<Game | null>(null);
  const [note, setNote] = useState("");
  const [round, setRound] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<{ code: string; message: string } | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const over = note.length > NOTE_MAX;
  const send = () =>
    game &&
    startTransition(async () => {
      setError(null);
      setRefusal(null);
      const result = await proposeGameAction(challengeId, game.game_id, note);
      if (result.ok) {
        setSent(game.title);
        setGame(null);
        setNote("");
        setRound((r) => r + 1);
      } else if (result.refusal) setRefusal(result.refusal);
      else setError(result.error ?? "That didn't send. Try again.");
    });
  return (
    <section aria-labelledby="propose-heading" className="max-w-xl">
      <h3 id="propose-heading" className="font-headline text-[1.75rem] leading-none">
        Propose a game
      </h3>
      <p className="mt-2 text-[0.95rem] text-dim-foreground">{decider} You&apos;ll get a DM if it&apos;s accepted.</p>
      <form
        className="mt-4 flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!over) send();
        }}
      >
        <GamePicker
          key={round}
          compact
          placeholder="Search for a game…"
          onPick={(picked) => {
            setGame(picked);
            setRefusal(null);
            setSent(null);
          }}
        />
        <Textarea
          variant="entry"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Why it belongs (optional)"
          aria-label="A note for whoever decides (optional)"
          aria-invalid={over || undefined}
        />
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-label mr-auto text-[0.78rem] font-bold tracking-[0.07em] text-faint-foreground">
            <b className={over ? "text-destructive" : "text-highlight"}>{note.length}</b> / {NOTE_MAX}
          </p>
          <Button type="submit" variant="highlight" disabled={!game || over || pending}>
            <MessageSquarePlus aria-hidden />
            {pending ? "Sending" : "Send the proposal"}
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {sent && (
          <p role="status" className="text-[0.95rem] text-dim-foreground">
            Sent. <b className="text-foreground">{sent}</b> is waiting below.
          </p>
        )}
      </form>
      {refusal && (
        <NoticeSlip title={REFUSAL_TITLE[refusal.code] ?? "Not this one"} role="alert" className="mt-5 max-w-md">
          {refusal.message}
        </NoticeSlip>
      )}
    </section>
  );
}
