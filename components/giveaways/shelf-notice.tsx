import { AlertCircle } from "lucide-react";

// Why a claim didn't go through, at the top of the rail.
export function ShelfNotice({ title, text }: { title: string; text: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-sm bg-foreground/6 px-3 py-2.5 text-sm text-foreground shadow-[inset_0_0_0_1px_var(--color-border-strong)]"
    >
      <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0 text-highlight" />
      <p>
        <b>{title}:</b> {text}
      </p>
    </div>
  );
}
