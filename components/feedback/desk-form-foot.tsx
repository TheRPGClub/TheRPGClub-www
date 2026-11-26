import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

// The foot of a review tab in the Sheet: its refusal, if any, then Cancel
// (closes the Sheet) and the tab's own submit.
export function DeskFormFoot({
  error,
  pending,
  onCancel,
  children,
}: {
  error: string | null;
  pending: boolean;
  onCancel: () => void;
  children: ReactNode;
}) {
  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        {children}
      </div>
    </>
  );
}
