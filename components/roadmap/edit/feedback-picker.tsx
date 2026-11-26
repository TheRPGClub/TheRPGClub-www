"use client";

import { useId, useState } from "react";
import { Search } from "lucide-react";
import { Combobox, ComboboxField, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { useLinkableFeedback } from "@/hooks/use-linkable-feedback";
import { feedbackHolder, feedbackLine, matchFeedback } from "@/lib/roadmap/feedback";
import type { RoadmapFeedback } from "@/lib/roadmap/types";
import { useEditor } from "./editor-context";
import { LinkedFeedback } from "./linked-feedback";

// The item dialog's Linked Feedback (www#233): search Feedback by title (or
// "#12") and pick one to link it; the linked list below unlinks. Feedback
// already on another item says it will move here. Nothing saves until the
// dialog does.
export function FeedbackPicker({
  itemId,
  value,
  onChange,
}: {
  itemId: number | null;
  value: RoadmapFeedback[];
  onChange: (next: RoadmapFeedback[]) => void;
}) {
  const editor = useEditor();
  const labelId = useId();
  const [query, setQuery] = useState("");
  const { all, error } = useLinkableFeedback();
  const linked = value.map((f) => f.id);
  const matches = all ? matchFeedback(all, query, linked) : [];
  const holder = (f: RoadmapFeedback) => feedbackHolder(editor.roadmap, f.id, itemId ?? undefined);

  return (
    <div className="space-y-1.5">
      <p id={labelId} className="font-label text-[0.78rem] font-extrabold tracking-[0.1em] text-faint-foreground">
        Linked Feedback
      </p>
      <Combobox<RoadmapFeedback>
        inline
        items={matches}
        filter={null}
        inputValue={query}
        onInputValueChange={setQuery}
        value={null}
        onValueChange={(f) => {
          if (!f) return;
          onChange([...value, f]);
          setQuery("");
        }}
        itemToStringLabel={(f) => f.title}
      >
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint-foreground" />
          <ComboboxField type="search" placeholder="Search Feedback by title…" aria-labelledby={labelId} className="pl-9" />
        </div>
        {query.trim() && (
          <div className="max-h-56 overflow-y-auto rounded-sm border border-border-strong bg-muted shadow-[0_12px_30px_rgb(0_0_0/0.45)]">
            {error && <p role="alert" className="px-3 py-2.5 text-xs text-destructive">{error}</p>}
            {!error && !all && <p className="px-3 py-2.5 text-xs text-faint-foreground">Loading Feedback…</p>}
            {all && matches.length === 0 && <p className="px-3 py-2.5 text-xs text-faint-foreground">No Feedback matches.</p>}
            <ComboboxList aria-label="Matching Feedback" className="max-h-none overflow-visible p-0">
              {(f: RoadmapFeedback) => {
                const from = holder(f);
                return (
                  <ComboboxItem key={f.id} value={f} variant="result" className="block px-2.5 py-2 text-left">
                    <span className="block truncate font-semibold">{f.title}</span>
                    <span className="font-label block text-[0.7rem] text-faint-foreground">{feedbackLine(f)}</span>
                    {from && (
                      <span className="block text-xs text-highlight">On “{from.title}”: linking moves it here</span>
                    )}
                  </ComboboxItem>
                );
              }}
            </ComboboxList>
          </div>
        )}
      </Combobox>
      <LinkedFeedback feedback={value} holder={holder} onUnlink={(id) => onChange(value.filter((f) => f.id !== id))} />
    </div>
  );
}
