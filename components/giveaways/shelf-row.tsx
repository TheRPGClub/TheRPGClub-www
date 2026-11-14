import type { CSSProperties, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import type { PlatformShelf } from "@/lib/giveaways";
import { PlatformChip } from "@/components/giveaways/platform-chip";

// One platform's shelf: its name and key count, then its gift boxes standing
// on a heavy rule (the boxes take the platform's ribbon ink from --p).
export function ShelfRow({ shelf, children }: { shelf: PlatformShelf; children: ReactNode }) {
  return (
    <section aria-labelledby={`shelf-${shelf.family.key}`}>
      <div className="mb-3 flex items-center gap-2.5">
        <h2 id={`shelf-${shelf.family.key}`} className="font-headline text-2xl">
          {shelf.family.label}
        </h2>
        <PlatformChip ink={shelf.family.ink}>
          {shelf.count} {shelf.count === 1 ? "key" : "keys"}
        </PlatformChip>
      </div>
      <ul
        className="relative flex snap-x gap-[18px] overflow-x-auto border-b-[6px] border-border-strong px-1.5 pt-2.5 [scrollbar-width:thin]"
        style={{ "--p": shelf.family.ink } as CSSProperties}
      >
        {children}
      </ul>
      <div aria-hidden className="mt-1 h-2 bg-muted" />
    </section>
  );
}

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
