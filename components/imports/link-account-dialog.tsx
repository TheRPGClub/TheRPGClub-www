"use client";

import Link from "next/link";
import { Link2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface LinkAccountDialogProps {
  // The social platform label, e.g. "Steam".
  account: string;
  linkHref: string;
  backHref: string;
}

// Shown over an import's start screen while the member hasn't linked the
// account it reads. It can't be dismissed: the only ways out are linking the
// account or going back, so the start form behind it is never usable.
export function LinkAccountDialog({ account, linkHref, backHref }: LinkAccountDialogProps) {
  return (
    <Dialog open disablePointerDismissal>
      <DialogContent showCloseButton={false} className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-sm bg-highlight text-ink">
            <Link2 aria-hidden className="size-5" />
          </div>
          <DialogTitle>
            Link your {account} account first
          </DialogTitle>
          <DialogDescription>
            Add your {account} profile to the socials on your profile, with the
            platform named &ldquo;{account}&rdquo;. Then come back here to start
            the import.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link href={backHref} className={buttonVariants({ variant: "outline" })}>
            Back to imports
          </Link>
          <Link href={linkHref} className={cn(buttonVariants({ variant: "highlight" }), "gap-1.5")}>
            Link {account}
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
