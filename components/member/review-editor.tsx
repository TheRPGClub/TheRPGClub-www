"use client";

import { Plate, PlateContent, usePlateEditor } from "platejs/react";
import type { Value } from "platejs";

import { MAX_REVIEW_LENGTH } from "@/lib/api/review-body";
import { cn } from "@/lib/utils";
import { ReviewEditorToolbar } from "./review-editor-toolbar";
import { reviewComponents, reviewPlugins } from "./review-plugins";

export interface ReviewEditorProps {
  // Initial content only. The editor owns its value after mount; changes come
  // back through `onChange`.
  initialValue: Value;
  onChange: (value: Value) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ReviewEditor({
  initialValue,
  onChange,
  disabled,
  placeholder = "What did you think? (optional)",
}: ReviewEditorProps) {
  const editor = usePlateEditor({
    plugins: reviewPlugins,
    components: reviewComponents,
    value: initialValue,
    // Plate enforces this while typing, so the server-side check in
    // `app/actions/reviews.ts` is a backstop rather than the first line.
    maxLength: MAX_REVIEW_LENGTH,
  });

  return (
    <Plate
      editor={editor}
      readOnly={disabled}
      onValueChange={({ value }) => onChange(value)}
    >
      <div
        className={cn(
          "rounded-lg border border-input bg-background",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          disabled && "opacity-50",
        )}
      >
        {!disabled && (
          <ReviewEditorToolbar className="border-b border-input px-1.5 py-1" />
        )}
        <PlateContent
          placeholder={placeholder}
          disableDefaultStyles
          className={cn(
            "min-h-32 w-full px-3 py-2 text-sm leading-relaxed outline-none",
            "[&_[data-slate-placeholder]]:text-muted-foreground",
          )}
        />
      </div>
    </Plate>
  );
}
