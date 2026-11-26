"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MemberField } from "@/components/issue/member-field";
import { FeedbackPicker } from "./feedback-picker";
import { GITHUB_URL_MAX, ITEM_BLURB_MAX, ITEM_TITLE_MAX, type ItemDraft } from "@/lib/roadmap/edit";

// The Roadmap Item form (design pick 2's dialog): title, blurb, the Bot and
// Web toggle chips (both on is "Both"), the GitHub issue, linked Feedback
// (www#233) and Shipped. `itemId` is null for a new item.
export function ItemFields({
  draft,
  itemId,
  onChange,
}: {
  draft: ItemDraft;
  itemId: number | null;
  onChange: (next: ItemDraft) => void;
}) {
  const set = <K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) => onChange({ ...draft, [key]: value });
  return (
    <>
      <MemberField label="Title">
        <Input value={draft.title} maxLength={ITEM_TITLE_MAX} autoFocus required onChange={(e) => set("title", e.target.value)} />
      </MemberField>
      <MemberField label="Blurb">
        <Textarea
          value={draft.blurb}
          maxLength={ITEM_BLURB_MAX}
          rows={2}
          required
          placeholder="One or two sentences members will read."
          onChange={(e) => set("blurb", e.target.value)}
        />
      </MemberField>
      <fieldset className="space-y-1.5">
        <legend className="font-label text-[0.78rem] font-extrabold tracking-[0.1em] text-faint-foreground">Area</legend>
        <div className="flex gap-1.5">
          {(["bot", "web"] as const).map((key) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={draft[key] ? "selected" : "outline"}
              aria-pressed={draft[key]}
              onClick={() => set(key, !draft[key])}
            >
              {key === "bot" ? "Bot" : "Web"}
            </Button>
          ))}
        </div>
      </fieldset>
      <MemberField label="GitHub issue (staff only)">
        <Input
          type="url"
          value={draft.github_issue_url}
          maxLength={GITHUB_URL_MAX}
          placeholder="https://github.com/TheRPGClub/TheRPGClub-www/issues/12"
          onChange={(e) => set("github_issue_url", e.target.value)}
        />
      </MemberField>
      <FeedbackPicker itemId={itemId} value={draft.feedback} onChange={(next) => set("feedback", next)} />
      <Label>
        <Checkbox checked={draft.shipped} onCheckedChange={(on) => set("shipped", on)} />
        Shipped
      </Label>
    </>
  );
}
