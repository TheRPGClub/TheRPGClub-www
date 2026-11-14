"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import { JOURNAL_BODY_MAX, JOURNAL_TITLE_MAX } from "@/lib/journals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// A journal entry's words: the optional title in Barlow italic over the
// prose, both set on the page's ink inside the open editor.
export function JournalEntryFields({
  title,
  body,
  onTitle,
  onBody,
  disabled,
  autoFocus,
}: {
  title: string;
  body: string;
  onTitle: (title: string) => void;
  onBody: (body: string) => void;
  disabled: boolean;
  autoFocus?: boolean;
}) {
  const ids = useId();
  return (
    <>
      <Label htmlFor={`${ids}-title`} variant="field" className="sr-only">
        Title (optional)
      </Label>
      <Input
        id={`${ids}-title`}
        value={title}
        onChange={(e) => onTitle(e.target.value)}
        maxLength={JOURNAL_TITLE_MAX}
        placeholder="Title (optional)"
        disabled={disabled}
        variant="entry"
        className="mb-2 py-0 text-base font-semibold italic placeholder:font-normal md:text-base"
      />
      <Label htmlFor={`${ids}-body`} variant="field" className="sr-only">
        Entry
      </Label>
      <Textarea
        id={`${ids}-body`}
        value={body}
        onChange={(e) => onBody(e.target.value)}
        maxLength={JOURNAL_BODY_MAX}
        rows={4}
        required
        autoFocus={autoFocus}
        placeholder="Where you are, what happened, what you think of it so far."
        disabled={disabled}
        variant="entry"
        className="inline-block min-h-[88px] px-3 py-2.5 text-[0.98rem] leading-[1.55] field-sizing-fixed md:text-[0.98rem]"
      />
    </>
  );
}

// The editor's foot: Save (and Cancel when the editor can close), and how
// much of each field is used.
export function JournalEntryActions({
  pending,
  onCancel,
  titleLength,
  bodyLength,
}: {
  pending: boolean;
  onCancel?: () => void;
  titleLength: number;
  bodyLength: number;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2.5">
      <Button type="submit" variant="highlight" disabled={pending}>
        <Check aria-hidden />
        {pending ? "Saving" : "Save entry"}
      </Button>
      {onCancel && (
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      )}
      <span className="font-label ml-auto text-[0.78rem] tracking-[0.08em] text-faint-foreground tabular-nums">
        Title {titleLength} / {JOURNAL_TITLE_MAX} · Entry {bodyLength} / {JOURNAL_BODY_MAX}
      </span>
    </div>
  );
}
