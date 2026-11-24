import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ManagedList } from "@/lib/members/managed-lists";

// The small "Manage your lists" row under the edit page's rail (pick 4): each
// list is added to, edited and reordered on its own page now, so the edit
// page only points there. On phones, a second scrolling strip under the tabs.
export function ManageListsRow({ lists }: { lists: ManagedList[] }) {
  if (lists.length === 0) return null;
  return (
    <div className="-mx-4 mt-2 flex items-center gap-4 overflow-x-auto px-4 md:mx-0 md:mt-4.5 md:block md:overflow-visible md:border-t md:border-border md:px-0 md:pt-3">
      <p
        id="manage-lists-label"
        className="font-label shrink-0 text-[0.78rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase md:px-3 md:pb-2"
      >
        Manage your lists
      </p>
      <ul
        aria-labelledby="manage-lists-label"
        className="flex shrink-0 gap-4 md:flex-col md:gap-0"
      >
        {lists.map((list) => (
          <li key={list.hash} className="shrink-0">
            <Link
              href={list.href}
              className="font-label group flex h-8 items-center justify-between gap-3 rounded-sm text-[0.9rem] font-extrabold tracking-[0.04em] text-faint-foreground transition-colors hover:text-foreground md:h-8.5 md:px-3 md:text-[0.92rem] md:hover:bg-muted"
            >
              {list.label}
              <ArrowUpRight
                aria-hidden
                className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 max-md:hidden"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
