"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Hand, Shuffle } from "lucide-react";
import type { BacklogPick, Platform } from "@/lib/api/types";
import { MemberCover } from "@/components/issue/member-cover";
import { StartPlayingForm } from "@/components/member/start-playing-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Deal three, pick one: the picker's draws laid out face up as a hand of
// cards, HowLongToBeat times side by side. The member keeps one (the first
// draw starts kept) and starts playing it from the bar underneath; dealing
// again redraws the whole hand.

// HowLongToBeat's display strings ("12½ Hours", "30 Mins") as a short
// numeral and unit; anything else is shown as written.
function hltbShort(value: string): { n: string; unit: string } {
  const text = value.replace("½", ".5").trim();
  const match = text.match(/(\d+(?:\.\d+)?)\s*(hours?|mins?)/i);
  if (!match) return { n: value, unit: "" };
  return { n: match[1], unit: /min/i.test(match[2]) ? "m" : "h" };
}

function timesOf(pick: BacklogPick) {
  return [
    { label: "Main", value: pick.hltb?.main },
    { label: "+ Sides", value: pick.hltb?.main_sides },
    { label: "Complete", value: pick.hltb?.completionist },
  ].filter((t): t is { label: string; value: string } => Boolean(t.value));
}

// On screen the first draw sits in the middle of the hand, raised; the
// reading order stays first, second, third.
const SEAT = [
  "sm:col-start-2 sm:z-10",
  "sm:col-start-1 sm:rotate-[-4deg] sm:translate-y-3.5",
  "sm:col-start-3 sm:rotate-[4deg] sm:translate-y-3.5",
];

export function PickDeal({
  userId,
  picks,
  platforms,
  redealHref,
}: {
  userId: string;
  picks: BacklogPick[];
  // Only loaded when a draw has no platform: the member chooses one first.
  platforms?: Platform[];
  redealHref: string;
}) {
  const [kept, setKept] = useState(0);
  const keptPick = picks[kept] ?? picks[0];

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-rule bg-[radial-gradient(ellipse_at_50%_40%,var(--color-ink-3)_0%,var(--color-ink)_70%)] px-0 py-4 max-sm:border-0 max-sm:bg-none sm:px-5 sm:pt-10 sm:pb-8">
        <ol
          aria-label="Your hand"
          className={cn(
            "grid gap-3.5 sm:mx-auto sm:items-end sm:gap-6.5",
            picks.length === 3 && "sm:max-w-[60rem] sm:grid-cols-3",
            picks.length === 2 && "sm:max-w-[40rem] sm:grid-cols-2",
            picks.length === 1 && "sm:max-w-[20rem]",
          )}
        >
          {picks.map((pick, i) => {
            const on = i === kept;
            const game = pick.game;
            const times = timesOf(pick);
            const coverGame = {
              ...game,
              cover_url: game.cover_url ?? pick.hltb?.image_url ?? null,
            };
            return (
              <li
                key={pick.entry_id}
                className={cn(
                  "flex overflow-hidden rounded-lg border bg-ink-2 shadow-[0_18px_40px_rgb(0_0_0/0.5)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] sm:row-start-1 sm:flex-col",
                  picks.length === 3 ? SEAT[i] : "",
                  on
                    ? "border-paper shadow-[0_0_0_2px_var(--color-paper),0_22px_44px_rgb(0_0_0/0.55)] sm:-translate-y-3.5 sm:rotate-0"
                    : "border-rule-strong sm:hover:-translate-y-2",
                )}
              >
                <Link
                  href={`/games/${game.game_id}`}
                  className="group/cover block w-24 shrink-0 sm:w-auto"
                  tabIndex={-1}
                  aria-hidden
                >
                  <MemberCover
                    game={coverGame}
                    platform={pick.platform}
                    className="rounded-none sm:aspect-[4/4.4]"
                    fallbackClassName="text-lg sm:text-3xl"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-3.5 sm:px-4 sm:pt-3.5 sm:pb-4">
                  <h2 className="font-headline text-2xl leading-[0.95] text-balance sm:text-[1.9rem]">
                    <Link
                      href={`/games/${game.game_id}`}
                      className="transition-colors hover:text-highlight"
                    >
                      {game.title}
                    </Link>
                  </h2>
                  <p className="font-label text-[0.75rem] font-bold tracking-[0.06em] text-paper-mute">
                    From your {pick.kind === "backlog" ? "backlog" : "collection"}
                    {pick.platform && <> · {pick.platform.platform_name}</>}
                  </p>
                  {pick.note && (
                    <p className="line-clamp-3 text-[0.84rem] text-paper-dim italic">
                      &ldquo;{pick.note}&rdquo;
                    </p>
                  )}
                  {times.length > 0 ? (
                    <dl className="grid grid-cols-3 border-t border-rule pt-2.5">
                      {times.map((t) => {
                        const { n, unit } = hltbShort(t.value);
                        return (
                          <div key={t.label} className="flex flex-col-reverse gap-1">
                            <dt className="font-label text-[0.68rem] font-extrabold tracking-[0.08em] text-paper-mute">
                              {t.label}
                            </dt>
                            <dd className="font-headline text-[1.6rem] leading-[0.85] sm:text-[1.9rem]">
                              {n}
                              {unit && (
                                <small className="font-label ml-px text-sm font-extrabold">
                                  {unit}
                                </small>
                              )}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  ) : (
                    <p className="font-label border-t border-rule pt-2.5 text-[0.8rem] font-bold tracking-[0.06em] text-paper-mute">
                      No HowLongToBeat times
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setKept(i)}
                    aria-pressed={on}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "mt-auto w-full",
                      on && "border-paper bg-paper text-ink hover:bg-paper/90 hover:text-ink",
                    )}
                  >
                    {on ? (
                      <Check data-icon="inline-start" />
                    ) : (
                      <Hand data-icon="inline-start" />
                    )}
                    {on ? "Kept" : "Keep this one"}
                  </button>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex justify-center sm:mt-9">
          <Link href={redealHref} className={buttonVariants({ variant: "outline" })}>
            <Shuffle data-icon="inline-start" />
            Deal again
          </Link>
        </div>
      </div>

      {keptPick && (
        <section
          aria-label="Start playing"
          className="flex flex-wrap items-end justify-between gap-4 rounded-md border border-rule bg-ink-2 px-4.5 py-4"
        >
          <div className="min-w-0">
            <p className="font-label text-[0.9rem] font-extrabold tracking-[0.06em] text-paper-dim">
              You kept
            </p>
            <p className="font-headline mt-1 text-[1.65rem] leading-none">
              {keptPick.game.title}
            </p>
            {keptPick.hltb?.url && (
              <a
                href={keptPick.hltb.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-label mt-2 inline-flex items-center gap-1 text-xs font-extrabold tracking-[0.08em] text-paper-mute transition-colors hover:text-highlight"
              >
                HowLongToBeat
                <ExternalLink aria-hidden className="size-3" />
              </a>
            )}
          </div>
          <StartPlayingForm
            // A new keep is a new form: its platform choice and error reset.
            key={keptPick.entry_id}
            userId={userId}
            gamedbGameId={keptPick.gamedb_game_id}
            platformId={keptPick.platform_id}
            platforms={platforms}
          />
        </section>
      )}
    </div>
  );
}
