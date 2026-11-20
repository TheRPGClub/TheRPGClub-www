import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// A Dashboard Panel's items (unify pick B): rows split by hairlines, two
// across in a wide panel from `sm`, one column in the rail and on phones.
export function PanelList({ wide, children }: { wide: boolean; children: ReactNode }) {
  return (
    <ol
      className={cn(
        "grid grid-cols-1",
        wide && "sm:grid-cols-2 sm:gap-x-7 sm:[&>li:nth-child(2)]:border-t-0",
      )}
    >
      {children}
    </ol>
  );
}

// One item: a media column (cover, news frame, die-cut icon, avatar, date
// block), a two-line title over one label-type meta line, and a right column
// (when, a chip). The title is the link when there is one; `external` opens
// an outside page.
export function PanelItem({
  media,
  title,
  href,
  external = false,
  meta,
  aside,
  plain = false,
}: {
  media?: ReactNode;
  title: ReactNode;
  href?: string | null;
  external?: boolean;
  meta?: ReactNode;
  aside?: ReactNode;
  // A sentence ("Mara cleared Hades II"): regular weight, its bold parts in
  // paper, the rest dimmer.
  plain?: boolean;
}) {
  const titleClass = cn(
    "line-clamp-2 text-[0.9375rem] leading-[1.25] text-pretty",
    plain ? "font-normal text-dim-foreground [&_b]:font-semibold [&_b]:text-foreground" : "font-semibold",
  );
  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-t border-border py-2.5 first:border-t-0">
      <span className="flex items-center">{media}</span>
      <span className="flex min-w-0 flex-col gap-0.5">
        {href ? (
          <Link
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={cn(titleClass, "transition-colors hover:text-highlight")}
          >
            {title}
          </Link>
        ) : (
          <span className={titleClass}>{title}</span>
        )}
        {meta && (
          <span className="font-label flex items-center gap-1.5 truncate text-[0.78rem] font-semibold tracking-[0.05em] text-faint-foreground [&_b]:font-bold [&_b]:text-dim-foreground">
            {meta}
          </span>
        )}
      </span>
      <span className="flex items-center">{aside}</span>
    </li>
  );
}

// The right column's "2h" / "Sat 21 Nov".
export function PanelWhen({ children }: { children: ReactNode }) {
  return (
    <span className="font-label text-[0.78rem] font-semibold tracking-[0.04em] whitespace-nowrap normal-case text-faint-foreground">
      {children}
    </span>
  );
}

// "Mara · PS5": the meta line's parts, the empty ones dropped.
export function MetaParts({ parts }: { parts: (ReactNode | null | undefined | false)[] }) {
  const shown = parts.filter((part) => part != null && part !== false && part !== "");
  return (
    <span className="truncate">
      {shown.map((part, i) => (
        <span key={i}>
          {i > 0 && " · "}
          {part}
        </span>
      ))}
    </span>
  );
}
