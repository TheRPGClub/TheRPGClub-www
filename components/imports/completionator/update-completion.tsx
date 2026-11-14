"use client";

import { useState } from "react";
import { Check, Undo2 } from "lucide-react";
import { updateCompletionImportItemAction } from "@/app/actions/imports";
import type { CompletionatorUpdateField } from "@/lib/api/types";
import { UPDATE_FIELD_LABELS } from "@/lib/imports/completionator";
import { CompletionDiff } from "@/components/imports/completionator/completion-diff";
import type { CompletionatorStepProps } from "@/components/imports/completionator/types";
import { ImportSubhead } from "@/components/issue/import-item-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// Copy the chosen values from the file onto the member's completion.
export function UpdateCompletion({
  kind,
  userId,
  review,
  disabled,
  perform,
  onBack,
}: CompletionatorStepProps & { onBack?: () => void }) {
  const options = review.diff?.fields ?? [];
  const [selected, setSelected] = useState<CompletionatorUpdateField[]>(options);

  const toggle = (field: CompletionatorUpdateField, on: boolean) =>
    setSelected((prev) => (on ? [...prev, field] : prev.filter((f) => f !== field)));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        perform("Updating the completion…", () =>
          updateCompletionImportItemAction(kind, userId, review.item.item_id, selected),
        );
      }}
    >
      <div>
        <ImportSubhead>Update your completion</ImportSubhead>
        <p className="mt-1 text-sm text-faint-foreground">
          You already finished this game. Choose which values from the file to
          copy onto it.
        </p>
      </div>
      <CompletionDiff review={review} highlight={options} />
      <fieldset className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
        <legend className="sr-only">Values to update</legend>
        {options.map((field) => (
          <label key={field} className="inline-flex items-center gap-1.5">
            <Checkbox
              checked={selected.includes(field)}
              onCheckedChange={(checked) => toggle(field, checked)}
            />
            {UPDATE_FIELD_LABELS[field]}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="highlight" disabled={disabled || selected.length === 0}>
          <Check data-icon="inline-start" /> Update completion
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
