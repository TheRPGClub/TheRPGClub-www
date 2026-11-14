"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { logCompletionForMemberAction, memberYearCompletionCountAction } from "@/app/actions/admin-completions";
import type { Game, User } from "@/lib/api/types";
import { memberName } from "@/lib/achievements";
import { completionAnnouncement, completionFormProblem, completionYear, pickedGamePlatformId } from "@/lib/completions";
import { COMPLETION_TYPES, parsePlaytime, todayDate } from "@/lib/imports/completionator";

export type DateChoice = "today" | "unknown" | "custom";

export interface SentCompletion {
  member: User;
  game: Game;
  completionId: number;
  announced: boolean;
  jobId: number | null;
}

// A Superadmin's Game Completion for another member: the member and game,
// the completion's fields, the member's count so far in its year (for the
// post's "Nth this year"), the announcement it makes, and the send.
export function useCompletionForm(actorName: string) {
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
  const [sent, setSent] = useState<SentCompletion | null>(null);
  const [pending, startTransition] = useTransition();
  // Keyed so a stale read for another member or year is never shown.
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

  const pickMember = (picked: User | null) => {
    setMember(picked);
    setError(null);
  };
  const pickGame = (picked: Game) => {
    setGame(picked);
    setPlatformId(pickedGamePlatformId(picked));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = completionFormProblem({
      hasMember: !!member,
      hasGame: !!game,
      dateChoice,
      customDate,
      playtimeOk: playtimeParsed.ok,
      note,
    });
    if (problem || !member || !game) return setError(problem);
    setError(null);
    startTransition(async () => {
      const input = {
        userId: member.user_id,
        gameId: game.game_id,
        completionType,
        platformId: platformId ? Number(platformId) : null,
        completedOn,
        playtimeHours,
        note,
        announce,
      };
      const result = await logCompletionForMemberAction(input).catch(() => null);
      if (!result) return setError("Couldn't reach the club's server. Try again.");
      if (!result.ok || !result.completionId) return setError(result.error ?? "Couldn't log it.");
      setSent({ member, game, completionId: result.completionId, announced: announce, jobId: result.jobId ?? null });
    });
  };

  return {
    member, pickMember, game, pickGame,
    completionType, setCompletionType, platformId, setPlatformId,
    dateChoice, setDateChoice, customDate, setCustomDate,
    playtime, setPlaytime, playtimeOk: playtimeParsed.ok, note, setNote, announce, setAnnounce,
    announcement, error, sent, pending, locked: pending || sent !== null, submit,
  };
}
