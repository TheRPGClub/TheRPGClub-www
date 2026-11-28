"use client";

import { useId } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import type { VotingCategory } from "@/lib/api/types";
import { roundEditHref, TRACK_NAME, type RoundDefaults } from "@/lib/rounds";
import { useRoundForm, type RoundPrefill } from "@/hooks/use-round-form";
import { ProofCard } from "@/components/admin/desk/proof-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoundFormGames } from "./round-form-games";
import { RoundProof } from "./round-proof";
import { RoundTrackPicker } from "./round-track-picker";
import { fieldLabel } from "./styles";
import { Label } from "@/components/ui/label";

export interface RoundFormProps {
  // Each track's next round and month, from the newest rounds.
  defaults: Record<VotingCategory, RoundDefaults>;
  // A prefill from the rounds list ("Add NR-GOTM" on a round without one).
  prefill?: RoundPrefill | null;
}

// Add a GOTM or NR-GOTM round: pick the track, its number and month, and
// search for its games in slot order. The proof beside it is the round as
// it will read; once sent it is stamped Queued and follows the bot's cache
// reload. The API saves the whole round or nothing.
export function RoundForm({ defaults, prefill }: RoundFormProps) {
  const id = useId();
  const f = useRoundForm(defaults, prefill);
  const { sent, locked, pending, roundNumber } = f;
  const shown = sent ?? { category: f.category, roundNumber, monthYear: f.monthYear, games: f.games };

  return (
    <div data-slot="issue-desk" data-variant="round-form" className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-10">
      <form onSubmit={f.submit} className="min-w-0 space-y-5" aria-labelledby={`${id}-title`}>
        <h2 id={`${id}-title`} className="font-headline text-[2rem] leading-none">
          Add a round
        </h2>

        <RoundTrackPicker category={f.category} onPick={f.pickTrack} disabled={locked} />

        <div className="grid gap-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
          <Label variant="frame" className="space-y-1.5">
            <span className={fieldLabel}>Round</span>
            <Input
              inputMode="numeric"
              value={f.roundText}
              onChange={(e) => f.typeRound(e.target.value)}
              disabled={locked}
              aria-invalid={f.roundText.trim() !== "" && !roundNumber}
            />
          </Label>
          <Label variant="frame" className="space-y-1.5">
            <span className={fieldLabel}>Month</span>
            <Input
              value={f.monthYear}
              onChange={(e) => f.typeMonth(e.target.value)}
              placeholder="December 2026"
              maxLength={40}
              disabled={locked}
            />
          </Label>
        </div>

        <RoundFormGames id={id} games={f.games} setGames={f.setGames} onPick={f.addGame} pickerKey={f.pickerKey} locked={locked} />

        {f.error && (
          <p role="alert" className="text-sm text-destructive">
            {f.error}
          </p>
        )}

        {sent ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <Button type="button" variant="outline" onClick={f.startAnother}>
              <Plus data-icon="inline-start" />
              Add another
            </Button>
            <ButtonLink href={roundEditHref(sent.category, sent.roundNumber)} variant="ghost">
              <Pencil data-icon="inline-start" />
              Edit this round
            </ButtonLink>
            <span className="text-[0.86rem] text-faint-foreground">
              Saved. The bot reloads {TRACK_NAME[sent.category]} round {sent.roundNumber}.
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" variant="highlight" disabled={pending || f.games.length === 0}>
              {pending ? <Loader2 className="motion-safe:animate-spin" /> : <Plus data-icon="inline-start" />}
              Add {TRACK_NAME[f.category]} round {roundNumber ?? ""}
            </Button>
            <span className="text-[0.84rem] text-faint-foreground">The whole round is saved, or none of it.</span>
          </div>
        )}
      </form>

      <ProofCard
        jobId={sent?.jobId ?? null}
        what="The bot's round reload"
        caption={
          sent && sent.jobId == null
            ? "Saved. The API queued no reload job for it."
            : "The round as the GOTM history and the bot will carry it."
        }
      >
        <RoundProof
          category={shown.category}
          roundNumber={shown.roundNumber}
          monthYear={shown.monthYear}
          games={shown.games.map((g) => ({ key: g.game_id, title: g.title, coverUrl: g.cover_url }))}
        />
      </ProofCard>
    </div>
  );
}
