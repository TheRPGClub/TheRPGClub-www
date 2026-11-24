"use client";

import { useId } from "react";
import { useCompletionLog } from "@/hooks/use-completion-log";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ShelfSaved } from "@/hooks/use-shelf-save";
import type { GameCompletion, Platform, UserNowPlaying } from "@/lib/api/types";
import { clubToday, type IsoDay } from "@/lib/shelf-forms/dates";
import { completionHistory, firstCompletionLine, historyDay, timesTag } from "@/lib/shelf-forms/history";
import { CompletionForm } from "./completion-form";
import { CompletionHistory } from "./completion-history";
import { FormSheet } from "./form-sheet";
import type { ShelfGame } from "./shelf-entry-form";

export interface CompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  game: ShelfGame;
  // The member's Game Completions of this game, for the timeline and the
  // "2nd time" tag.
  completions: GameCompletion[];
  // The member's Now Playing entry for this game: Started comes from it and
  // logging takes the game off Now Playing unless kept.
  nowPlaying?: UserNowPlaying | null;
  // The completion to edit; none logs a new one.
  entry?: GameCompletion | null;
  platforms: Platform[];
  // The club's today; defaults to now.
  today?: IsoDay;
  onSaved: (saved: ShelfSaved) => void;
}

// Logging (or editing) a Game Completion (spec api#451, 2B + 2D): a dialog
// with the cover and the member's completions on a timeline beside the
// paper slip; on phones the slip alone fills a bottom sheet. Mounted by the
// game page's split button and the Completed list page.
export function CompletionDialog(props: CompletionDialogProps) {
  const titleId = useId();
  return (
    <FormSheet open={props.open} onOpenChange={props.onOpenChange} labelledBy={titleId} wide>
      {props.open && <CompletionDialogBody {...props} titleId={titleId} />}
    </FormSheet>
  );
}

function CompletionDialogBody({
  titleId,
  onOpenChange,
  userId,
  game,
  completions,
  nowPlaying,
  entry,
  platforms,
  today = clubToday(),
  onSaved,
}: CompletionDialogProps & { titleId: string }) {
  const log = useCompletionLog({ userId, gameId: game.game_id, entry, nowPlaying, today, onSaved });
  // On phones the timeline is folded away, so the slip names the game and
  // the first completion itself.
  const mobile = useIsMobile();
  const tag = entry ? undefined : timesTag(completions.length);
  const first = entry ? null : firstCompletionLine(completions);
  const finished = log.values.finished;

  return (
    <div className="grid md:grid-cols-[15.5rem_minmax(0,1fr)]">
      <div className="hidden md:flex">
        <CompletionHistory
          title={game.title}
          coverUrl={game.cover_url}
          nodes={completionHistory(completions, entry?.completion_id)}
          pending={
            entry
              ? null
              : { label: tag ? `This one · ${tag}` : "This one", when: finished ? `Finishing ${historyDay(finished)}` : "No finish day" }
          }
        />
      </div>
      <div className="md:px-6 md:py-6">
        <CompletionForm
          log={log}
          titleId={titleId}
          title={entry ? "Edit completion" : "Log a completion"}
          tag={tag}
          lede={
            mobile && (
              <>
                <b>{game.title}</b>
                {first && (
                  <>
                    . Your 1st: <b>{first.when}</b>, {first.rest}.
                  </>
                )}
              </>
            )
          }
          platforms={platforms}
          today={today}
          onCancel={() => onOpenChange(false)}
          className="min-h-dvh max-md:rounded-none md:min-h-0 md:-rotate-[0.6deg] md:shadow-[0_24px_60px_rgb(0_0_0/0.6)]"
        />
      </div>
    </div>
  );
}
