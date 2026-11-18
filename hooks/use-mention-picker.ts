"use client";

import { useState, type KeyboardEvent, type RefObject } from "react";
import type { User } from "@/lib/api/types";
import { memberName } from "@/lib/achievements";
import { encodeFunFact, insertMention, mentionQuery, type PickedMention } from "@/lib/codex/fun-fact-text";
import { useMemberSearch } from "@/hooks/use-member-search";

// The Fun Fact field's text and its @ mention picker (www#124). Typing "@"
// and two letters of a name searches the club's members; arrow keys move
// through them, Enter or Tab mentions the lit one, Escape closes the list.
// A mention reads as "@Name" in the field and is saved as `<@id>`, so
// `encoded` is the text as the API stores it and the one the limit counts.
// `ref` is the field, which a pick puts the caret back into.
export function useMentionPicker(
  initial: { text: string; picked: PickedMention[] },
  ref: RefObject<HTMLTextAreaElement | null>,
) {
  const [text, setText] = useState(initial.text);
  const [picked, setPicked] = useState<PickedMention[]>(initial.picked);
  const [caret, setCaret] = useState(initial.text.length);
  const [lit, setLit] = useState(0);
  // The "@" whose list was closed with Escape, so it stays closed.
  const [dismissed, setDismissed] = useState<number | null>(null);

  const query = mentionQuery(text, caret);
  const search = useMemberSearch(query?.query ?? "");
  const open = query !== null && query.start !== dismissed && search.hasQuery;
  const results = search.settled ? search.results.slice(0, 6) : [];

  function sync(target: HTMLTextAreaElement) {
    setText(target.value);
    setCaret(target.selectionStart ?? target.value.length);
    setLit(0);
  }

  function pick(user: User) {
    if (!query) return;
    const name = memberName(user);
    const next = insertMention(text, query.start, caret, name);
    setText(next.text);
    setCaret(next.caret);
    setPicked((list) => [...list.filter((p) => p.id !== user.user_id), { id: user.user_id, name }]);
    requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(next.caret, next.caret);
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setDismissed(query.start);
    } else if (results.length > 0 && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setLit((i) => (i + step + results.length) % results.length);
    } else if (results.length > 0 && (event.key === "Enter" || event.key === "Tab")) {
      event.preventDefault();
      pick(results[Math.min(lit, results.length - 1)]);
    }
  }

  function reset(next = { text: "", picked: [] as PickedMention[] }) {
    setText(next.text);
    setPicked(next.picked);
    setCaret(next.text.length);
    setDismissed(null);
  }

  return {
    text,
    encoded: encodeFunFact(text, picked),
    open,
    results,
    settled: search.settled,
    error: search.error,
    lit,
    sync,
    pick,
    onKeyDown,
    reset,
  };
}

export type MentionPicker = ReturnType<typeof useMentionPicker>;
