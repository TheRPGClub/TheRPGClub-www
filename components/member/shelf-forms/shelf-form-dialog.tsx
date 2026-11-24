"use client";

import { useId } from "react";
import type { SimpleShelfKind } from "@/lib/shelf-forms/values";
import { FormSheet } from "./form-sheet";
import { ShelfEntryForm, type ShelfEntryFormProps } from "./shelf-entry-form";

export type ShelfFormDialogProps = Omit<ShelfEntryFormProps, "titleId" | "onCancel" | "className"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// A Now Playing, Backlog, Favorites or Collection form in a dialog (a
// bottom sheet on phones), as the game page's split button opens it.
// The list pages can mount ShelfEntryForm (or the per-list forms) in place.
export function ShelfFormDialog({ open, onOpenChange, ...form }: ShelfFormDialogProps) {
  const titleId = useId();
  return (
    <FormSheet open={open} onOpenChange={onOpenChange} labelledBy={titleId}>
      {open && (
        <ShelfEntryForm
          {...form}
          titleId={titleId}
          onCancel={() => onOpenChange(false)}
          className="max-md:rounded-none max-md:pb-6"
        />
      )}
    </FormSheet>
  );
}

type ListFormProps = Omit<ShelfEntryFormProps, "kind">;
const listForm = (kind: SimpleShelfKind) => {
  const Form = (props: ListFormProps) => <ShelfEntryForm kind={kind} {...props} />;
  Form.displayName = `ShelfEntryForm(${kind})`;
  return Form;
};

// One form per list (spec api#451), for a host that knows its list.
export const NowPlayingForm = listForm("now_playing");
export const BacklogForm = listForm("backlog");
export const FavoriteForm = listForm("favorite");
export const CollectionForm = listForm("collection");
