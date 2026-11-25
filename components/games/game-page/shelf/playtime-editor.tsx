"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  abandonPlaythroughAction,
  deleteManualPlaytimeAction,
  saveManualPlaytimeAction,
  setPlaythroughTotalAction,
  settlePlaytimeMismatchAction,
  startPlaythroughAction,
  updateManualPlaytimeAction,
} from "@/app/actions/playtime";
import type { PlaytimeState } from "@/hooks/use-playtime";
import type { GameCompletion, Platform, UserNowPlaying } from "@/lib/api/types";
import type { GamePlaytime } from "@/lib/playtime/types";
import { earlierPlaythroughs, hoursText, mismatchView, platformShort, playthroughView, sourceRows } from "@/lib/playtime/view";
import { Button } from "@/components/ui/button";
import { PlaytimeAddForm } from "./playtime-add-form";
import { PlaytimeMismatch } from "./playtime-mismatch";
import { PlaytimeSourceRow } from "./playtime-source-row";
import { PlaythroughCard } from "./playthrough-card";

export interface PlaytimeEditorProps {
  playtime: PlaytimeState & { doc: GamePlaytime };
  userId: string;
  gameId: number;
  gameTitle: string;
  platforms: Platform[];
  completions: GameCompletion[];
  nowPlaying: UserNowPlaying | null;
  defaultPlatform: number | null;
  // Close the editor and open the Game Completion dialog.
  onLog?: () => void;
}

// The full Playtime editor (2D+F), in the popover or the phone's sheet: the
// total, any mismatch with its three ways out, every source (Manual rows
// editable), Add Manual Playtime, and the Playthrough card.
export function PlaytimeEditor({ playtime, userId, gameId, gameTitle, platforms, completions, nowPlaying, defaultPlatform, onLog }: PlaytimeEditorProps) {
  const { doc, run, pending } = playtime;
  const [adding, setAdding] = useState(false);
  const notes = new Map(doc.breakdown.manual_entries.map((e) => [e.id, e.note ?? ""]));
  const open = playthroughView(doc, nowPlaying?.added_at);
  const short = platformShort(platforms);

  return (
    <div>
      <p className="mt-0.5 mb-2.5 flex items-baseline gap-2.5">
        <b className="font-display text-[2.6rem] leading-[0.85] font-normal">{hoursText(doc.total_minutes)}</b>
        <span className="font-label text-[0.74rem] leading-[1.2] font-bold tracking-[0.08em] text-faint-foreground uppercase">{gameTitle} · every source added up</span>
      </p>
      {doc.mismatches.map((m) => {
        const view = mismatchView(m, short);
        return (
          <PlaytimeMismatch
            key={view.key}
            view={view}
            pending={pending}
            onKeep={(keep) => run(() => settlePlaytimeMismatchAction(userId, gameId, m.platform_id, keep))}
          />
        );
      })}
      <ul aria-label="Where your Playtime comes from">
        {sourceRows(doc, short).map((row) => (
          <PlaytimeSourceRow
            key={row.key}
            row={row}
            note={notes.get(row.manualId ?? -1) ?? ""}
            pending={pending}
            onSave={(mode, minutes, done) => run(() => saveManualPlaytimeAction(userId, gameId, { platformId: row.platformId, minutes, mode }), done)}
            onNote={(note, done) => run(() => updateManualPlaytimeAction(userId, row.manualId!, { note }), done)}
            onRemove={() => run(() => deleteManualPlaytimeAction(userId, row.manualId!))}
          />
        ))}
      </ul>
      <div className="mt-2.5">
        {adding ? (
          <PlaytimeAddForm
            doc={doc}
            platforms={platforms}
            initialPlatform={defaultPlatform}
            pending={pending}
            onCancel={() => setAdding(false)}
            onSave={(input) => run(() => saveManualPlaytimeAction(userId, gameId, input), () => setAdding(false))}
          />
        ) : (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus aria-hidden />
            Add Manual Playtime
          </Button>
        )}
      </div>
      <PlaythroughCard
        open={open}
        earlier={earlierPlaythroughs(doc, completions)}
        pending={pending}
        onLog={onLog}
        onStart={() => run(() => startPlaythroughAction(userId, gameId))}
        onSetTotal={(minutes, done) => open && run(() => setPlaythroughTotalAction(userId, open.id, minutes), done)}
        onAbandon={() => open && run(() => abandonPlaythroughAction(userId, open.id))}
      />
    </div>
  );
}
