import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MemberReferenceRowProps {
  title: string;
  count: number;
  href: string;
  Icon?: LucideIcon;
  emptyMessage: string;
  action?: React.ReactNode;
  className?: string;
}

// Compact one-line summary used for the Backlog and Collection sections on the
// profile. They aren't visually featured (no cover grid) so they collapse to a
// link with a count and an optional "Add" action.
export function MemberReferenceRow({
  title,
  count,
  href,
  Icon,
  emptyMessage,
  action,
  className,
}: MemberReferenceRowProps) {
  const hasItems = count > 0;
  return (
    <section className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 text-sm">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          )}
          <div className="min-w-0">
            <p className="font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">
              {hasItems
                ? `${count} ${count === 1 ? "entry" : "entries"}`
                : emptyMessage}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {action}
          {hasItems && (
            <Link
              href={href}
              className="inline-flex items-center text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
            >
              View
              <ChevronRight className="ml-0.5 size-3.5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
