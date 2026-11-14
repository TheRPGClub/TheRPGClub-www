import type { CompletionatorImportItem, CompletionatorImportReview } from "@/lib/api/types";
import type { ImportItemPanelProps } from "@/components/imports/import-item-panel";

// A Completionator review with its row, as the panel's steps receive it.
export type CompletionatorReview = CompletionatorImportReview & { item: CompletionatorImportItem };

// What every step of the panel takes: the item panel's props with the
// review narrowed to Completionator's.
export type CompletionatorStepProps = Omit<ImportItemPanelProps, "review"> & {
  review: CompletionatorReview;
};
