import { Power, X } from "lucide-react";
import { REASON_MAX } from "@/lib/feature-flags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DraftProps {
  reasonId: string;
  draft: string;
  onDraft: (v: string) => void;
}

function ReasonField({ reasonId, draft, onDraft, onEnter }: DraftProps & { onEnter: () => void }) {
  const over = draft.trim().length > REASON_MAX;
  return (
    <Input
      id={reasonId}
      value={draft}
      onChange={(e) => onDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter();
        }
      }}
      placeholder="e.g. Journal sync broken, pausing"
      autoComplete="off"
      autoFocus
      aria-invalid={over || undefined}
      aria-describedby={`${reasonId}-hint`}
      variant="inset"
      className="min-w-48 flex-1"
    />
  );
}

// The reason note under a row: its text goes with the next state picked.
export function ReasonEditor({ name, onClose, ...field }: DraftProps & { name: string; onClose: () => void }) {
  return (
    <div className="rounded-md border border-highlight/60 bg-card px-3.5 pt-2.5 pb-3">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={field.reasonId} className="font-label text-[0.78rem] tracking-[0.08em] text-foreground">
          Reason for {name}&apos;s next change
        </label>
        <Button type="button" variant="note" size="icon-sm" onClick={onClose} aria-label="Close the reason">
          <X aria-hidden className="size-4" />
        </Button>
      </div>
      <div className="mt-1.5 flex">
        <ReasonField {...field} onEnter={onClose} />
      </div>
      <p id={`${field.reasonId}-hint`} className="mt-1.5 text-[0.8rem] text-faint-foreground">
        Optional. It goes with the state you pick next, here and in the admin channel.
      </p>
    </div>
  );
}

// The Off confirm under a row, its question cut into the dashed border. No
// typed words: Off is undone with one click.
export function OffConfirm({
  name,
  busy,
  onConfirm,
  onCancel,
  ...field
}: DraftProps & { name: string; busy: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <fieldset className="min-w-0 rounded-md border-[1.5px] border-dashed border-destructive bg-destructive/[0.04] px-3.5 pt-1 pb-3.5">
      <legend className="font-label flex items-center gap-1.5 px-1.5 text-[0.72rem] tracking-[0.08em] text-destructive">
        <Power aria-hidden className="size-[13px]" />
        Turn {name} Off?
      </legend>
      <p className="mt-0.5 mb-2.5 text-[0.84rem] text-dim-foreground">
        Nobody can use it, staff included. Its pages go not-found, its bot commands answer that it isn&apos;t
        available yet, and its automated posts and jobs pause until it&apos;s back on.
      </p>
      <label htmlFor={field.reasonId} className="sr-only">
        Reason (optional)
      </label>
      <div className="flex flex-wrap gap-2">
        <ReasonField {...field} onEnter={onConfirm} />
        <Button type="button" variant="destructive-solid" disabled={busy} onClick={onConfirm}>
          <Power data-icon="inline-start" />
          {busy ? "Turning off..." : "Turn Off"}
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
      </div>
      <p id={`${field.reasonId}-hint`} className="mt-1.5 text-[0.8rem] text-faint-foreground">
        Reason optional; it shows here and in the admin channel.
      </p>
    </fieldset>
  );
}
