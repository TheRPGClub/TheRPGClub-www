"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { saveFeedbackAction } from "@/app/actions/feedback";
import type { Feedback, FeedbackKind } from "@/lib/api/types";
import {
  pinnedHref,
  screenshotProblem,
  validateFeedbackInput,
  type FeedbackWhere,
} from "@/lib/feedback";

export interface FeedbackFields {
  title: string;
  details: string;
  where: FeedbackWhere | null;
  what_happened: string;
  expected: string;
  steps: string;
}

// A Bug Report's screenshot in the form: the one it has (editing), a file
// picked to add or replace it, or the one it has marked for removal.
export interface ScreenshotState {
  existing: string | null;
  file: File | null;
  removed: boolean;
}

function fieldsOf(f: Feedback | null): FeedbackFields {
  return {
    title: f?.title ?? "",
    details: f?.details ?? "",
    where: f?.where ?? null,
    what_happened: f?.what_happened ?? "",
    expected: f?.expected ?? "",
    steps: f?.steps ?? "",
  };
}

/**
 * The Give feedback dialog's form (www#226): its kind, fields and screenshot,
 * checked here as the API will, then posted (or, editing, saved). Success
 * lands on the board with the card pinned. When only the screenshot fails,
 * the Feedback is saved, so the form carries on as its edit.
 */
export function useFeedbackForm({ kind: initialKind, feedback }: { kind: FeedbackKind; feedback: Feedback | null }) {
  const router = useRouter();
  const [kind, setKind] = useState<FeedbackKind>(feedback?.kind ?? initialKind);
  const [id, setId] = useState(feedback?.feedback_id ?? 0);
  const [fields, setFields] = useState(() => fieldsOf(feedback));
  const [shot, setShot] = useState<ScreenshotState>({
    existing: feedback?.screenshot_url ?? null,
    file: null,
    removed: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof FeedbackFields>(name: K, value: FeedbackFields[K]) {
    setFields((current) => ({ ...current, [name]: value }));
    setError(null);
  }

  function pickFile(file: File) {
    const problem = screenshotProblem(file);
    setError(problem);
    if (!problem) setShot((s) => ({ ...s, file, removed: false }));
  }

  function removeShot() {
    setShot((s) => ({ ...s, file: null, removed: !!s.existing }));
    setError(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const checked = validateFeedbackInput({ kind, ...fields });
    if (!checked.ok) return setError(checked.error);
    const form = new FormData();
    for (const [name, value] of Object.entries(fields)) form.set(name, value ?? "");
    form.set("kind", kind);
    if (id) form.set("feedback_id", String(id));
    if (shot.file) form.set("screenshot", shot.file);
    else if (shot.removed) form.set("remove_screenshot", "1");
    setError(null);
    startTransition(async () => {
      const res = await saveFeedbackAction(form);
      if (res.ok && res.data) return router.replace(pinnedHref(res.data), { scroll: false });
      if (res.data) {
        setId(res.data.feedback_id);
        setShot((s) => ({ ...s, existing: res.data?.screenshot_url ?? null, removed: false }));
      }
      setError(res.error ?? "Couldn't save it. Try again.");
    });
  }

  return {
    kind,
    setKind: id ? undefined : setKind,
    editing: id > 0,
    savedId: id,
    fields,
    set,
    shot,
    pickFile,
    removeShot,
    error,
    pending,
    submit,
  };
}

export type FeedbackForm = ReturnType<typeof useFeedbackForm>;
