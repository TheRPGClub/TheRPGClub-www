import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// The notice slip: the one way the site says "that didn't work". A paper slip
// pinned at a tilt over whatever it is about (the front page's cover art, the
// join panel's top edge), with an Anton line, one plain sentence, and an
// optional action and dismiss. The caller places it; the slip owns its look.

export function NoticeSlip({
  title,
  children,
  action,
  dismissHref,
  role = "status",
  className,
}: {
  title: string;
  children: React.ReactNode;
  // An inverse button that recovers ("Try again").
  action?: React.ReactNode;
  // Where the dismiss control goes: the same page without the notice.
  dismissHref?: string;
  // "alert" when the page opens on a failure, "status" for a softer note.
  role?: "alert" | "status";
  // Placement only.
  className?: string;
}) {
  return (
    <div
      role={role}
      data-slot="notice-slip"
      className={cn(
        "relative -rotate-2 rounded-xs bg-foreground px-5.5 pt-5 pb-5 text-background shadow-[0_12px_30px_rgb(0_0_0/0.5)]",
        className,
      )}
    >
      {dismissHref && (
        <Link
          href={dismissHref}
          scroll={false}
          aria-label="Dismiss"
          className="absolute top-2 right-2 grid size-8 place-items-center rounded-sm text-background/70 transition-colors hover:bg-background/10 hover:text-background focus-visible:outline-2 focus-visible:outline-background"
        >
          <X className="size-4.5" aria-hidden />
        </Link>
      )}
      <p className={cn("font-headline text-[2rem] leading-[0.9] sm:text-[2.2rem]", dismissHref && "pr-8")}>
        {title}
      </p>
      <div className="mt-2.5 text-[0.95rem] leading-[1.45] text-background/75 [&_strong]:font-semibold [&_strong]:text-background">
        {children}
      </div>
      {action && <div className="mt-3.5">{action}</div>}
    </div>
  );
}
