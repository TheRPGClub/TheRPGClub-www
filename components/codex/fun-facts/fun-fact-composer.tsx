"use client";

import { useId, useRef, useState, useTransition, type ReactNode } from "react";
import { useMentionPicker } from "@/hooks/use-mention-picker";
import { useDeskLinks, type DeskLinks } from "@/hooks/use-desk-links";
import { FUN_FACT_MAX, type PickedMention } from "@/lib/codex/fun-fact-text";
import type { FunFactActionResult } from "@/app/actions/codex-fun-facts";
import type { CodexEntryLink } from "@/lib/codex/types";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { MentionList } from "./mention-list";
import { FunFactSeeAlsoPanel, SeeAlsoToggle } from "./fun-fact-see-also";

// The Fun Fact field (5D): plain text with @ mentions, its count against the
// 300 characters the API keeps (mentions counted as they're stored), and a
// row of actions led by See also (www#127), whose picker opens under the
// field. `actions` gets whether the text can be sent and whether it's being
// sent; the submit button inside it submits the form. `onSave` gets the
// links too, to save once the Fun Fact is; a result that is ok with an
// `error` saved the Fun Fact but not all of the rest, and says so.
export function FunFactComposer({
  label,
  initial = { text: "", picked: [] },
  initialLinks = [],
  self = null,
  onSave,
  resetOnSave = false,
  autoFocus,
  actions,
}: {
  label: string;
  initial?: { text: string; picked: PickedMention[] };
  initialLinks?: readonly CodexEntryLink[];
  // The Fun Fact being edited, which the See also search leaves out.
  self?: number | null;
  onSave: (body: string, links: DeskLinks) => Promise<FunFactActionResult>;
  resetOnSave?: boolean;
  autoFocus?: boolean;
  actions: (state: { ready: boolean; pending: boolean }) => ReactNode;
}) {
  const id = useId();
  const field = useRef<HTMLTextAreaElement>(null);
  const picker = useMentionPicker(initial, field);
  const [error, setError] = useState<string | null>(null);
  const links = useDeskLinks(initialLinks);
  const [seeAlso, setSeeAlso] = useState(false);
  const [pending, startTransition] = useTransition();
  const length = picker.encoded.trim().length;
  const over = length > FUN_FACT_MAX;
  const ready = length > 0 && !over && !pending;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready) return;
    setError(null);
    startTransition(async () => {
      const result = await onSave(picker.encoded.trim(), links);
      if (!result.ok) return setError(result.error ?? "That didn't save. Try again.");
      if (resetOnSave) {
        picker.reset();
        links.reset();
        setSeeAlso(false);
      }
      if (result.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={submit} aria-label={label}>
      <div className="relative">
        <Textarea
          ref={field}
          variant="entry"
          value={picker.text}
          onChange={(e) => picker.sync(e.currentTarget)}
          onSelect={(e) => picker.sync(e.currentTarget)}
          onKeyDown={picker.onKeyDown}
          autoFocus={autoFocus}
          rows={3}
          aria-label={label}
          aria-invalid={over || undefined}
          aria-describedby={`${id}-count`}
          role="combobox"
          aria-expanded={picker.open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={picker.open && picker.results.length > 0 ? `${id}-list-${picker.lit}` : undefined}
          placeholder="One or two sentences. Type @ to mention a member."
          className="min-h-19 px-3.5 py-3 text-base leading-[1.55] md:text-base"
        />
        <MentionList picker={picker} id={`${id}-list`} />
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-3 px-0.5 text-[0.8125rem] text-faint-foreground">
        <span>Plain text, no images.</span>
        <span
          id={`${id}-count`}
          aria-live="polite"
          className={cn("font-label font-bold tracking-[0.08em] whitespace-nowrap", over && "text-destructive")}
        >
          <b className={cn("text-foreground", over && "text-destructive")}>{length}</b> / {FUN_FACT_MAX}
        </span>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SeeAlsoToggle links={links} open={seeAlso} onToggle={() => setSeeAlso((v) => !v)} controls={`${id}-see-also`} />
        {actions({ ready, pending })}
      </div>
      {seeAlso && <FunFactSeeAlsoPanel id={`${id}-see-also`} links={links} self={self} />}
    </form>
  );
}
