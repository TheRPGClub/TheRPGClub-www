import type { ReactNode } from "react";
import type { JournalEntry } from "@/lib/api/types";
import { editedLabel, journalDate } from "@/lib/journals";
import { cn } from "@/lib/utils";

// One journal entry as the book sets it: the optional title in Barlow italic
// (like a review heading), "Entry N · Oct 31" in the label voice, "Edited"
// when it changed, then the prose. `actions` is the owner's Edit and Delete.

export function JournalEntryHead({
  entry,
  number,
  actions,
  selected,
  withYear,
}: {
  entry: JournalEntry;
  number?: number | null;
  actions?: ReactNode;
  selected?: boolean;
  withYear?: boolean;
}) {
  const date = journalDate(entry.created_at, withYear);
  const edited = editedLabel(entry);
  const label = [number != null ? `Entry ${number}` : null, date].filter(Boolean).join(" · ");
  return (
    <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1">
      {entry.entry_title && (
        <h3 className="text-[1.02rem] leading-snug font-semibold text-paper italic">
          {entry.entry_title}
        </h3>
      )}
      <span
        className={cn(
          "font-label text-[0.8rem] tracking-[0.08em] whitespace-nowrap",
          selected ? "text-highlight" : "text-paper-mute",
        )}
      >
        <time dateTime={entry.created_at}>{label}</time>
      </span>
      {edited && (
        <span className="font-label text-[0.76rem] tracking-[0.08em] text-paper-mute">
          {edited}
        </span>
      )}
      {actions && <div className="ml-auto flex gap-0.5">{actions}</div>}
    </div>
  );
}

export function JournalEntryProse({
  body,
  clamp,
  className,
}: {
  body: string;
  clamp?: 2 | 3;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "max-w-[68ch] text-[0.95rem] leading-[1.55] whitespace-pre-line text-paper-dim",
        clamp === 2 && "line-clamp-2",
        clamp === 3 && "line-clamp-3",
        className,
      )}
    >
      {body}
    </p>
  );
}

export function JournalEntryView({
  entry,
  number,
  actions,
  selected,
  clamp,
  withYear,
  className,
}: {
  entry: JournalEntry;
  number?: number | null;
  actions?: ReactNode;
  selected?: boolean;
  clamp?: 2 | 3;
  withYear?: boolean;
  className?: string;
}) {
  return (
    <article className={className} aria-current={selected ? "true" : undefined}>
      <JournalEntryHead
        entry={entry}
        number={number}
        actions={actions}
        selected={selected}
        withYear={withYear}
      />
      <JournalEntryProse body={entry.entry_body} clamp={clamp} />
    </article>
  );
}
