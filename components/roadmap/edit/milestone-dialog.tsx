"use client";

import { useId, useState } from "react";
import type { DatePrecision } from "@/lib/api/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DeskSelect } from "@/components/admin/desk/desk-select";
import { MemberField } from "@/components/issue/member-field";
import { ReleaseDateField } from "@/components/games/edit/release-date-field";
import { MILESTONE_BLURB_MAX, MILESTONE_NAME_MAX, milestoneDraft, milestonePayload, withPrecision } from "@/lib/roadmap/edit";
import type { RoadmapMilestone } from "@/lib/roadmap/types";
import { useEditor } from "./editor-context";
import { EditDialog } from "./edit-dialog";

const PRECISIONS: { value: DatePrecision; label: string }[] = [
  { value: "tba", label: "TBA" },
  { value: "year", label: "Year" },
  { value: "quarter", label: "Quarter" },
  { value: "month", label: "Month" },
  { value: "day", label: "Day" },
];

// Adds a Milestone (the last open one) or edits one: its name, an optional
// blurb, and a target date at its Date Precision (TBA by default).
export function MilestoneDialog({ milestone }: { milestone: RoadmapMilestone | null }) {
  const editor = useEditor();
  const dateId = useId();
  const [draft, setDraft] = useState(() => milestoneDraft(milestone));

  return (
    <EditDialog
      title={milestone ? `Edit ${milestone.name}` : "Add Milestone"}
      description={milestone ? "Its items stay where they are." : "It becomes the last tier on the tree; drag it where it belongs."}
      submitLabel={milestone ? "Save" : "Add Milestone"}
      pendingLabel="Saving..."
      onSubmit={async () => {
        const checked = milestonePayload(draft);
        return "error" in checked ? checked.error : editor.saveMilestone(milestone, draft);
      }}
    >
      <MemberField label="Name">
        <Input
          value={draft.name}
          maxLength={MILESTONE_NAME_MAX}
          autoFocus
          required
          placeholder="Launch"
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
      </MemberField>
      <MemberField label="Blurb (optional)">
        <Textarea
          value={draft.blurb}
          maxLength={MILESTONE_BLURB_MAX}
          rows={2}
          onChange={(e) => setDraft({ ...draft, blurb: e.target.value })}
        />
      </MemberField>
      <div className="space-y-1.5">
        <span id={dateId} className="font-label block text-[0.78rem] font-extrabold tracking-[0.1em] text-faint-foreground">
          Target date
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-32">
            <DeskSelect
              groups={[{ options: PRECISIONS }]}
              value={draft.date_precision}
              labelledBy={dateId}
              onValueChange={(v) => setDraft(withPrecision(draft, v as DatePrecision))}
            />
          </div>
          <ReleaseDateField
            key={draft.date_precision}
            date={draft.target_date}
            precision={draft.date_precision}
            label="Target date"
            onChange={(target_date) => setDraft({ ...draft, target_date })}
          />
        </div>
      </div>
    </EditDialog>
  );
}
