import type { ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";

// The printer's colour bar along the strip's top edge, in the paper tones
// and the game's track ink.
export const TRACK_INK: Record<ReviewAccent, string> = {
  brand: "bg-gotm",
  purple: "bg-nr",
  neutral: "bg-foreground",
};

// The strip along the desk's foot, held at the bottom of the screen: a
// Draft's (autosave, checklist, Discard, Publish) or a Published Review's
// Edit (Cancel, Save changes). On a phone it rides above the tab bar.
export function DeskStrip({
  accent,
  alarm,
  children,
}: {
  accent: ReviewAccent;
  // Edged in the destructive red while it asks a destructive question.
  alarm?: boolean;
  children: React.ReactNode;
}) {
  const ink = TRACK_INK[accent];
  const bar = [
    "bg-foreground", "bg-dim-foreground", "bg-faint-foreground", "bg-border-strong", ink, "bg-muted",
    "bg-foreground", "bg-faint-foreground", ink, "bg-border-strong", "bg-dim-foreground", "bg-muted",
  ];
  return (
    <div
      className={cn(
        "sticky bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-20 rounded-sm border bg-background shadow-[0_-10px_30px_rgb(0_0_0/0.45)] md:bottom-4",
        alarm ? "border-destructive" : "border-border-strong",
      )}
    >
      <div aria-hidden className="flex h-1.5">
        {bar.map((c, i) => (
          <i key={i} className={cn("flex-1", c)} />
        ))}
      </div>
      {children}
    </div>
  );
}
