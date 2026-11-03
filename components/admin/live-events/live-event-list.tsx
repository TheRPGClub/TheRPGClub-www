"use client";

import { ArrowUpRight } from "lucide-react";
import type { LiveEvent } from "@/lib/api/types";
import { useIsClient } from "@/hooks/use-is-client";
import { clockReading, durationText, liveEventLinks, liveEventPhase } from "@/lib/live-events";
import { Stamp } from "@/components/admin/desk/stamp";

const PROGRESS: Record<LiveEvent["status"], string> = {
  queued: "Waiting for the bot",
  thread_created: "Thread made, the event is next",
  created: "Thread and event made",
  failed: "The bot couldn't finish; its error is on the wire",
};

// The live events, newest first, as slips: when it starts in the viewer's
// zone and club time, the topic, how far the bot got, and the links.
export function LiveEventList({ events, guildId }: { events: LiveEvent[]; guildId: string | null }) {
  const isClient = useIsClient();
  if (events.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-rule-strong px-4 py-5 text-sm text-paper-dim">
        No live events yet. A new one gets a forum thread and a Discord event.
      </p>
    );
  }
  return (
    <ol className="border-t-2 border-paper">
      {events.map((event) => {
        const start = isClient ? clockReading(event.starts_at) : null;
        const links = liveEventLinks(event, guildId);
        const length = durationText(event.starts_at, event.ends_at);
        return (
          <li key={event.id} className="grid grid-cols-[4.6rem_minmax(0,1fr)] gap-3.5 border-b border-rule py-3 sm:grid-cols-[5.2rem_minmax(0,1fr)_auto]">
            <time dateTime={event.starts_at} className="font-headline text-[1.6rem] leading-[0.9] text-paper-dim">
              {start?.time ?? "--:--"}
              <small className="font-label mt-1 block text-[0.7rem] tracking-[0.08em] text-paper-mute">
                {start?.day ?? " "}
              </small>
            </time>
            <div className="min-w-0">
              <h3 className="font-semibold break-words">{event.topic}</h3>
              <p className="text-[0.84rem] text-paper-dim">
                Club time {start?.club ?? "--"}
                {length ? ` · ${length}` : ""}
              </p>
              <p className="text-[0.82rem] text-paper-mute">{PROGRESS[event.status]}</p>
              {(links.thread || links.event) && (
                <p className="font-label mt-1 flex gap-3 text-[0.82rem] tracking-[0.06em] text-paper-dim">
                  {links.thread && <Out href={links.thread}>Thread</Out>}
                  {links.event && <Out href={links.event}>Event</Out>}
                </p>
              )}
            </div>
            <div className="col-start-2 sm:col-start-3 sm:row-start-1 sm:self-start">
              <Stamp phase={liveEventPhase(event.status)} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Out({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 hover:text-highlight">
      {children}
      <ArrowUpRight aria-hidden className="size-3.5" />
    </a>
  );
}
