import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// The notice slip: the one way the site says "that didn't work". It sits
// over whatever it is about (the front page's cover art, the join panel's
// top edge) with a headline, one plain sentence, and an optional action and
// dismiss. The caller places it; each Theme draws it by its slot (the
// Monthly Issue pins a paper slip at a tilt), and its role tells an alert
// from a softer note.

export function NoticeSlip({
  title,
  children,
  action,
  dismissHref,
  onDismiss,
  role = "status",
  className,
}: {
  title: string;
  children: React.ReactNode;
  // An inverse button that recovers ("Try again").
  action?: React.ReactNode;
  // Where the dismiss control goes: the same page without the notice.
  dismissHref?: string;
  // Or a dismiss that clears it in place (a dropped-vote notice).
  onDismiss?: () => void;
  // "alert" when the page opens on a failure, "status" for a softer note.
  role?: "alert" | "status";
  // Placement only.
  className?: string;
}) {
  return (
    <div
      role={role}
      data-slot="notice-slip"
      className={cn("relative px-5.5 pt-5 pb-5", className)}
    >
      {dismissHref && (
        <Link
          href={dismissHref}
          scroll={false}
          aria-label="Dismiss"
          data-slot="notice-slip-dismiss"
          className="absolute top-2 right-2 grid size-8 place-items-center transition-colors focus-visible:outline-2"
        >
          <X className="size-4.5" aria-hidden />
        </Link>
      )}
      {onDismiss && !dismissHref && (
        <Button
          type="button"
          variant="inverse-ghost"
          size="icon"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="absolute top-2 right-2"
        >
          <X className="size-4.5" aria-hidden />
        </Button>
      )}
      <p data-slot="notice-slip-title" className={cn("font-headline", (dismissHref || onDismiss) && "pr-8")}>
        {title}
      </p>
      <div data-slot="notice-slip-body" className="mt-2.5 text-[0.95rem] leading-[1.45] [&_strong]:font-semibold">
        {children}
      </div>
      {action && <div className="mt-3.5">{action}</div>}
    </div>
  );
}
