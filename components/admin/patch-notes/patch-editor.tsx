"use client";

import { useState } from "react";
import type { Value } from "platejs";

import { useLeaveGuard } from "@/hooks/use-leave-guard";
import { usePatchEditor } from "@/hooks/use-patch-editor";
import { agoText } from "@/lib/bot-jobs";
import { PATCH_EDITOR_BACK } from "@/lib/patch-notes/editor-paths";
import { patchDate } from "@/lib/patch-notes/format";
import type { Patch } from "@/lib/patch-notes/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DeskHeader } from "@/components/templates/desk-header";
import { MastheadTabs } from "@/components/templates/masthead-tabs";
import { PatchActions } from "./patch-actions";
import { PatchPreview } from "./patch-preview";
import { PatchScopeEmpty } from "./patch-scope-empty";
import { PatchSheet } from "./patch-sheet";

type Step = "scope" | "write";

// The Patch editor, "Two steps" (www#237, pn-editor-steps): the desk
// header with the Patch's state, step tabs "1 · What's in it" and
// "2 · Write it" (open on 2), and step 2's sheet beside the sticky preview
// with the count and the actions. Leaving with unsaved changes asks first.
export function PatchEditor({ patch, initialValue, siteUrl }: { patch: Patch; initialValue: Value; siteUrl: string | null }) {
  const editor = usePatchEditor(patch, initialValue, siteUrl);
  const guard = useLeaveGuard(editor.dirty);
  const [step, setStep] = useState<Step>("write");
  const saved = editor.patch;
  const state = editor.published
    ? `Published · ${patchDate(saved)}`
    : `Draft · saved ${agoText(saved.updated_at, new Date())}`;

  return (
    <div className="flex flex-col gap-6">
      <DeskHeader
        back={PATCH_EDITOR_BACK}
        title={`Patch ${saved.number}`}
        side={
          <>
            <b suppressHydrationWarning>{state}</b>
            {editor.dirty && <span className="text-highlight"> · unsaved changes</span>}
            <br />
            {editor.published ? "On /patch-notes now" : "Only Admins can see a draft"}
          </>
        }
      />
      <MastheadTabs<Step>
        value={step}
        onValueChange={setStep}
        label="Steps"
        tabs={[
          { key: "scope", label: "1 · What's in it", note: "No Pending Changes yet", panel: <PatchScopeEmpty onWrite={() => setStep("write")} /> },
          {
            key: "write",
            label: "2 · Write it",
            note: `Patch ${saved.number} · ${editor.published ? "published" : "draft"}`,
            tone: editor.dirty ? "staged" : "live",
            panel: (
              <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_27.5rem]">
                <PatchSheet editor={editor} />
                <PatchPreview editor={editor} actions={<PatchActions editor={editor} />} />
              </div>
            ),
          },
        ]}
      />
      <ConfirmDialog
        open={guard.leaving !== null}
        onOpenChange={(open) => !open && guard.stay()}
        title="Leave without saving?"
        description="What you've written here since the last save goes."
        confirmLabel="Leave"
        pendingLabel="Leaving…"
        cancelLabel="Keep writing"
        onConfirm={async () => {
          guard.leave();
          return null;
        }}
      />
    </div>
  );
}
