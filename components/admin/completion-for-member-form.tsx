"use client";

import { useEffect, useId, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Plus } from "lucide-react";
import {
  logCompletionForMemberAction,
  memberYearCompletionCountAction,
} from "@/app/actions/admin-completions";
import type { Game, Platform, User } from "@/lib/api/types";
import { memberName } from "@/lib/achievements";
import { completionAnnouncement, completionYear, COMPLETION_NOTE_MAX } from "@/lib/completions";
import { COMPLETION_TYPES, parsePlaytime, todayDate } from "@/lib/imports/completionator";
import { ProofCard } from "@/components/admin/desk/proof-card";
import { CompletionProof } from "@/components/admin/completion-proof";
import { MemberPicker } from "@/components/admin/member-picker";
import { EDIT_SELECT_CLASS } from "@/components/member/game-list-editor";
import { GamePicker } from "@/components/member/game-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DateChoice = "today" | "unknown" | "custom";

const DATE_CHOICES: readonly [DateChoice, string][] = [
  ["today", "Today"],
  ["unknown", "No date"],
  ["custom", "Pick a date"],
];

const LABEL = "font-label block text-[0.82rem] tracking-[0.08em] text-faint-foreground";

interface Sent {
  member: User;
  game: Game;
  completionId: number;
  announced: boolean;
  jobId: number | null;
}

export interface CompletionForMemberFormProps {
  // The signed-in Superadmin, as the bot names them in the post.
  actorName: string;
  platforms: Platform[];
  igdbBlockedReason: string | null;
}

// The Superadmin's Game Completion for another member: member and game on
// the left with the usual completion fields and the announce option, the
// proof of the bot's post on the right. Once sent the proof is stamped and
// follows the announcement job; "Log another" starts a fresh form.
export function CompletionForMemberForm(props: CompletionForMemberFormProps) {
  const [round, setRound] = useState(0);
  return <CompletionForm key={round} {...props} onRestart={() => setRound((n) => n + 1)} />;
}

