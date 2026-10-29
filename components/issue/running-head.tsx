import Link from "next/link";
import { cn } from "@/lib/utils";

// The top bar's running head: where you are, as a trail of the current
// route. The last crumb is the page itself; on phones only the last two
// show, so a deep page keeps its own name rather than truncating it away.

export interface Crumb {
  label: string;
  href: string;
}

export function RunningHead({ trail }: { trail: Crumb[] }) {
  if (trail.length === 0) return null;
  const last = trail.length - 1;

  return (
    <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
      <ol className="font-label flex min-w-0 items-center gap-2 text-[0.95rem] font-bold tracking-[0.08em] text-paper-mute">
        {trail.map((crumb, i) => (
          <li
            key={crumb.href}
            className={cn(
              "flex min-w-0 items-center gap-2",
              // Phones keep the page and its parent.
              i < last - 1 && "hidden sm:flex",
              // The page's own name holds; parents give way to it.
              i === last ? "max-w-[65%] shrink-0 sm:max-w-none" : "shrink",
            )}
          >
            {i > 0 && (
              <span
                aria-hidden
                // On phones the page's parent opens the trail, so its
                // separator would dangle.
                className={cn("text-gotm", i === last - 1 && "hidden sm:inline")}
              >
                /
              </span>
            )}
            {i === last ? (
              <span aria-current="page" className="truncate text-paper">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className={cn(
                  "min-w-0 truncate transition-colors hover:text-paper",
                  // Middle crumbs (a long game title) give way first.
                  i > 0 && "sm:max-w-[14rem]",
                )}
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
        {/* A section root closes on its slash ("DASHBOARD /"), so a lone
            crumb still reads as the start of a trail. */}
        {last === 0 && (
          <li aria-hidden className="shrink-0 text-gotm">
            /
          </li>
        )}
      </ol>
    </nav>
  );
}
