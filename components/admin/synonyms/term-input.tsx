"use client";

import { useId, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { addSynonymTerms } from "@/lib/synonyms";
import { cn } from "@/lib/utils";

// A row of term chips with a text box at the end. Enter or a comma adds what
// is typed; a paste with commas or line breaks adds each piece; Backspace in
// an empty box takes the last chip off. A term with the same search key as
// one already there is not added twice. The typed text that has not been
// added yet is `pending`, so the form can save it too.
export function TermInput({
  terms,
  onTermsChange,
  pending,
  onPendingChange,
  disabled,
  autoFocus,
  id,
}: {
  terms: readonly string[];
  onTermsChange: (terms: string[]) => void;
  pending: string;
  onPendingChange: (text: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  id?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = useId();

  const commit = (text: string) => {
    onTermsChange(addSynonymTerms(terms, text));
    onPendingChange("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (pending.trim()) commit(pending);
    } else if (e.key === "Backspace" && pending === "" && terms.length > 0) {
      e.preventDefault();
      onTermsChange(terms.slice(0, -1));
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!/[\n,;|]/.test(text)) return;
    e.preventDefault();
    commit(pending + text);
  };

  return (
    <div
      className={cn(
        "flex min-h-9 flex-wrap items-center gap-1.5 rounded-sm border border-rule-strong bg-ink px-2 py-[5px] text-[0.9rem]",
        "focus-within:border-highlight focus-within:ring-2 focus-within:ring-highlight/40",
        disabled && "opacity-50",
      )}
      onClick={() => inputRef.current?.focus()}
    >
      <ul className="contents" aria-label={`Terms added: ${terms.length}`}>
        {terms.map((term, i) => (
          <li
            key={`${term}-${i}`}
            className="inline-flex max-w-full items-center gap-1 rounded-xs bg-paper/12 py-px pr-1 pl-2 break-all"
          >
            {term}
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                onTermsChange(terms.filter((_, j) => j !== i));
                inputRef.current?.focus();
              }}
              aria-label={`Remove ${term}`}
              className="grid size-5 shrink-0 place-items-center rounded-xs text-paper-dim hover:bg-paper/15 hover:text-paper"
            >
              <X className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <input
        ref={inputRef}
        id={id}
        value={pending}
        onChange={(e) => onPendingChange(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-describedby={hintId}
        placeholder={terms.length === 0 ? "Type a term, then Enter" : ""}
        className="h-6 min-w-24 flex-1 bg-transparent caret-highlight outline-none placeholder:text-muted-foreground"
      />
      <span id={hintId} className="sr-only">
        Enter or a comma adds a term. Backspace in an empty box removes the last one.
      </span>
    </div>
  );
}
