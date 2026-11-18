"use client";

import { useEffect, useState, type KeyboardEvent, type RefObject } from "react";
import { RangeApi, type TText } from "platejs";
import { useEditorRef, useEditorSelector } from "platejs/react";
import type { User } from "@/lib/api/types";
import { memberName } from "@/lib/achievements";
import { mentionQuery } from "@/lib/codex/fun-fact-text";
import { MENTION_TYPE, type MentionNode } from "@/lib/codex/story-schema";
import { useMemberSearch } from "@/hooks/use-member-search";

// The @ mention picker in a Club Codex story (5D, www#125): typing "@" and
// two letters of a name, at the start of a line or after a space, searches
// the club's members; arrow keys move, Enter or Tab mentions the lit one,
// Escape closes. A pick replaces the "@..." with a mention node carrying the
// member's Discord id. `frame` is the element the list is positioned in.
export function useStoryMention(frame: RefObject<HTMLElement | null>) {
  const editor = useEditorRef();
  // "path|start|caret|query" while the caret is in an "@...", else null; a
  // string so the selector only re-renders when it changes.
  const at = useEditorSelector((ed) => {
    const sel = ed.selection;
    if (!sel || !RangeApi.isCollapsed(sel)) return null;
    const entry = ed.api.node(sel.anchor.path);
    const text = (entry?.[0] as TText | undefined)?.text;
    if (typeof text !== "string") return null;
    const q = mentionQuery(text, sel.anchor.offset);
    return q ? `${sel.anchor.path.join(".")}|${q.start}|${sel.anchor.offset}|${q.query}` : null;
  }, []);
  const [lit, setLit] = useState(0);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [place, setPlace] = useState<{ top: number; left: number } | null>(null);

  const [pathKey, startText, caretText, query = ""] = at?.split("|") ?? [];
  const path = pathKey ? pathKey.split(".").map(Number) : null;
  const start = Number(startText);
  const caret = Number(caretText);
  const search = useMemberSearch(query);
  const anchorKey = at ? `${pathKey}|${startText}` : null;
  const open = at !== null && anchorKey !== dismissed && search.hasQuery;
  const results = search.settled ? search.results.slice(0, 6) : [];

  // The list hangs under the "@", measured once the editor has drawn it.
  useEffect(() => {
    if (!open || !path) return;
    const frameId = requestAnimationFrame(() => {
      const point = { path, offset: start };
      const rect = editor.api.toDOMRange({ anchor: point, focus: point })?.getBoundingClientRect();
      const box = frame.current?.getBoundingClientRect();
      if (rect && box) setPlace({ top: rect.bottom - box.top + 4, left: Math.max(0, rect.left - box.left) });
    });
    return () => cancelAnimationFrame(frameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- placed again whenever the "@" moves (anchorKey)
  }, [open, anchorKey]);

  function pick(user: User) {
    if (!path) return;
    const mention: MentionNode = { type: MENTION_TYPE, userId: user.user_id, value: memberName(user), children: [{ text: "" }] };
    editor.tf.select({ anchor: { path, offset: start }, focus: { path, offset: caret } });
    editor.tf.delete();
    editor.tf.insertNodes(mention as never);
    editor.tf.move();
    editor.tf.insertText(" ");
    editor.tf.focus();
    setLit(0);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setDismissed(anchorKey);
    } else if (results.length > 0 && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setLit((i) => (i + step + results.length) % results.length);
    } else if (results.length > 0 && (event.key === "Enter" || event.key === "Tab")) {
      event.preventDefault();
      pick(results[Math.min(lit, results.length - 1)]);
    }
  }

  // "@" from the toolbar: starts a mention at the caret.
  function begin() {
    editor.tf.focus();
    const sel = editor.selection;
    const before = sel ? editor.api.string({ anchor: { path: sel.anchor.path, offset: 0 }, focus: sel.anchor }) : "";
    editor.tf.insertText(before === "" || /\s$/.test(before) ? "@" : " @");
  }

  return {
    open,
    results,
    lit: Math.min(lit, Math.max(results.length - 1, 0)),
    settled: search.settled,
    error: search.error,
    place,
    pick,
    onKeyDown,
    begin,
  };
}

export type StoryMention = ReturnType<typeof useStoryMention>;
