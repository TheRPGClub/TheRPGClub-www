"use client";

import { Check, Loader2, Play, Trash2 } from "lucide-react";
import { useShelfEntry, type ShelfEntryInput } from "@/hooks/use-shelf-entry";
import type { Game, Platform } from "@/lib/api/types";
import type { SimpleShelfKind } from "@/lib/shelf-forms/values";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ListOptionSelect } from "../member-shelf/list-option-select";
import { OWNERSHIP_CHOICES } from "./choices";
import { DateField } from "./date-field";
import { platformItems } from "./platform-items";
import { Slip, SlipError, SlipField } from "./slip";
import { SlipChoices } from "./slip-choices";

// The game a shelf form is about.
export type ShelfGame = Pick<Game, "game_id" | "title"> & { cover_url?: string | null };

const LIST: Record<SimpleShelfKind, { title: string; add: string }> = {
  now_playing: { title: "Now Playing", add: "Start playing" },
  backlog: { title: "Backlog", add: "Add to Backlog" },
  favorite: { title: "Favorites", add: "Add to Favorites" },
  collection: { title: "Collection", add: "Add to Collection" },
};

export interface ShelfEntryFormProps extends ShelfEntryInput {
  game: ShelfGame;
  platforms: Platform[];
  titleId: string;
  onCancel: () => void;
  // Editing: take the entry off the list. The host holds it behind Undo.
  onRemove?: () => void;
  className?: string;
}

// One list's form on the paper slip (spec api#451, "the small form every
// other list gets in the same voice"): Now Playing's platform, Started day
// (when editing) and note; Backlog's platform and note; Favorites' note;
// Collection's ownership, platform and note.
export function ShelfEntryForm(props: ShelfEntryFormProps) {
  const { kind, game, platforms, titleId, onCancel, onRemove, className } = props;
  const form = useShelfEntry(props);
  const { values, set } = form;
  const list = LIST[kind];

  return (
    <Slip
      titleId={titleId}
      title={list.title}
      lede={<b>{game.title}</b>}
      onClose={onCancel}
      onSubmit={form.submit}
      className={className}
      foot={
        <>
          {form.formError && <SlipError>{form.formError}</SlipError>}
          {form.editing && onRemove && (
            <Button type="button" variant="inverse-link" className="mr-auto max-sm:basis-full max-sm:justify-start" onClick={onRemove} disabled={form.pending}>
              <Trash2 aria-hidden />
              Remove from {list.title}
            </Button>
          )}
          <Button type="button" variant="inverse-outline" className="max-sm:flex-1" onClick={onCancel} disabled={form.pending}>
            Cancel
          </Button>
          <Button type="submit" variant="inverse" className="max-sm:flex-[2]" disabled={form.pending}>
            {form.pending ? <Loader2 aria-hidden className="motion-safe:animate-spin" /> : kind === "now_playing" && !form.editing ? <Play aria-hidden /> : <Check aria-hidden />}
            {form.editing ? "Save" : list.add}
          </Button>
        </>
      }
    >
      {kind === "collection" && (
        <SlipChoices label="How you own it" choices={OWNERSHIP_CHOICES} value={values.ownershipType} onValueChange={(v) => set("ownershipType", v)} className="grid-cols-2 sm:grid-cols-4" />
      )}
      {kind !== "favorite" && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <SlipField label="Platform">
            <ListOptionSelect<number | null> label="Platform" variant="slip" items={platformItems(platforms)} value={values.platformId} onValueChange={(v) => set("platformId", v)} />
          </SlipField>
          {kind === "now_playing" && form.editing && (
            <DateField variant="block" label="Started" value={values.started} onChange={(day) => set("started", day)} today={form.today} max={form.today} error={form.problems.started} sub={values.started === form.today ? "Today" : null} />
          )}
        </div>
      )}
      <SlipField label="Note" optional htmlFor={`${titleId}-note`}>
        <Textarea id={`${titleId}-note`} variant="slip" rows={2} placeholder={kind === "favorite" ? "Why it's a favorite" : "Anything to remember"} value={values.note} onChange={(e) => set("note", e.target.value)} />
      </SlipField>
    </Slip>
  );
}
