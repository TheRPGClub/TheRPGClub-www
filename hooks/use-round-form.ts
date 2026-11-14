"use client";

import { useState, useTransition } from "react";
import { createRoundAction } from "@/app/actions/rounds";
import type { Game, VotingCategory } from "@/lib/api/types";
import type { RoundDefaults } from "@/lib/rounds";

export interface SentRound {
  category: VotingCategory;
  roundNumber: number;
  monthYear: string;
  games: Game[];
  jobId: number | null;
}

export interface RoundPrefill {
  category: VotingCategory;
  roundNumber?: number;
  monthYear?: string;
}

// The add-a-round form's state: the track, its number and month (following
// the track's defaults until the Admin types their own), the games in slot
// order, and the send. The API saves the whole round or nothing.
export function useRoundForm(defaults: Record<VotingCategory, RoundDefaults>, prefill?: RoundPrefill | null) {
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

  const typeRound = (text: string) => {
    setTouched(true);
    setRoundText(text);
  };

  const typeMonth = (text: string) => {
    setTouched(true);
    setMonthYear(text);
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

  return {
    category,
    pickTrack,
    roundText,
    roundNumber,
    typeRound,
    monthYear,
    typeMonth,
    games,
    setGames,
    addGame,
    pickerKey,
    error,
    sent,
    pending,
    locked: pending || !!sent,
    submit,
    startAnother,
  };
}
