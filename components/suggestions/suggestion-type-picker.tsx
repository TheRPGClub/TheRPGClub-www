"use client";

import type { CSSProperties } from "react";
import { Bug, Check, Sparkles, Wrench, type LucideIcon } from "lucide-react";
import { SUGGESTION_TYPES, type SuggestionType } from "@/lib/suggestions";
import { Toggle } from "@/components/ui/toggle";
import { FIELD_HINT, FIELD_LABEL } from "./suggestion-field";

const TYPE_ICON: Record<SuggestionType, LucideIcon> = {
  "New Feature": Sparkles,
  Improvement: Wrench,
  Bug,
};

// The Suggestion's types, each a tag in its own ink, filled when picked.
export function SuggestionTypePicker({
  types,
  onToggle,
  disabled,
}: {
  types: SuggestionType[];
  onToggle: (type: SuggestionType) => void;
  disabled: boolean;
}) {
  return (
    <fieldset className="mb-5.5" aria-describedby="suggestion-type-hint">
      <legend className={FIELD_LABEL}>Type</legend>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {SUGGESTION_TYPES.map((t) => {
          const on = types.includes(t.value);
          const Icon = on ? Check : TYPE_ICON[t.value];
          return (
            <Toggle
              key={t.value}
              variant="tag"
              pressed={on}
              onPressedChange={() => onToggle(t.value)}
              title={t.blurb}
              disabled={disabled}
              style={{ "--tag-ink": t.ink } as CSSProperties}
              className="h-8 gap-1.5 px-3 text-[0.85rem]"
            >
              <Icon aria-hidden className="size-3.5" />
              {t.value}
            </Toggle>
          );
        })}
      </div>
      <p id="suggestion-type-hint" className={FIELD_HINT}>
        <span>Pick every type that fits. Where it lands (bot or website) is decided on review.</span>
      </p>
    </fieldset>
  );
}
