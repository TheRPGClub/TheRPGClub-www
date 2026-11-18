"use client";

import { useId, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { useFunFactComposer } from "@/hooks/use-fun-fact-composer";
import type { DeskLinks } from "@/hooks/use-desk-links";
import { FUN_FACT_MAX, type PickedMention } from "@/lib/codex/fun-fact-text";
import type { FunFactActionResult } from "@/app/actions/codex-fun-facts";
import type { CodexEntryLink } from "@/lib/codex/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MentionList } from "./mention-list";
import { FunFactSeeAlsoPanel, SeeAlsoToggle } from "./fun-fact-see-also";

// The Fun Fact field (5D): plain text with @ mentions, its count against the
// 300 characters the API keeps (mentions counted as they're stored), and a
// row of actions led by See also (www#127), whose picker opens under the
// field. `actions` gets whether the text can be sent and whether it's being
// sent; the submit button inside it submits the form. The state and the
// sending live in hooks/use-fun-fact-composer.ts.
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
  const { field, picker, links, length, over, ready, pending, error, seeAlso, toggleSeeAlso, submit, retryLinks } =
    useFunFactComposer({ initial, initialLinks, onSave, resetOnSave });

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
        <p role="alert" className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-destructive">
          {error}
          {retryLinks && (
            <Button type="button" variant="ghost" size="xs" disabled={pending} onClick={retryLinks}>
              <RotateCcw aria-hidden />
              Retry See also
            </Button>
          )}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SeeAlsoToggle links={links} open={seeAlso} onToggle={toggleSeeAlso} controls={`${id}-see-also`} />
        {actions({ ready: ready, pending: pending })}
      </div>
      {seeAlso && <FunFactSeeAlsoPanel id={`${id}-see-also`} links={links} self={self} />}
    </form>
  );
}
