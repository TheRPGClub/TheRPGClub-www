"use client";

import { useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface MastheadTab<K extends string> {
  key: K;
  label: string;
  // The tab's state under its name ("7 of 9 shown"); empty for none.
  note: string;
  // live: in paper, the club's business; bad: in signal orange, a failure.
  tone?: "live" | "bad";
  panel: React.ReactNode;
}

// Page tabs in the masthead voice (/settings, the Staff desk): each name in
// Anton with its state under it, the open one in paper over the red
// you-are-here bar. The caller owns which tab is open (and keeps it in the
// URL); every panel stays mounted, so work in one survives a trip to
// another. On a phone the row scrolls sideways.
export function MastheadTabs<K extends string>({
  value,
  onValueChange,
  tabs,
  label,
}: {
  value: K;
  onValueChange: (next: K) => void;
  tabs: MastheadTab<K>[];
  // The tab list's accessible name.
  label: string;
}) {
  // On a phone the row scrolls: keep the open tab in sight, without moving
  // the page.
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reveal = () => {
      const row = list.current;
      const open = row?.querySelector<HTMLElement>("[data-active]");
      if (!row || !open || row.scrollWidth <= row.clientWidth) return;
      const left = open.offsetLeft - row.offsetLeft;
      if (left < row.scrollLeft || left + open.offsetWidth > row.scrollLeft + row.clientWidth) {
        row.scrollTo({ left: left - 16 });
      }
    };
    reveal();
    // Anton arriving late widens the names.
    document.fonts?.ready.then(reveal);
  }, [value]);

  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as K)} className="block">
      <TabsList ref={list} variant="masthead" aria-label={label} className="-mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 sm:mx-0 sm:w-full sm:px-0">
        {tabs.map((t) => (
          <TabsTrigger key={t.key} value={t.key} className="h-auto flex-none flex-col items-start gap-1.5 px-0 pt-1 pb-3">
            <span className="font-headline text-[1.4rem] leading-none sm:text-[1.7rem]">{t.label}</span>
            {/* An empty state line still holds its height, so every name
                sits on one line. */}
            <span
              aria-hidden={t.note ? undefined : true}
              className={cn(
                "font-label text-xs font-semibold tracking-[0.06em] text-faint-foreground",
                t.tone === "live" && "text-foreground",
                t.tone === "bad" && "text-destructive",
              )}
            >
              {t.note || "\u00a0"}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((t) => (
        <TabsContent key={t.key} value={t.key} keepMounted className="pt-8 text-base">
          {t.panel}
        </TabsContent>
      ))}
    </Tabs>
  );
}
