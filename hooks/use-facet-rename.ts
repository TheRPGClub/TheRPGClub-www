"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

/**
 * A scorecard row's rename: whether it is open, the draft, and the ways out.
 *
 * Committed on the way out rather than per keystroke, which is what lets
 * Escape and the cross put the old name back. Selected rather than merely
 * focused on the way in: a row opened for renaming usually wants replacing,
 * and "New category" always does. On the way back out the pencil takes focus
 * again, so finishing a rename with the keyboard leaves you where you started
 * instead of at the top of the page.
 */
export function useFacetRename(
  label: string,
  onLabel: (label: string) => void,
  // A row the reviewer just invented opens in edit mode: it arrives called
  // "New category", which is a placeholder rather than a name. Safe as an
  // initial value because a new row is a new React key, so a fresh mount.
  autoEdit?: boolean,
) {
  const [editing, setEditing] = useState(autoEdit);
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  const pencilRef = useRef<HTMLButtonElement>(null);
  // Escape unmounts a focused input, and a browser may fire blur on the way
  // out — which would run `commit` and save the draft Escape just discarded.
  const discarding = useRef(false);
  const wasEditing = useRef(false);

  useEffect(() => {
    if (editing) {
      wasEditing.current = true;
      inputRef.current?.select();
    } else if (wasEditing.current) {
      wasEditing.current = false;
      pencilRef.current?.focus();
    }
  }, [editing]);

  const start = () => {
    discarding.current = false;
    setDraft(label);
    setEditing(true);
  };

  const commit = () => {
    if (!discarding.current) onLabel(draft);
    setEditing(false);
  };

  const cancel = () => {
    discarding.current = true;
    setDraft(label);
    setEditing(false);
  };

  // This input lives inside the review's own form, so a bare Enter would post
  // the review rather than finish the rename.
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  // The cross marks the draft as discarded on mousedown, before the input's
  // blur can commit it.
  const markDiscarding = () => {
    discarding.current = true;
  };

  return {
    editing,
    draft,
    setDraft,
    inputRef,
    pencilRef,
    start,
    commit,
    cancel,
    onKeyDown,
    markDiscarding,
  };
}
