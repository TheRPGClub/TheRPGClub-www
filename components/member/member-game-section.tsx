import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MemberGameSectionProps {
  title: string;
  count: number;
  seeAllHref: string;
  emptyMessage: string;
  // Slot for an owner-only "Add" trigger. Stays out of the read path so the
  // section component itself doesn't need to know who is logged in.
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function MemberGameSection({
  title,
  count,
  seeAllHref,
  emptyMessage,
  action,
  children,
  className,
}: MemberGameSectionProps) {
  const hasItems = count > 0;
  return (
    <section className={cn("space-y-3", className)}>
      <header className="flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <span className="text-sm text-muted-foreground tabular-nums">
            {count}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {action}
          {hasItems && (
            <Link
              href={seeAllHref}
              className="inline-flex items-center text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
            >
              See all
              <ChevronRight className="ml-0.5 size-3.5" />
            </Link>
          )}
        </div>
      </header>

      {hasItems ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {children}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}
