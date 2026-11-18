"use client";

import { useRef, useState, useTransition } from "react";
import type { FunFactActionResult } from "@/app/actions/codex-fun-facts";
import { FUN_FACT_MAX, type PickedMention } from "@/lib/codex/fun-fact-text";
import type { CodexEntryLink } from "@/lib/codex/types";
import { useDeskLinks, type DeskLinks } from "./use-desk-links";
import { useMentionPicker } from "./use-mention-picker";

// The Fun Fact field's state (5D, www#124, www#127): its text with @
// mentions, its count against the 300 characters, its See also links, and
// sending them. `onSave` gets the links too, to save once the Fun Fact is; a
// result that is ok with an `error` saved the Fun Fact but not its links.
//
// When adding (`resetOnSave`), a saved Fun Fact clears the field. If its
// links didn't save, they stay on the form with Retry See also, which sends
// them to the Fun Fact just added; adding another Fun Fact instead takes
// them with it.
export function useFunFactComposer({
  initial,
  initialLinks,
  onSave,
  resetOnSave,
}: {
  initial: { text: string; picked: PickedMention[] };
  initialLinks: readonly CodexEntryLink[];
  onSave: (body: string, links: DeskLinks) => Promise<FunFactActionResult>;
  resetOnSave: boolean;
}) {
  const field = useRef<HTMLTextAreaElement>(null);
  const picker = useMentionPicker(initial, field);
  const links = useDeskLinks(initialLinks);
  const [error, setError] = useState<string | null>(null);
  const [seeAlso, setSeeAlso] = useState(false);
  // The Fun Fact just added whose links didn't save.
  const [retryFor, setRetryFor] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const length = picker.encoded.trim().length;
  const over = length > FUN_FACT_MAX;
  const ready = length > 0 && !over && !pending;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready) return;
    setError(null);
    setRetryFor(null);
    startTransition(async () => {
      const result = await onSave(picker.encoded.trim(), links).catch(() => null);
      if (!result) return setError("Couldn't reach the site. Check your connection and try again.");
      if (!result.ok) return setError(result.error ?? "That didn't save. Try again.");
      if (resetOnSave) {
        picker.reset();
        if (result.error && result.id) {
          setRetryFor(result.id);
        } else {
          links.reset();
          setSeeAlso(false);
        }
      }
      if (result.error) setError(result.error);
    });
  }

  function retryLinks() {
    if (retryFor === null) return;
    startTransition(async () => {
      const linkError = await links.save(retryFor);
      if (linkError) return setError(`The Fun Fact is added, but See also isn't: ${linkError}`);
      links.reset();
      setSeeAlso(false);
      setRetryFor(null);
      setError(null);
    });
  }

  return {
    field,
    picker,
    links,
    error,
    seeAlso,
    toggleSeeAlso: () => setSeeAlso((open) => !open),
    pending,
    length,
    over,
    ready,
    submit,
    retryLinks: retryFor !== null ? retryLinks : null,
  };
}
