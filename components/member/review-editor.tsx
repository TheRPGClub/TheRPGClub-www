"use client";

import type { Value } from "platejs";

import { RichTextEditor } from "@/components/rich-text/rich-text-editor";
import { REVIEW_SCHEMA } from "@/lib/api/review-body";

export interface ReviewEditorProps {
  // Initial content only. The editor owns its value after mount; changes come
  // back through `onChange`.
  initialValue: Value;
  onChange: (value: Value) => void;
  disabled?: boolean;
  placeholder?: string;
  toolbar?: "compact" | "full";
}

// A review's body: the shared rich-text editor under REVIEW_SCHEMA, which
// `app/actions/reviews.ts` checks again on save.
export function ReviewEditor({
  placeholder = "What did you think? (optional)",
  ...props
}: ReviewEditorProps) {
  return (
    <RichTextEditor schema={REVIEW_SCHEMA} placeholder={placeholder} {...props} />
  );
}
