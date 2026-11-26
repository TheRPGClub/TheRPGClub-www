"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { Bug } from "lucide-react";
import type { FeedbackForm } from "@/hooks/use-feedback-form";
import { SCREENSHOT_ACCEPT } from "@/lib/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormRow } from "./form-row";

// A Bug Report's optional screenshot: a drop zone (dashed ink, a bug
// watermark) that also opens the file picker; once there is one, its
// preview with Replace and Remove. Type and size are checked on pick.
export function ScreenshotField({ form }: { form: FeedbackForm }) {
  const { shot, pickFile, removeShot, pending } = form;
  const picker = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const image = useRef<HTMLImageElement>(null);
  // A picked file previews from an object URL made and revoked by the same
  // effect (so a StrictMode re-run makes a fresh one, never reusing a
  // revoked one) and put on the image directly; otherwise the stored one.
  useEffect(() => {
    if (!shot.file || !image.current) return;
    const url = URL.createObjectURL(shot.file);
    image.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [shot.file]);
  const existing = shot.removed ? null : shot.existing;
  const hasPreview = !!shot.file || !!existing;

  const input = (
    <Input
      ref={picker}
      id="feedback-screenshot"
      type="file"
      accept={SCREENSHOT_ACCEPT}
      disabled={pending}
      className="sr-only"
      onChange={(e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (file) pickFile(file);
      }}
    />
  );

  function drop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && !pending) pickFile(file);
  }

  return (
    <FormRow id="feedback-screenshot" label="Screenshot" optional>
      {hasPreview ? (
        <div className="flex flex-wrap items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- a local preview or a member's upload on the club's B2 bucket, which next/image isn't configured for */}
          <img ref={image} src={shot.file ? undefined : (existing ?? undefined)} alt="The screenshot" className="max-h-44 max-w-full rounded-sm border border-border object-contain sm:max-w-[60%]" />
          <div className="flex gap-2 sm:flex-col">
            {input}
            <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => picker.current?.click()}>
              Replace
            </Button>
            <Button type="button" variant="destructive-ghost" size="sm" disabled={pending} onClick={removeShot}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <Label
          variant="kind-drop"
          data-dragging={dragging || undefined}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={drop}
          className="relative flex min-h-20 items-center justify-center overflow-hidden px-4 py-4 text-center text-[0.9rem]"
        >
          {input}
          <Bug aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 size-[70px] -translate-1/2 text-(--k) opacity-15" />
          <span className="relative">
            Drop a PNG, JPEG or WebP up to 4 MB, or{" "}
            <u className="text-foreground decoration-highlight decoration-2 underline-offset-3">browse</u>
          </span>
        </Label>
      )}
    </FormRow>
  );
}
