import { Bug, Sparkles, Wrench, type LucideIcon } from "lucide-react";
import type { FeedbackKind } from "@/lib/api/types";

// Each kind's Lucide icon, drawn in its kind ink on the board's tabs and the
// form's kind choice.
export const KIND_ICON: Record<FeedbackKind, LucideIcon> = {
  feature_request: Sparkles,
  suggestion: Wrench,
  bug_report: Bug,
};
