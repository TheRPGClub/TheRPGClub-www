"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

// What the top bar reads of a desk (the Lore desk's, the History Event
// desk's). `unplaced` is the Lore desk's photos left out of the story.
export interface TopBarDesk {
  entryId: number | null;
  dirty: boolean;
  missing: string | null;
  saving: boolean;
  unplaced?: readonly unknown[];
  save: () => Promise<unknown>;
}

// The desk's top bar (5D): Back, the "goes live" note, Delete, Cancel and
// Save. On phones Cancel and Save stick to the foot of the screen and
// Delete moves to the foot of the page (the desk renders it there).
export function DeskTopBar({
  desk,
  back,
  backLabel,
  deleteButton,
  badge,
}: {
  desk: TopBarDesk;
  // Where Back and Cancel go.
  back: string;
  backLabel: string;
  // Delete for wide screens, when the viewer may.
  deleteButton?: ReactNode;
  badge?: ReactNode;
}) {
  const router = useRouter();
  const [leaving, setLeaving] = useState<string | null>(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const go = (href: string) => (desk.dirty ? setLeaving(href) : router.push(href));
  const extra = desk.unplaced?.length ?? 0;
  const save = () => (extra > 0 ? setConfirmSave(true) : void desk.save());

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {/* The site's back link (BackLink's look), kept a button so leaving
          with unsaved changes can ask first. */}
      <Button
        type="button"
        variant="back"
        size="bare"
        aria-label={`Back to ${backLabel}`}
        title={`Back to ${backLabel}`}
        onClick={() => go(back)}
        className="items-center gap-1.5 [&_svg]:size-3.5 max-md:-ml-1.5 max-md:size-8 max-md:justify-center max-md:[&_svg]:size-5"
      >
        <ArrowLeft aria-hidden />
        <span className="max-md:hidden">{backLabel}</span>
      </Button>
      <p className="font-label text-[0.8rem] font-bold tracking-[0.08em] text-faint-foreground">Changes go live when you save</p>
      {badge}
      <div className="fixed inset-x-0 bottom-[calc(3.875rem+env(safe-area-inset-bottom))] z-30 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm sm:static sm:z-auto sm:ml-auto sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        {desk.missing && (
          <p role="status" className="mr-auto text-[0.85rem] text-destructive sm:mr-1">
            {desk.missing}
          </p>
        )}
        {deleteButton}
        <Button type="button" variant="outline" onClick={() => go(back)}>
          Cancel
        </Button>
        <Button type="button" variant="highlight" onClick={save} disabled={!!desk.missing || desk.saving} className="min-w-32">
          {desk.saving ? <Loader2 aria-hidden className="motion-safe:animate-spin" /> : null}
          {desk.saving ? "Saving" : desk.entryId ? "Save changes" : "Publish"}
        </Button>
      </div>
      <ConfirmDialog
        open={leaving !== null}
        onOpenChange={(open) => !open && setLeaving(null)}
        title="Leave without saving?"
        description="What you've written here since the last save goes."
        confirmLabel="Leave"
        pendingLabel="Leaving…"
        cancelLabel="Keep writing"
        onConfirm={async () => {
          if (leaving) router.push(leaving);
          return null;
        }}
      />
      <ConfirmDialog
        open={confirmSave}
        onOpenChange={setConfirmSave}
        title={`${extra} photo${extra === 1 ? " isn't" : "s aren't"} in the story and will be removed.`}
        description="Place a photo in the story to keep it, or save without it."
        confirmLabel={extra === 1 ? "Save without it" : "Save without them"}
        pendingLabel="Saving…"
        cancelLabel="Back to the desk"
        onConfirm={async () => {
          setConfirmSave(false);
          await desk.save();
          return null;
        }}
      />
    </div>
  );
}
