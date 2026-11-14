"use client";

import { useState, useTransition } from "react";
import { setFeatureFlagAction } from "@/app/actions/feature-flags";
import type { FeatureState } from "@/lib/features";
import {
  draftAfterPanel,
  needsOffConfirm,
  normalizeReason,
  reasonForChange,
  type FeatureFlagEntry,
  type FlagPanel,
} from "@/lib/feature-flags";

// One Feature Flag row on the desk: its open panel (reason note or Off
// confirm), the reason draft, the save in flight and its error. Preview and
// Live save on pick; Off opens the confirm first.
export function useFlagRow(entry: FeatureFlagEntry, onSaved: (entry: FeatureFlagEntry, changed: boolean) => void) {
  const [panel, setPanel] = useState<FlagPanel>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<FeatureState | null>(null);
  const [, startTransition] = useTransition();
  const busy = saving !== null;

  // Every panel change goes through here (draftAfterPanel).
  const showPanel = (next: FlagPanel) => {
    setDraft((d) => draftAfterPanel(panel, next, d));
    setPanel(next);
  };

  const save = (next: FeatureState) => {
    // One change at a time: a second Enter or click while saving is dropped.
    if (busy) return;
    const reason = reasonForChange(panel, next, draft);
    const { error: reasonError } = normalizeReason(reason);
    if (reasonError) {
      setError(reasonError);
      if (!panel) showPanel("reason");
      return;
    }
    setError(null);
    setSaving(next);
    startTransition(async () => {
      let result: Awaited<ReturnType<typeof setFeatureFlagAction>>;
      try {
        result = await setFeatureFlagAction(entry.key, next, reason);
      } catch {
        result = { ok: false, error: "Couldn't reach the club's server. Try again." };
      }
      setSaving(null);
      if (result.ok && result.entry) {
        setDraft("");
        setPanel(null);
        onSaved(result.entry, result.changed !== false);
      } else {
        setError(result.error ?? "Couldn't save the change. Try again.");
      }
    });
  };

  const pick = (next: FeatureState) => {
    if (busy) return;
    if (needsOffConfirm(entry.state, next)) {
      setError(null);
      showPanel("confirm");
      return;
    }
    if (panel === "confirm") showPanel(null);
    if (next !== entry.state) save(next);
  };

  const cancel = () => {
    showPanel(null);
    setError(null);
  };

  return { panel, draft, setDraft, error, saving, busy, shown: saving ?? entry.state, showPanel, save, pick, cancel };
}
