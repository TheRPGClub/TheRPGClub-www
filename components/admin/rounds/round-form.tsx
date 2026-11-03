"use client";

import { useId, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, X } from "lucide-react";
import { createRoundAction } from "@/app/actions/rounds";
import type { Game, VotingCategory } from "@/lib/api/types";
import { moveItem, roundEditHref, TRACK_NAME, TRACKS, type RoundDefaults } from "@/lib/rounds";
import { GamePicker } from "@/components/member/game-picker";
import { GameCover } from "@/components/issue/game-cover";
import { ProofCard } from "@/components/admin/desk/proof-card";
import { RoundProof } from "@/components/admin/rounds/round-proof";
import { fieldLabel } from "@/components/admin/rounds/styles";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SentRound {
  category: VotingCategory;
  roundNumber: number;
  monthYear: string;
  games: Game[];
  jobId: number | null;
}

export interface RoundFormProps {
  // Each track's next round and month, from the newest rounds.
  defaults: Record<VotingCategory, RoundDefaults>;
  // A prefill from the rounds list ("Add NR-GOTM" on a round without one).
  prefill?: { category: VotingCategory; roundNumber?: number; monthYear?: string } | null;
}

// Add a GOTM or NR-GOTM round: pick the track, its number and month, and
// search for its games in slot order. The proof beside it is the round as
// it will read; once sent it is stamped Queued and follows the bot's cache
// reload. The API saves the whole round or nothing.
export function RoundForm({ defaults, prefill }: RoundFormProps) {
  const id = useId();
  const start = prefill?.category ?? "gotm";
  const [category, setCategory] = useState<VotingCategory>(start);
  const [roundText, setRoundText] = useState(String(prefill?.roundNumber ?? defaults[start].roundNumber));
  const [monthYear, setMonthYear] = useState(prefill?.monthYear ?? defaults[start].monthYear);
  // Number and month follow the track until the Admin types their own.
  const [touched, setTouched] = useState(!!prefill?.roundNumber);
  const [games, setGames] = useState<Game[]>([]);
  const [pickerKey, setPickerKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<SentRound | null>(null);
  const [pending, startTransition] = useTransition();

  const roundNumber = /^\d+$/.test(roundText.trim()) ? Number(roundText.trim()) : null;

  const pickTrack = (next: VotingCategory) => {
    setCategory(next);
    if (!touched) {
      setRoundText(String(defaults[next].roundNumber));
      setMonthYear(defaults[next].monthYear);
    }
  };

  const addGame = (game: Game) => {
    setPickerKey((k) => k + 1);
    if (games.some((g) => g.game_id === game.game_id)) {
      setError(`${game.title} is already in this round.`);
      return;
    }
    setError(null);
    setGames((list) => [...list, game]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roundNumber || roundNumber < 1) {
      setError("The round number must be a whole number above 0.");
      return;
    }
    if (!monthYear.trim()) {
      setError("Give the round its month, e.g. December 2026.");
      return;
    }
    if (games.length === 0) {
      setError("Add at least one game.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createRoundAction(category, {
        roundNumber,
        monthYear,
        gameIds: games.map((g) => g.game_id),
      });
      if (!result.ok) {
        setError(result.error ?? "Couldn't add the round.");
        return;
      }
      setSent({ category, roundNumber, monthYear: monthYear.trim(), games, jobId: result.jobId ?? null });
    });
  };

  const startAnother = () => {
    setSent(null);
    setGames([]);
    setTouched(false);
    setRoundText(String(defaults[category].roundNumber));
    setMonthYear(defaults[category].monthYear);
    setPickerKey((k) => k + 1);
  };

  const shown = sent ?? { category, roundNumber, monthYear, games, jobId: null };
  const locked = pending || !!sent;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-10">
      <form onSubmit={submit} className="min-w-0 space-y-5" aria-labelledby={`${id}-title`}>
        <h2 id={`${id}-title`} className="font-headline text-[2rem] leading-none">
          Add a round
        </h2>

        <fieldset disabled={locked} className="space-y-1.5">
          <legend className={fieldLabel}>Track</legend>
          <div className="mt-1.5 inline-flex rounded-sm border border-rule-strong p-0.5">
            {TRACKS.map((c) => (
              <label
                key={c}
                className={cn(
                  "font-label cursor-pointer rounded-xs px-3.5 py-1.5 text-[0.9rem] font-bold tracking-[0.06em] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-highlight/60",
                  category === c
                    ? c === "gotm"
                      ? "bg-gotm text-paper"
                      : "bg-nr text-paper"
                    : "text-paper-dim hover:text-paper",
                )}
              >
                <input
                  type="radio"
                  name={`${id}-track`}
                  value={c}
                  checked={category === c}
                  onChange={() => pickTrack(c)}
                  className="sr-only"
                />
                {TRACK_NAME[c]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
          <label className="space-y-1.5">
            <span className={fieldLabel}>Round</span>
            <Input
              inputMode="numeric"
              value={roundText}
              onChange={(e) => {
                setTouched(true);
                setRoundText(e.target.value);
              }}
              disabled={locked}
              aria-invalid={roundText.trim() !== "" && !roundNumber}
            />
          </label>
          <label className="space-y-1.5">
            <span className={fieldLabel}>Month</span>
            <Input
              value={monthYear}
              onChange={(e) => {
                setTouched(true);
                setMonthYear(e.target.value);
              }}
              placeholder="December 2026"
              maxLength={40}
              disabled={locked}
            />
          </label>
        </div>

        <div className="space-y-2">
          <span id={`${id}-games`} className={fieldLabel}>
            Games, in slot order
          </span>
          {games.length > 0 && (
            <ol aria-labelledby={`${id}-games`} className="border-t border-rule">
              {games.map((game, i) => (
                <li
                  key={game.game_id}
                  className="grid grid-cols-[1.5rem_2.25rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-rule py-2"
                >
                  <span className="font-headline text-center text-[1.2rem] text-paper-mute">{i + 1}</span>
                  <GameCover
                    title={game.title}
                    coverUrl={game.cover_url}
                    className="w-9 rounded-xs"
                    fallbackClassName="p-0.5 text-[0.45rem]"
                  />
                  <span className="min-w-0 truncate font-semibold">{game.title}</span>
                  {!locked && (
                    <span className="flex gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-paper-dim"
                        disabled={i === 0}
                        onClick={() => setGames((list) => moveItem(list, i, i - 1))}
                        aria-label={`Move ${game.title} up`}
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-paper-dim"
                        disabled={i === games.length - 1}
                        onClick={() => setGames((list) => moveItem(list, i, i + 1))}
                        aria-label={`Move ${game.title} down`}
                      >
                        <ArrowDown />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-paper-dim hover:text-destructive"
                        onClick={() => setGames((list) => list.filter((g) => g.game_id !== game.game_id))}
                        aria-label={`Remove ${game.title}`}
                      >
                        <X />
                      </Button>
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
          {!locked && (
            <GamePicker
              key={pickerKey}
              compact
              onPick={addGame}
              placeholder={games.length === 0 ? "Search for the round's game…" : "Search for another game…"}
            />
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        {sent ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <Button type="button" variant="outline" onClick={startAnother}>
              <Plus data-icon="inline-start" />
              Add another
            </Button>
            <Link href={roundEditHref(sent.category, sent.roundNumber)} className={buttonVariants({ variant: "ghost" })}>
              <Pencil data-icon="inline-start" />
              Edit this round
            </Link>
            <span className="text-[0.86rem] text-paper-mute">
              Saved. The bot reloads {TRACK_NAME[sent.category]} round {sent.roundNumber}.
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" variant="highlight" disabled={pending || games.length === 0}>
              {pending ? <Loader2 className="animate-spin" /> : <Plus data-icon="inline-start" />}
              Add {TRACK_NAME[category]} round {roundNumber ?? ""}
            </Button>
            <span className="text-[0.84rem] text-paper-mute">The whole round is saved, or none of it.</span>
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
