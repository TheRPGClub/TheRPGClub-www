"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { pickGameAction } from "@/app/actions/challenge-editions";
import { shuffleTo, stepTo, type PickCard } from "@/lib/challenges/santa-pick";

// The Santa pick page's deal (www#111): which game is showing, which ones
// the Santa has seen, the pick (kept here once the API takes it, so the tag
// fills in at once), and the ways to move: ← → step through the backlog, S
// shuffles, Enter on the reel picks (while focus is in the deal), a swipe
// across the card steps.

export interface Picked {
  gameId: number;
  title: string;
  coverUrl: string | null;
}

export function usePickDeal(editionId: number, cards: readonly PickCard[], initial: Picked | null) {
  const start = Math.max(
    cards.findIndex((c) => c.gameId === initial?.gameId),
    0,
  );
  const [index, setIndex] = useState(start);
  const [seen, setSeen] = useState<ReadonlySet<number>>(() => new Set([start]));
  const [picked, setPicked] = useState<Picked | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startPick] = useTransition();
  const touch = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback((to: number) => {
    setIndex(to);
    setSeen((s) => (s.has(to) ? s : new Set(s).add(to)));
  }, []);
  const next = useCallback(() => go(stepTo(index, cards.length, 1)), [go, index, cards.length]);
  const prev = useCallback(() => go(stepTo(index, cards.length, -1)), [go, index, cards.length]);
  const shuffle = useCallback(() => go(shuffleTo(index, cards.length)), [go, index, cards.length]);

  const card = cards[index];
  const pick = useCallback(() => {
    if (!card || pending || picked?.gameId === card.gameId) return;
    setError(null);
    startPick(async () => {
      const result = await pickGameAction(editionId, card.gameId);
      if (!result.ok) {
        setError(result.error ?? "That didn't work. Try again in a moment.");
        return;
      }
      const game = result.pick?.game;
      setPicked(
        game
          ? { gameId: game.game_id, title: game.title, coverUrl: game.cover_url ?? null }
          : { gameId: card.gameId, title: card.title, coverUrl: card.coverUrl },
      );
    });
  }, [card, editionId, pending, picked]);

  // The keys act only while focus is inside the deal (the card or the
  // reel), so a single-letter shortcut never fires from elsewhere on the
  // page (WCAG 2.1.4).
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable='true'], [role='dialog']")) return;
      const onReel = target.getAttribute("role") === "listbox";
      if (event.key === "ArrowRight") next();
      else if (event.key === "ArrowLeft") prev();
      else if (event.key === "s" || event.key === "S") shuffle();
      else if (event.key === "Enter" && onReel) pick();
      else if (event.key === "Home" && onReel) go(0);
      else if (event.key === "End" && onReel) go(cards.length - 1);
      else return;
      event.preventDefault();
    },
    [next, prev, shuffle, pick, go, cards.length],
  );

  // Swiping the card left deals the next game, right the one before.
  const swipe = {
    onTouchStart(event: React.TouchEvent) {
      const t = event.touches[0];
      touch.current = { x: t.clientX, y: t.clientY };
    },
    onTouchEnd(event: React.TouchEvent) {
      const from = touch.current;
      touch.current = null;
      const t = event.changedTouches[0];
      if (!from || !t) return;
      const dx = t.clientX - from.x;
      if (Math.abs(dx) < 60 || Math.abs(t.clientY - from.y) > 40) return;
      if (dx < 0) next();
      else prev();
    },
  };

  return { index, card, seen, picked, error, pending, go, next, prev, shuffle, pick, swipe, onKeyDown, dismissError: () => setError(null) };
}
