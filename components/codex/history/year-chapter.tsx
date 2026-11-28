import type { ReactNode } from "react";
import { chapterPhotos, eventCount } from "@/lib/codex/history";
import type { CodexEntry } from "@/lib/codex/types";
import { cn } from "@/lib/utils";
import { HistoryEvent } from "./history-event";
import { PinnedMount } from "./pinned-mount";

// A year's chapter (2B): the year in Anton at 120px over its count, its
// History Events beside it, and their photos pinned up at the right (no
// photo column when none has any). On phones: the year at 72px with its
// count on one line, the History Events, then the photos as a row of mounts
// scrolling inside the chapter.
export function YearChapter({
  year,
  count,
  events,
  linked,
  seeAlso,
}: {
  year: number;
  count: number;
  events: CodexEntry[];
  linked: boolean;
  seeAlso?: (event: CodexEntry) => ReactNode;
}) {
  const photos = chapterPhotos(events);
  return (
    <section
      aria-labelledby={`year-${year}`}
      data-slot="year-chapter"
      className={cn(
        "grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-5 border-t-2 border-foreground pt-4.5 pb-6.5",
        photos.length > 0 ? "lg:grid-cols-[250px_minmax(0,1fr)_250px]" : "lg:grid-cols-[250px_minmax(0,1fr)]",
      )}
    >
      <div className="flex items-baseline gap-3 lg:block">
        <h2 id={`year-${year}`} className="font-headline text-[4.5rem] leading-[0.78] tracking-[-0.01em] lg:text-[7.5rem]">
          {year}
        </h2>
        <p className="font-label text-[0.8rem] font-bold tracking-[0.08em] text-faint-foreground uppercase lg:mt-3">
          {eventCount(count)}
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-5 lg:pt-1">
        {events.map((event) => (
          <HistoryEvent key={event.id} event={event} linked={linked} seeAlso={seeAlso?.(event)} />
        ))}
      </div>
      {photos.length > 0 && (
        <div data-slot="year-chapter-photos" className="-mx-4 flex gap-4.5 overflow-x-auto px-4 pt-3 pb-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pt-1.5 lg:pb-0">
          {photos.map((photo, i) => (
            <PinnedMount key={photo.id} url={photo.url} alt={`${photo.title}, photo ${i + 1}`} tilt={photo.tilt} />
          ))}
        </div>
      )}
    </section>
  );
}
