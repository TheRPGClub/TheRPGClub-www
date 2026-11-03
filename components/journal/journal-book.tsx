import type { ReactNode } from "react";
import { Chip } from "@/components/issue/chip";
import { cn } from "@/lib/utils";

// The Game Journal's bound volume: a rule-coloured cover board holding ink-2
// pages that darken into the gutter where they meet (the Open Binder and
// Spread rules, set as a book). Shared by the profile's Journal tab, the game
// page's section and the /journals preview so the three read as one book.

export function JournalVolume({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[4px] bg-rule p-1.5 shadow-[0_24px_60px_rgb(0_0_0/0.6)] sm:p-2.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

// A page of the volume. `side` shades the gutter edge once the spread opens
// (from lg); stacked pages stay flat.
export function JournalPage({
  side,
  className,
  children,
  as: Tag = "div",
  ...rest
}: {
  side?: "left" | "right";
  className?: string;
  children: ReactNode;
  as?: "div" | "section" | "nav" | "aside";
  "aria-label"?: string;
  "aria-labelledby"?: string;
}) {
  return (
    <Tag
      {...rest}
      className={cn(
        "relative flex min-w-0 flex-col rounded-md bg-ink-2",
        side === "left" && "lg:shadow-[inset_-22px_0_26px_-18px_rgb(0_0_0/0.7)]",
        side === "right" && "lg:shadow-[inset_22px_0_26px_-18px_rgb(0_0_0/0.7)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// The running head across a page's top: label voice, red slashes between
// parts (the running-head separator), and a note on the right.
export function JournalRunningHead({
  parts,
  note,
  className,
}: {
  parts: ReactNode[];
  note?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-label flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-rule pt-2.5 pb-2 text-[0.78rem] tracking-[0.08em] text-paper-mute",
        className,
      )}
    >
      {parts.map((part, i) => (
        <span key={i} className="contents">
          {i > 0 && (
            <b aria-hidden className="font-bold text-gotm">
              /
            </b>
          )}
          <span className="min-w-0 truncate">{part}</span>
        </span>
      ))}
      {note && <span className="ml-auto">{note}</span>}
    </div>
  );
}

// The page foot: page number, where you are, and the turn.
export function JournalFolio({
  page,
  children,
  action,
  className,
}: {
  page?: number;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-label mt-auto flex flex-wrap items-center gap-x-2.5 gap-y-2 pt-2.5 text-[0.8rem] tracking-[0.08em] text-paper-mute",
        className,
      )}
    >
      {page != null && (
        <span className="font-headline text-[1.1rem] tracking-normal text-paper-dim">
          {page}
        </span>
      )}
      {children}
      {action && <span className="ml-auto flex gap-1.5">{action}</span>}
    </div>
  );
}

// The marks a chapter carries from the member's lists.
export function ChapterMarks({
  nowPlaying,
  completed,
  className,
}: {
  nowPlaying?: boolean;
  completed?: boolean;
  className?: string;
}) {
  if (!nowPlaying && !completed) return null;
  return (
    <>
      {nowPlaying && <Chip className={className}>Now Playing</Chip>}
      {completed && (
        <Chip className={cn("bg-rarity-uncommon text-ink", className)}>Game Completion</Chip>
      )}
    </>
  );
}
