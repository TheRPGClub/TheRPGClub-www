"use client";

import { useState } from "react";
import { saveCodexLinksAction } from "@/app/actions/codex-links";
import { addLink, linkIds, removeLink, sameLinks } from "@/lib/codex/see-also";
import type { CodexEntryLink } from "@/lib/codex/types";

// An entry's See also while a form edits it (www#127): the links on the
// form, and the save that sends them once the entry itself is saved (a new
// entry needs its id first). Only a changed list is sent; once it saves,
// that list is the one to compare against, so saving again after a later
// step failed doesn't send it twice.
export function useDeskLinks(initial: readonly CodexEntryLink[], onChange?: () => void) {
  const [links, setLinks] = useState<CodexEntryLink[]>(() => [...initial]);
  const [saved, setSaved] = useState<CodexEntryLink[]>(() => [...initial]);
  const changed = !sameLinks(links, saved);

  function add(link: CodexEntryLink, self: number | null) {
    setLinks((list) => addLink(list, link, self));
    onChange?.();
  }

  function remove(id: number) {
    setLinks((list) => removeLink(list, id));
    onChange?.();
  }

  function reset(next: readonly CodexEntryLink[] = []) {
    setLinks([...next]);
    setSaved([...next]);
  }

  // Sends the links for entry `id` when they changed (or, for an entry just
  // created, when there are any). Null when saved or nothing to send, else
  // the reason.
  async function save(id: number): Promise<string | null> {
    if (!changed) return null;
    const result = await saveCodexLinksAction(id, linkIds(links)).catch(() => null);
    if (!result) return "Couldn't reach the site. Try again.";
    if (!result.ok) return result.error ?? "See also didn't save. Try again.";
    setSaved(links);
    return null;
  }

  return { links, changed, add, remove, reset, save };
}

export type DeskLinks = ReturnType<typeof useDeskLinks>;
