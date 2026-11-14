"use client";

import { useEffect, useState } from "react";
import { Plus, Undo2 } from "lucide-react";
import { addCompletionImportItemAction, nowPlayingEntryIdsAction } from "@/app/actions/imports";
import {
  COMPLETION_TYPES,
  addCompletionPayload,
  datePart,
  type AddCompletionForm,
} from "@/lib/imports/completionator";
import { CompletionFields } from "@/components/imports/completionator/completion-fields";
import type { CompletionatorStepProps } from "@/components/imports/completionator/types";
import { ImportSubhead } from "@/components/issue/import-item-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// The member's Now Playing entries for the game, so adding the completion can
// take it off Now Playing, as the bot does.
function useNowPlayingIds(userId: string, gameId: number | undefined): number[] {
  const [ids, setIds] = useState<number[]>([]);
  useEffect(() => {
    if (!gameId) return;
    let live = true;
    nowPlayingEntryIdsAction(userId, gameId).then((res) => {
      if (live && res.ok && res.data) setIds(res.data);
    });
    return () => {
      live = false;
    };
  }, [userId, gameId]);
  return ids;
}

// Add the row as a completion of the chosen game, prefilled from the file.
export function AddCompletion({
  kind,
  userId,
  review,
  disabled,
  perform,
  onBack,
}: CompletionatorStepProps & { onBack?: () => void }) {
  const { item, form, game } = review;
  const rowDate = form?.completed_at ?? item.completed_at;
  const [values, setValues] = useState<AddCompletionForm>(() => ({
    completionType: form?.completion_type ?? COMPLETION_TYPES[0],
    platformId: form?.platform_id ? String(form.platform_id) : "",
    dateChoice: form?.date_choice === "csv" && datePart(rowDate) !== null ? "csv" : "unknown",
    customDate: "",
    playtime: form?.final_playtime_hours != null ? String(form.final_playtime_hours) : "",
  }));
  const [error, setError] = useState<string | null>(null);
  const nowPlayingIds = useNowPlayingIds(userId, game?.game_id);
  const [removeNowPlaying, setRemoveNowPlaying] = useState(true);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const built = addCompletionPayload(values, rowDate);
    if (!built.ok) {
      setError(built.error);
      return;
    }
    setError(null);
    const removeIds = removeNowPlaying ? nowPlayingIds : [];
    perform("Adding the completion…", () =>
      addCompletionImportItemAction(kind, userId, item.item_id, built.payload, removeIds),
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <ImportSubhead>Add the completion</ImportSubhead>
        <p className="mt-1 text-sm text-faint-foreground">
          {review.existing_completion
            ? "This is added as a separate completion; your existing one stays as it is."
            : "Check the details and add it to your completed games."}
        </p>
      </div>

      <CompletionFields
        values={values}
        onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
        form={form}
        rowDate={rowDate}
      />

      {nowPlayingIds.length > 0 && (
        <Label variant="frame" className="flex items-center gap-2 text-sm">
          <Checkbox checked={removeNowPlaying} onCheckedChange={setRemoveNowPlaying} />
          Also remove it from Now Playing
        </Label>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="highlight" disabled={disabled}>
          <Plus data-icon="inline-start" /> Add completion
        </Button>
        {onBack && (
          <Button type="button" variant="ghost" disabled={disabled} onClick={onBack}>
            <Undo2 /> Back
          </Button>
        )}
      </div>
    </form>
  );
}
