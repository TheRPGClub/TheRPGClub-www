"use client";

import { Check, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_LABEL_LENGTH, facetDef, facetHint, type FacetKey } from "@/lib/reviews/facets";
import { cn } from "@/lib/utils";
import { useFacetRename } from "@/hooks/use-facet-rename";

// A row's name. Names are settled until you say otherwise. Most rows keep the
// one the template gave them, so the default state is read — the pencil is
// what turns a row into something you are editing, and the tick and cross are
// how you leave. The field takes more room while it is open, which the slider
// lends it for as long as the rename lasts.
export function FacetName({
  facetKey,
  label,
  named,
  autoEdit,
  disabled,
  onLabel,
}: {
  facetKey: FacetKey;
  label: string;
  // What the row's controls call it to a screen reader.
  named: string;
  autoEdit?: boolean;
  disabled?: boolean;
  onLabel: (label: string) => void;
}) {
  const { editing, draft, setDraft, inputRef, pencilRef, start, commit, cancel, onKeyDown, markDiscarding } =
    useFacetRename(label, onLabel, autoEdit);

  if (editing) {
    return (
      <span
        className={cn(
          "flex w-40 shrink-0 items-center gap-0.5 rounded-md text-foreground sm:w-56",
          "bg-background ring-1 ring-ring/60",
        )}
      >
        <Input
          ref={inputRef}
          variant="bare"
          type="text"
          autoComplete="off"
          maxLength={MAX_LABEL_LENGTH}
          disabled={disabled}
          value={draft}
          placeholder={facetDef(facetKey)?.label ?? "Name this category"}
          aria-label={`Name of the ${named} category`}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
          className="h-auto min-w-0 flex-1 border-0 px-1 py-0.5 text-xs transition-none md:text-xs"
        />
        {/* Both buttons keep the caret where it is on mousedown. Without
            that the input blurs first, `commit` runs, and the cross saves
            the very draft it exists to throw away. `discarding` covers the
            same race for anything that gets past this — a touch keyboard
            dismissing, say. */}
        <Button
          type="button"
          variant="editor-tool"
          size="icon-xs"
          aria-label={`Save the name for ${named}`}
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={commit}
        >
          <Check />
        </Button>
        <Button
          type="button"
          variant="destructive-editor-tool"
          size="icon-xs"
          aria-label={`Discard the name change for ${named}`}
          disabled={disabled}
          onMouseDown={(e) => {
            e.preventDefault();
            markDiscarding();
          }}
          onClick={cancel}
        >
          <X />
        </Button>
      </span>
    );
  }

  return (
    <span className="flex w-24 shrink-0 items-center gap-0.5 sm:w-36">
      {/* Double-click is the shortcut, not the affordance: it duplicates the
          pencil rather than replacing it, so nothing here is reachable only
          by knowing the trick. That is also why the text stays plain text —
          giving it a button role would put two tab stops on the same action.
          `select-none` suppresses the word-selection flash a double-click
          would otherwise leave behind as the field opens. A custom row has no
          catalogue entry behind it, so no hint to offer. */}
      <span
        className="min-w-0 flex-1 cursor-default truncate text-xs text-muted-foreground select-none"
        title={facetHint(facetKey) ?? undefined}
        onDoubleClick={() => {
          if (!disabled) start();
        }}
      >
        {label}
      </span>
      <Button
        type="button"
        variant="editor-tool"
        size="icon-xs"
        ref={pencilRef}
        aria-label={`Rename ${named}`}
        disabled={disabled}
        onClick={start}
      >
        <Pencil />
      </Button>
    </span>
  );
}
