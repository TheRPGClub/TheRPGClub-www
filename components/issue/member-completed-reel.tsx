"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { GameCompletion } from "@/lib/api/types";
import { MemberCover } from "@/components/issue/member-cover";
import {
  completionMonth,
  monthLabel,
  playtimeHours,
} from "@/components/member/member-lists";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Completed games as a spotlight and a filmstrip: the selected completion
// fills a key-art spotlight with everything the list knows about it, and the
// page's completions run below as frames grouped by month. On a phone the
// strip is a grid of frames, never a sideways scroll.

export interface ReelGroup {
  key: string;
  label: string;
  entries: { entry: GameCompletion; index: number }[];
}

function groupByMonth(entries: GameCompletion[]): ReelGroup[] {
  const groups: ReelGroup[] = [];
  entries.forEach((entry, index) => {
    const key = completionMonth(entry.completed_at) ?? "undated";
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = {
        key,
        label: key === "undated" ? "No date" : monthLabel(key),
        entries: [],
      };
      groups.push(group);
    }
    group.entries.push({ entry, index });
  });
  return groups;
}

function finishedOn(iso: string | null): { big: string; small: string } | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return {
    big: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }),
    small: `${date.getUTCFullYear()} · Finished`,
  };
}

export function CompletedReel({
  entries,
  ownerName,
  // Where this page's first entry sits in the whole filtered list.
  offset,
  total,
}: {
  entries: GameCompletion[];
  ownerName: string;
  offset: number;
  total: number;
}) {
  const [selected, setSelected] = useState(0);
  const spotRef = useRef<HTMLElement>(null);
  const groups = groupByMonth(entries);
  const current = entries[Math.min(selected, entries.length - 1)];
  if (!current) return null;

  const game = current.game;
  const title = game?.title ?? "Unknown game";
  const art = game?.art_url ?? game?.cover_url ?? null;
  const finished = finishedOn(current.completed_at);
  const hours = playtimeHours(current.final_playtime_hrs);
  const platform =
    current.platform?.platform_abbreviation ??
    current.platform?.platform_code ??
    current.platform?.platform_name ??
    null;
  const facts = [
    finished && { big: finished.big, small: finished.small },
    hours && { big: hours, small: "Final playtime" },
    platform && { big: platform, small: "Platform" },
    current.completion_type && {
      big: current.completion_type,
      small: "Completion",
    },
  ].filter((f): f is { big: string; small: string } => Boolean(f));

  const pick = (index: number) => {
    setSelected(index);
    const spot = spotRef.current;
    if (!spot) return;
    // Bring the spotlight back into view when the strip has scrolled it off
    // (always the case on a phone, where the frames stack below it).
    const top = spot.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.5) {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      spot.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  };
  const step = (delta: number) =>
    setSelected((i) => (i + delta + entries.length) % entries.length);

  return (
    <div className="min-w-0 space-y-7">
      <section
        ref={spotRef}
        aria-label="Selected completion"
        aria-live="polite"
        className="relative isolate grid scroll-mt-20 items-end gap-4 overflow-hidden rounded-md bg-black p-4.5 sm:min-h-[23.75rem] sm:grid-cols-[11rem_1fr] sm:gap-7.5 sm:p-7.5 xl:grid-cols-[14.375rem_1fr_auto]"
      >
        {art && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={art}
            src={art}
            alt=""
            className="absolute inset-0 -z-20 size-full object-cover object-[50%_30%] motion-safe:animate-in motion-safe:zoom-in-105 motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
        )}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 -z-10",
            art
              ? "bg-[linear-gradient(90deg,rgb(11_11_13/0.94)_0%,rgb(11_11_13/0.8)_45%,rgb(11_11_13/0.35)_100%),linear-gradient(0deg,rgb(11_11_13/0.85),transparent_55%)]"
              : "bg-ink-2",
          )}
        />
        <MemberCover
          game={game}
          title={title}
          className="w-30 shadow-[0_14px_34px_rgb(0_0_0/0.55)] sm:w-full"
          fallbackClassName="text-2xl"
        />
        <div className="min-w-0">
          <h2 className="font-headline max-w-[14ch] text-[2.75rem] leading-[0.88] text-balance break-words sm:text-6xl xl:text-[5.25rem]">
            {title}
          </h2>
          {facts.length > 0 && (
            <dl className="mt-5 flex flex-wrap gap-x-6.5 gap-y-3.5">
              {facts.map((fact) => (
                <div key={fact.small} className="flex flex-col-reverse gap-1">
                  <dt className="font-label text-[0.8rem] font-extrabold tracking-[0.08em] text-paper-dim">
                    {fact.small}
                  </dt>
                  <dd className="font-headline text-[1.9rem] leading-[0.85] sm:text-[2.5rem]">
                    {fact.big}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {current.note && (
            <blockquote className="mt-4.5 max-w-[52ch] text-base text-paper italic">
              &ldquo;{current.note}&rdquo;
              <footer className="font-label mt-1 text-xs font-extrabold tracking-[0.1em] text-paper-mute not-italic">
                {ownerName}&apos;s note
              </footer>
            </blockquote>
          )}
        </div>
        <div className="flex items-center gap-2 sm:col-span-2 xl:col-span-1 xl:flex-col xl:items-end">
          {entries.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous completion"
                className="grid size-10.5 place-items-center rounded-sm bg-ink/70 text-paper shadow-[inset_0_0_0_1px_var(--color-rule-strong)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--color-paper-mute)] focus-visible:outline-2 focus-visible:outline-highlight"
              >
                <ChevronLeft aria-hidden className="size-4.5" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next completion"
                className="grid size-10.5 place-items-center rounded-sm bg-ink/70 text-paper shadow-[inset_0_0_0_1px_var(--color-rule-strong)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--color-paper-mute)] focus-visible:outline-2 focus-visible:outline-highlight"
              >
                <ChevronRight aria-hidden className="size-4.5" />
              </button>
            </div>
          )}
          <p className="font-label text-[0.82rem] font-extrabold tracking-[0.1em] text-paper-mute">
            <b className="text-paper">{offset + selected + 1}</b> of {total}
          </p>
          {game && (
            <Link
              href={`/games/${game.game_id}`}
              className={cn(buttonVariants({ variant: "outline" }), "ml-auto bg-ink/70 xl:ml-0")}
            >
              View game
              <ArrowRight data-icon="inline-end" />
            </Link>
          )}
        </div>
      </section>

      <div
        role="list"
        aria-label="Completions by month"
        className="space-y-6 md:flex md:gap-5.5 md:space-y-0 md:overflow-x-auto md:px-0.5 md:pt-3 md:pb-3.5 md:[scrollbar-color:var(--color-rule-strong)_transparent]"
      >
        {groups.map((group) => (
          <section
            key={group.key}
            id={`m-${group.key}`}
            role="listitem"
            aria-label={group.label}
            className="flex scroll-mt-24 flex-col gap-2.5 md:shrink-0"
          >
            <h3 className="font-label border-b border-rule pb-1.5 text-[0.84rem] font-extrabold tracking-[0.1em] text-paper-mute">
              <span className="text-paper">{group.label}</span>
              <span className="ml-2">{group.entries.length}</span>
            </h3>
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:flex">
              {group.entries.map(({ entry, index }) => {
                const on = index === selected;
                const name = entry.game?.title ?? "Unknown game";
                return (
                  <li key={entry.completion_id} className="md:w-26">
                    <button
                      type="button"
                      onClick={() => pick(index)}
                      aria-pressed={on}
                      className="group/cover relative block w-full text-left focus-visible:outline-none"
                    >
                      {on && (
                        <span
                          aria-hidden
                          className="absolute -top-3 left-1/2 hidden -translate-x-1/2 border-[6px] border-transparent border-t-paper md:block"
                        />
                      )}
                      <MemberCover
                        game={entry.game}
                        title={name}
                        className={cn(
                          "transition-[transform,box-shadow] duration-200 group-hover/cover:-translate-y-1 group-focus-visible/cover:shadow-[0_0_0_3px_var(--color-highlight)]",
                          on && "shadow-[0_0_0_3px_var(--color-paper)]",
                        )}
                        fallbackClassName="text-sm p-1.5"
                      />
                      <span
                        className={cn(
                          "font-label mt-1.5 line-clamp-2 block text-[0.8rem] leading-tight font-bold",
                          on ? "text-paper" : "text-paper-dim",
                        )}
                      >
                        {name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
