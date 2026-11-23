"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CircleCheck, CircleDashed } from "lucide-react";
import { liveEventLinks } from "@/lib/live-events";
import { useIsClient } from "@/hooks/use-is-client";
import type { LiveEventState } from "@/hooks/use-live-event";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// What happened to the event since it was sent, step by step: saved, the
// bot picking it up, the thread, then the scheduled event.
export function LiveEventDispatch({ state, guildId }: { state: LiveEventState; guildId: string | null }) {
  const isClient = useIsClient();
  const { event } = state;
  const links = liveEventLinks(event, guildId);
  const failed = event.status === "failed";
  const threadMade = Boolean(event.discord_thread_id) || event.status === "thread_created" || event.status === "created";
  const eventMade = Boolean(event.discord_event_id) || event.status === "created";
  const savedAt = isClient
    ? new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(
        new Date(event.created_at),
      )
    : "";

  return (
    <section aria-label="Dispatch" className="mt-5 border-t-2 border-foreground pt-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-label text-[1rem] font-extrabold tracking-[0.06em]">Dispatch</h3>
        {event.bot_job_id != null && (
          <span className="font-label text-[0.78rem] tracking-[0.08em] text-faint-foreground">Bot job #{event.bot_job_id}</span>
        )}
      </div>
      <ol aria-live="polite">
        <Step icon="done" meta={savedAt}>
          Saved and handed to the bot
        </Step>
        {threadMade ? (
          <Step icon="done" meta={links.thread ? <OutLink href={links.thread} /> : null}>
            Thread made in the Live Events forum
          </Step>
        ) : failed ? null : (
          <Step icon="wait" meta="checks every 10 s">
            Waiting for the bot to pick it up
          </Step>
        )}
        {eventMade ? (
          <Step icon="done" meta={links.event ? <OutLink href={links.event} /> : null}>
            Discord scheduled event made
          </Step>
        ) : failed ? (
          <Step icon="failed" meta={event.bot_job_id == null ? <Link href="/admin?tab=jobs" className="hover:text-highlight">Bot jobs</Link> : null}>
            {event.bot_job_id == null
              ? "The bot couldn't finish. Its error is in Bot jobs on the Staff desk."
              : "The bot couldn't finish. Its error is under the proof."}
          </Step>
        ) : (
          <Step icon="todo" meta="links land here" muted>
            {threadMade ? "Then the scheduled event" : "Thread in the Live Events forum, then the scheduled event"}
          </Step>
        )}
      </ol>
      {(state.error || (!state.refreshing && !failed && !eventMade && !state.stuck)) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-sm">
          {state.error && <span className="text-destructive">{state.error}</span>}
          {!state.refreshing && !state.stuck && !failed && !eventMade && (
            <Button type="button" variant="outline" size="sm" disabled={state.checking} onClick={state.checkAgain}>
              Check again
            </Button>
          )}
        </div>
      )}
    </section>
  );
}

function Step({
  icon,
  meta,
  muted,
  children,
}: {
  icon: "done" | "wait" | "todo" | "failed";
  meta?: ReactNode;
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <li
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-border py-1.75 text-[0.9rem]",
        muted && "text-faint-foreground",
        icon === "failed" && "text-destructive",
      )}
    >
      {icon === "done" && <CircleCheck aria-hidden className="size-4 text-ok" />}
      {icon === "todo" && <CircleDashed aria-hidden className="size-4" />}
      {icon === "failed" && <AlertTriangle aria-hidden className="size-4" />}
      {icon === "wait" && (
        <span aria-hidden className="grid size-4 place-items-center">
          <span className="size-2 rounded-full bg-highlight motion-safe:animate-pulse" />
        </span>
      )}
      <span>{children}</span>
      <span className="text-[0.8rem] text-faint-foreground">{meta}</span>
    </li>
  );
}

function OutLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 hover:text-highlight">
      Open
      <ArrowUpRight aria-hidden className="size-3.5" />
    </a>
  );
}