function CompletionForm({
  actorName,
  platforms,
  igdbBlockedReason,
  onRestart,
}: CompletionForMemberFormProps & { onRestart: () => void }) {
  const memberLabelId = useId();
  const [member, setMember] = useState<User | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [completionType, setCompletionType] = useState<string>(COMPLETION_TYPES[0]);
  const [platformId, setPlatformId] = useState("");
  const [dateChoice, setDateChoice] = useState<DateChoice>("today");
  const [customDate, setCustomDate] = useState("");
  const [playtime, setPlaytime] = useState("");
  const [note, setNote] = useState("");
  const [announce, setAnnounce] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<Sent | null>(null);
  const [pending, startTransition] = useTransition();
  // The member's completions so far in the completion's year, keyed so a
  // stale read for another member or year is never shown.
  const [yearCount, setYearCount] = useState<{ key: string; count: number | null } | null>(null);

  const completedOn = dateChoice === "today" ? todayDate() : dateChoice === "custom" ? customDate : "";
  const year = completionYear(completedOn);
  const countKey = member ? `${member.user_id}:${year}` : null;

  useEffect(() => {
    if (!member || !countKey) return;
    let cancelled = false;
    memberYearCompletionCountAction(member.user_id, year)
      .catch(() => null)
      .then((count) => {
        if (!cancelled) setYearCount({ key: countKey, count });
      });
    return () => {
      cancelled = true;
    };
  }, [member, year, countKey]);

  const playtimeParsed = parsePlaytime(playtime);
  const playtimeHours = playtimeParsed.ok ? playtimeParsed.value : null;
  const knownCount = yearCount && yearCount.key === countKey ? yearCount.count : null;

  const announcement = useMemo(
    () =>
      member && game
        ? completionAnnouncement({
            member: memberName(member),
            actor: actorName,
            title: game.title,
            completionType,
            date: completedOn,
            playtimeHours,
            // The post counts the new completion too.
            yearlyCount: knownCount === null ? null : knownCount + 1,
          })
        : null,
    [member, game, actorName, completionType, completedOn, playtimeHours, knownCount],
  );

  const gamePlatformIds = new Set((game?.platforms ?? []).map((p) => p.platform_id));
  const gamePlatforms = platforms.filter((p) => gamePlatformIds.has(p.platform_id));
  const otherPlatforms = platforms.filter((p) => !gamePlatformIds.has(p.platform_id));

  const pickGame = (picked: Game) => {
    setGame(picked);
    const ids = (picked.platforms ?? []).map((p) => p.platform_id);
    setPlatformId(ids.length === 1 ? String(ids[0]) : "");
  };

  const locked = pending || sent !== null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return setError("Pick a member first.");
    if (!game) return setError("Pick a game first.");
    if (dateChoice === "custom" && !/^\d{4}-\d{2}-\d{2}$/.test(customDate)) {
      return setError("Pick the date they finished it.");
    }
    if (!playtimeParsed.ok) return setError("Final playtime must be a non-negative number of hours.");
    if (note.trim().length > COMPLETION_NOTE_MAX) {
      return setError(`The note must be ${COMPLETION_NOTE_MAX} characters or fewer.`);
    }
    setError(null);
    startTransition(async () => {
      let result;
      try {
        result = await logCompletionForMemberAction({
          userId: member.user_id,
          gameId: game.game_id,
          completionType,
          platformId: platformId ? Number(platformId) : null,
          completedOn,
          playtimeHours,
          note,
          announce,
        });
      } catch {
        setError("Couldn't reach the club's server. Try again.");
        return;
      }
      if (!result.ok || !result.completionId) {
        setError(result.error ?? "Couldn't log it.");
        return;
      }
      setSent({
        member,
        game,
        completionId: result.completionId,
        announced: announce,
        jobId: result.jobId ?? null,
      });
    });
  };

  const proof = (
    <CompletionProof
      announcement={announcement}
      title={game?.title ?? null}
      coverUrl={game?.cover_url ?? null}
      muted={!announce}
    />
  );

  return (
    <div className="mt-6 grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_30rem]">
      <form onSubmit={submit} className="min-w-0 space-y-6" aria-describedby={error ? "completion-error" : undefined}>
        <div>
          <span id={memberLabelId} className={LABEL}>
            Member
          </span>
          <MemberPicker
            value={member}
            onChange={(picked) => {
              setMember(picked);
              setError(null);
            }}
            disabled={locked}
            autoFocus
            labelId={memberLabelId}
          />
        </div>

        <div className="space-y-1.5">
          <span className={LABEL}>Game</span>
          {locked && game ? (
            <p className="flex h-9 items-center rounded-sm border border-border bg-muted px-3 text-sm font-semibold">
              {game.title}
            </p>
          ) : (
            <GamePicker
              compact
              onPick={pickGame}
              initialSelection={game}
              placeholder="Search games…"
              igdbFallback={{ listLabel: "Completed games", blockedReason: igdbBlockedReason }}
            />
          )}
        </div>

        <fieldset disabled={locked} className="grid gap-x-5 gap-y-5 border-t border-border pt-5 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={LABEL}>Completion type</span>
            <select
              value={completionType}
              onChange={(e) => setCompletionType(e.target.value)}
              className={EDIT_SELECT_CLASS}
            >
              {COMPLETION_TYPES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className={LABEL}>Platform</span>
            <select
              value={platformId}
              onChange={(e) => setPlatformId(e.target.value)}
              className={EDIT_SELECT_CLASS}
            >
              <option value="">No platform</option>
              {gamePlatforms.length > 0 && (
                <optgroup label={`${game?.title ?? "This game"} is on`}>
                  {gamePlatforms.map((p) => (
                    <option key={p.platform_id} value={String(p.platform_id)}>
                      {p.platform_name}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label={gamePlatforms.length > 0 ? "Other platforms" : "Platforms"}>
                {otherPlatforms.map((p) => (
                  <option key={p.platform_id} value={String(p.platform_id)}>
                    {p.platform_name}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>

          <fieldset className="space-y-1.5">
            <legend className={LABEL}>Completed</legend>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1.5 text-sm">
              {DATE_CHOICES.map(([value, label]) => (
                <label key={value} className="inline-flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="completion-date"
                    className="accent-highlight"
                    value={value}
                    checked={dateChoice === value}
                    onChange={() => setDateChoice(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
            {dateChoice === "custom" && (
              <Input
                type="date"
                value={customDate}
                max={todayDate()}
                onChange={(e) => setCustomDate(e.target.value)}
                aria-label="Date completed"
                className="mt-1.5 w-auto"
              />
            )}
          </fieldset>

          <label className="space-y-1.5">
            <span className={LABEL}>Final playtime (hours)</span>
            <Input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={playtime}
              onChange={(e) => setPlaytime(e.target.value)}
              placeholder="Unknown"
              aria-invalid={!playtimeParsed.ok || undefined}
            />
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className={LABEL}>Note (optional)</span>
            <textarea
              rows={2}
              maxLength={COMPLETION_NOTE_MAX}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full min-w-0 rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground caret-highlight outline-none focus-visible:border-faint-foreground focus-visible:ring-2 focus-visible:ring-highlight/40"
            />
            <span className="block text-xs text-faint-foreground">Kept on the profile; the post leaves it out.</span>
          </label>

          <label className="flex items-start gap-3 border-y border-border py-3.5 sm:col-span-2">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-highlight"
              checked={announce}
              onChange={(e) => setAnnounce(e.target.checked)}
            />
            <span>
              <span className="block font-semibold">Announce it in Whatcha Playing</span>
              <span className="block text-sm text-faint-foreground">
                The bot posts it as the proof shows, naming you as the one who logged it.
              </span>
            </span>
          </label>
        </fieldset>

        {error && (
          <p id="completion-error" role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        {sent ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Button type="button" variant="outline" onClick={onRestart}>
              <Plus aria-hidden />
              Log another
            </Button>
            <span className="text-sm text-dim-foreground">
              <CheckCircle2 aria-hidden className="mr-1.5 inline size-4 align-[-3px] text-ok" />
              On{" "}
              <Link
                href={`/members/${sent.member.user_id}/completed-games`}
                className="font-semibold text-foreground underline decoration-border-strong underline-offset-3 hover:decoration-highlight"
              >
                {memberName(sent.member)}&apos;s completed games
              </Link>
              , and off their Now Playing if it was there.
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={pending || !member || !game}>
              {pending && <Loader2 aria-hidden className="animate-spin" />}
              {announce ? "Log and announce" : "Log the completion"}
            </Button>
            {(!member || !game) && (
              <span className="text-sm text-faint-foreground">Pick a member and a game first.</span>
            )}
          </div>
        )}
      </form>

      <div className="min-w-0 lg:sticky lg:top-6">
        {sent?.announced && sent.jobId ? (
          <ProofCard jobId={sent.jobId} what="The completion post" overhang>
            {proof}
          </ProofCard>
        ) : (
          <ProofCard
            caption={
              sent
                ? sent.announced
                  ? (
                      <>
                        Announced, but its bot job didn&apos;t come back with the reply. Follow it on{" "}
                        <Link href="/admin" className="underline underline-offset-3">
                          the wire
                        </Link>
                        .
                      </>
                    )
                  : "Logged without an announcement. Nothing was posted."
                : announce
                  ? "The bot adds each member's emoji, and a line when it is the club's first completion of the game."
                  : "Announce is off: nothing is posted, the completion only goes on their profile."
            }
          >
            {proof}
          </ProofCard>
        )}
      </div>
    </div>
  );
}
