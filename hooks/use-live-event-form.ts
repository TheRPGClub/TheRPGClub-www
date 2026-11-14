"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createLiveEventAction } from "@/app/actions/live-events";
import type { LiveEvent } from "@/lib/api/types";
import { imageFileProblem, safeImageUrl, validateLiveEventInput } from "@/lib/live-events";
import { localInputToOffsetIso, toLocalInputValue } from "@/lib/public-reminders";

export type ImageMode = "file" | "url";

// The live event form's state: the topic, the two clocks (a start with no
// end, or an end before it, proposes an hour), the optional image as a file
// (previewed from a blob URL, freed when replaced or gone) or a URL, and the
// send to the API. `sent` is the event the API saved.
export function useLiveEventForm() {
  const [topic, setTopic] = useState("");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [imageMode, setImageMode] = useState<ImageMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<LiveEvent | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);

  // Free the last file preview when the form goes away.
  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  const setPreviewUrl = (next: string | null) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = next;
    setPreview(next);
  };

  const pickFile = (picked: File | null) => {
    if (!picked) return;
    const problem = imageFileProblem(picked);
    if (problem) {
      setError(problem);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    setError(null);
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const switchImageMode = (mode: ImageMode) => {
    if (mode === "url") clearFile();
    else setImageUrl("");
    setImageMode(mode);
  };

  // Picking a start with no end (or an end before it) proposes an hour.
  const changeStart = (value: string) => {
    setStartLocal(value);
    const start = localInputToOffsetIso(value);
    const end = localInputToOffsetIso(endLocal);
    if (start && (!end || Date.parse(end) <= Date.parse(start))) {
      setEndLocal(toLocalInputValue(new Date(Date.parse(start) + 3_600_000).toISOString()));
    }
  };

  const startsAt = localInputToOffsetIso(startLocal);
  const endsAt = localInputToOffsetIso(endLocal);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = imageMode === "url" ? imageUrl : "";
    const checked = validateLiveEventInput({ topic, starts_at: startsAt, ends_at: endsAt, image_url: url });
    if (!checked.ok) {
      setError(checked.error);
      return;
    }
    const form = new FormData();
    form.set("topic", checked.data.topic);
    form.set("starts_at", checked.data.starts_at);
    form.set("ends_at", checked.data.ends_at);
    if (checked.data.image_url) form.set("image_url", checked.data.image_url);
    if (imageMode === "file" && file) form.set("image", file);
    setError(null);
    startTransition(async () => {
      const result = await createLiveEventAction(form).catch(() => null);
      if (!result?.ok || !result.data) {
        setError(result?.error ?? "Couldn't reach the club's server. Try again.");
        return;
      }
      setSent(result.data);
    });
  };

  const startAnother = () => {
    setSent(null);
    setTopic("");
    setStartLocal("");
    setEndLocal("");
    setImageUrl("");
    clearFile();
    setError(null);
  };

  return {
    topic,
    setTopic,
    startLocal,
    changeStart,
    endLocal,
    setEndLocal,
    startsAt,
    endsAt,
    fileInput,
    image: { mode: imageMode, file, url: imageUrl, setUrl: setImageUrl, pickFile, clearFile, switchMode: switchImageMode },
    preview,
    urlPreview: imageMode === "url" ? safeImageUrl(imageUrl) : null,
    error,
    sent,
    pending,
    locked: pending || sent !== null,
    submit,
    startAnother,
  };
}
