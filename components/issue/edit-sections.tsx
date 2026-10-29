"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

// The edit page's section switcher: a sticky rail of the member's lists and
// socials (a strip of tabs on phones), with only the chosen section shown.
// The choice lives in the URL hash, so `/edit#socials` (where the imports
// send a member to link an account) opens straight onto that section.

export interface EditSection {
  // Also the URL hash, e.g. "socials".
  id: string;
  label: string;
  count?: number;
  content: ReactNode;
}

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

const readHash = () => window.location.hash.slice(1);
const serverHash = () => "";

export function EditSections({
  sections,
  importsHref,
}: {
  sections: EditSection[];
  importsHref: string;
}) {
  const hash = useSyncExternalStore(subscribe, readHash, serverHash);
  const current = sections.find((s) => s.id === hash) ?? sections[0];

  // Swap the hash without the jump a plain anchor makes, then tell the store.
  const choose = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.replaceState(null, "", `#${id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-9 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <nav
        aria-label="Edit sections"
        className="md:sticky md:top-20 md:self-start"
      >
        <ul className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-col md:gap-0.5 md:overflow-visible md:px-0 md:pb-0">
          {sections.map((section) => {
            const on = section.id === current.id;
            return (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  onClick={choose(section.id)}
                  aria-current={on ? "true" : undefined}
                  className={cn(
                    "font-label flex h-9 items-center justify-between gap-3 rounded-sm px-3 text-[0.95rem] font-extrabold tracking-[0.04em] transition-colors md:h-11 md:text-[1.05rem]",
                    on
                      ? "bg-paper text-ink"
                      : "bg-ink-2 text-paper-dim hover:bg-ink-3 hover:text-paper md:bg-transparent",
                  )}
                >
                  {section.label}
                  {section.count !== undefined && (
                    <span
                      className={cn(
                        "font-headline text-[1.05rem] tracking-normal",
                        on ? "text-ink" : "text-paper-mute",
                      )}
                    >
                      {section.count}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
          <li className="shrink-0 md:mt-2.5 md:border-t md:border-rule md:pt-2.5">
            <Link
              href={importsHref}
              className="font-label flex h-9 items-center justify-between gap-3 rounded-sm bg-ink-2 px-3 text-[0.95rem] font-extrabold tracking-[0.04em] text-paper transition-colors hover:bg-ink-3 hover:text-highlight md:h-11 md:bg-transparent md:text-[1.05rem]"
            >
              Import games
              <FileUp aria-hidden className="size-4" />
            </Link>
          </li>
        </ul>
      </nav>

      <div key={current.id} className="min-w-0">
        {current.content}
      </div>
    </div>
  );
}
