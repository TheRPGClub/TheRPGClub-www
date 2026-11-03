"use client";

import { ArrowUpRight } from "lucide-react";
import { useIsClient } from "@/hooks/use-is-client";
import { clockReading, type LiveEventLinks } from "@/lib/live-events";

// The live event's poster proof: the image (or plain ink when there is
// none) under an ink scrim from the foot, the topic in Anton, and when it
// starts in the viewer's zone and club time. Once the bot has made them,
// the thread and the event are linked from the poster.
export function LiveEventPoster({
  topic,
  startsAt,
  imageSrc,
  links,
}: {
  topic: string;
  startsAt: string | null;
  imageSrc: string | null;
  links?: LiveEventLinks | null;
}) {
  const isClient = useIsClient();
  const start = isClient && startsAt ? clockReading(startsAt) : null;
  const hasLinks = Boolean(links?.thread || links?.event);

  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-ink-3">
      {imageSrc && (
        // eslint-disable-next-line @next/next/no-img-element -- a member's upload or any URL
        <img src={imageSrc} alt="" className="absolute inset-0 size-full object-cover" />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(0deg,rgb(11_11_13/0.96)_0%,rgb(11_11_13/0.6)_40%,rgb(11_11_13/0.1)_75%)]"
      />
      <div className="absolute inset-x-5.5 bottom-5.5">
        <p className="font-label text-[0.85rem] tracking-[0.08em] text-paper-dim">Live event · Live Events forum</p>
        <h3 className="font-headline mt-1.5 text-[2.3rem] leading-[0.9] break-words sm:text-[3.1rem]">
          {topic || <span className="text-paper-mute">Topic</span>}
        </h3>
        <p className="font-label mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.95rem] tracking-[0.06em]">
          {start ? (
            <>
              <span>
                {start.day} · {start.time}
              </span>
              <span className="text-paper-mute">{start.club}</span>
            </>
          ) : (
            <span className="text-paper-mute">Pick a start</span>
          )}
        </p>
        {hasLinks && (
          <p className="mt-3.5 flex flex-wrap gap-2">
            {links?.thread && <PosterLink href={links.thread}>Thread</PosterLink>}
            {links?.event && <PosterLink href={links.event}>Event</PosterLink>}
          </p>
        )}
      </div>
    </div>
  );
}

function PosterLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-label inline-flex h-8 items-center gap-1 rounded-sm bg-paper px-3 text-[0.9rem] font-extrabold text-ink hover:bg-highlight"
    >
      {children}
      <ArrowUpRight aria-hidden className="size-4" />
    </a>
  );
}
