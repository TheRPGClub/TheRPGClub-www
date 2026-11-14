"use client";

import Link from "next/link";
import {
  SET_PAGE_VIEWS,
  setPageViewHref,
  type SetPageView,
} from "@/lib/achievements/set-page";
import type { SetTint } from "@/lib/achievements/tint-color";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// The spread's index tabs on its top edge, the current view's tab in the
// game tint. Each tab is a link (`?view=`), so the URL holds the view.
export function SpreadTabs({
  view,
  basePath,
  tint,
}: {
  view: SetPageView;
  basePath: string;
  tint: SetTint;
}) {
  return (
    <Tabs value={view} className="gap-0">
      <TabsList
        variant="index"
        aria-label="Views"
        className="pl-5 sm:pl-7"
        style={
          { "--tab-ink": tint.tint, "--tab-ink-foreground": tint.contrast } as React.CSSProperties
        }
      >
        {SET_PAGE_VIEWS.map((option) => (
          <TabsTrigger
            key={option.key}
            value={option.key}
            nativeButton={false}
            render={<Link href={setPageViewHref(basePath, option.key)} scroll={false} />}
            className="h-9 flex-none gap-0 border-0 px-3.5 py-0 text-[0.95rem] data-active:h-11 sm:px-5 sm:text-[1rem]"
          >
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
