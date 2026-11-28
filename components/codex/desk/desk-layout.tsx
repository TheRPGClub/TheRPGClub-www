import type { ReactNode } from "react";
import { DeskTopBar, type TopBarDesk } from "./desk-top-bar";

// The writing desk's frame (5D), shared by the Lore desk and the History
// Event desk: the top bar, the save error, the manuscript sheet beside its
// drawer of cards, and on phones Delete at the foot of the page. `remove`
// draws Delete with the given class (hidden on phones in the top bar), or
// is null when the viewer may not delete.
export function DeskLayout({
  desk,
  back,
  backLabel,
  badge,
  error,
  remove,
  sheet,
  children,
}: {
  desk: TopBarDesk;
  back: string;
  backLabel: string;
  badge?: ReactNode;
  error: string | null;
  remove: ((className?: string) => ReactNode) | null;
  sheet: ReactNode;
  // The drawer's cards.
  children: ReactNode;
}) {
  return (
    <div data-slot="writing-desk" className="pb-24 sm:pb-0">
      <DeskTopBar
        desk={desk}
        back={back}
        backLabel={backLabel}
        deleteButton={remove?.("hidden sm:inline-flex")}
        badge={badge}
      />
      {error && (
        <p role="alert" className="mt-3 rounded-sm border border-destructive/60 px-3.5 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="mt-4.5 grid grid-cols-[minmax(0,1fr)] items-start gap-8.5 lg:grid-cols-[minmax(0,1fr)_360px]">
        {sheet}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5.5 pt-1.5">{children}</div>
      </div>
      {remove && <div className="mt-10 border-t border-border pt-4 sm:hidden">{remove()}</div>}
    </div>
  );
}
