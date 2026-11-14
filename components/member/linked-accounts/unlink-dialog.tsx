"use client";

import { Loader2, Unlink } from "lucide-react";

import type { AchievementProvider } from "@/lib/api/types";
import { PROVIDER_LABEL } from "@/lib/achievements";
import { unlinkWarning } from "@/lib/linked-accounts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InlineError } from "./account-parts";

// The confirm before a Linked Account goes, saying what the member loses.
export function UnlinkDialog({
  provider,
  unlocks,
  open,
  onOpenChange,
  pending,
  error,
  onUnlink,
}: {
  provider: AchievementProvider;
  unlocks: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  error: string | null;
  onUnlink: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Unlink {PROVIDER_LABEL[provider]}?</DialogTitle>
          <DialogDescription>
            {unlinkWarning(provider, unlocks)} You can link the account again
            later, and its history will be imported from scratch.
          </DialogDescription>
        </DialogHeader>
        <InlineError message={error} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Keep it
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={onUnlink}
          >
            {pending ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Unlink data-icon="inline-start" />
            )}
            Unlink
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
