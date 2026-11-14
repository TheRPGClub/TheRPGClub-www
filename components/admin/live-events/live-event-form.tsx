"use client";

import type { ReactNode } from "react";
import type { LiveEvent } from "@/lib/api/types";
import { durationText, liveEventLinks, liveEventPhase, squishTopic, TOPIC_MAX } from "@/lib/live-events";
import { useLiveEvent, type LiveEventState } from "@/hooks/use-live-event";
import { useLiveEventForm } from "@/hooks/use-live-event-form";
import { ProofCard } from "@/components/admin/desk/proof-card";
import { Input } from "@/components/ui/input";
import { LIVE_EVENT_LABEL, LiveEventClock } from "./live-event-clock";
import { LiveEventDispatch } from "./live-event-dispatch";
import { LiveEventImageField } from "./live-event-image-field";
import { LiveEventPoster } from "./live-event-poster";
import { LiveEventSendRow } from "./live-event-send-row";

// Follows a sent event and hands its state to the layout, so the dispatch
// list and the proof's stamp read the same refresh run.
function Tracker({ initial, children }: { initial: LiveEvent; children: (s: LiveEventState) => ReactNode }) {
  return children(useLiveEvent(initial));
}

// The live event form (mock admin-c-4): the topic set big, the start and end
// as two clocks in the viewer's zone with club time under each, an optional
// image as a file or a URL, and the poster proof beside it. Once sent the
// proof is stamped Queued and the dispatch list follows the event to its
// thread and scheduled event.
export function LiveEventForm({ guildId }: { guildId: string | null }) {
  const f = useLiveEventForm();
  const { sent, locked, startsAt, endsAt } = f;

  const layout = (tracked: LiveEventState | null) => {
    const event = tracked?.event ?? null;
    const jobId = event?.bot_job_id ?? null;
    return (
      <div className="mt-6 grid items-start gap-9 xl:grid-cols-[minmax(0,1fr)_30rem]">
        <form onSubmit={f.submit} aria-label="New live event" className="min-w-0">
          <label htmlFor="live-event-topic" className={LIVE_EVENT_LABEL}>
            Topic
          </label>
          <Input
            id="live-event-topic"
            name="topic"
            variant="headline"
            value={f.topic}
            onChange={(e) => f.setTopic(e.target.value)}
            maxLength={TOPIC_MAX}
            required
            disabled={locked}
            autoComplete="off"
            placeholder="What are we playing?"
            className="font-headline block h-auto min-w-auto border-0 border-b-2 px-0 pt-1.5 pb-2.5 text-[1.8rem] leading-none md:text-[2.4rem]"
          />
          <p className="mt-1 text-right text-[0.8rem] text-faint-foreground">
            {squishTopic(f.topic).length} / {TOPIC_MAX}
          </p>

          <div className="mt-4 grid border-t border-border md:grid-cols-2">
            <LiveEventClock id="live-event-start" label="Starts" value={f.startLocal} onChange={f.changeStart} iso={startsAt} disabled={locked} />
            <LiveEventClock
              id="live-event-end"
              label="Ends"
              value={f.endLocal}
              onChange={f.setEndLocal}
              iso={endsAt}
              duration={startsAt && endsAt ? durationText(startsAt, endsAt) : null}
              disabled={locked}
              second
            />
          </div>

          <LiveEventImageField image={f.image} fileInput={f.fileInput} disabled={locked} />

          {f.error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {f.error}
            </p>
          )}

          <LiveEventSendRow sent={sent !== null} pending={f.pending} onStartAnother={f.startAnother} />

          {tracked && <LiveEventDispatch state={tracked} guildId={guildId} />}
        </form>

        <div className="min-w-0 xl:sticky xl:top-[84px]">
          <ProofCard
            jobId={jobId}
            phase={event && jobId == null ? liveEventPhase(event.status) : null}
            what="The live event"
            overhang
            caption="A proof of the post. Discord sizes the image for the thread and the event itself."
          >
            {(job) => (
              <LiveEventPoster
                topic={event ? event.topic : squishTopic(f.topic)}
                startsAt={event ? event.starts_at : startsAt}
                imageSrc={event ? (event.image_url ?? f.preview) : (f.preview ?? f.urlPreview)}
                links={event ? liveEventLinks(event, guildId, job) : null}
              />
            )}
          </ProofCard>
        </div>
      </div>
    );
  };

  return sent ? (
    <Tracker key={sent.id} initial={sent}>
      {layout}
    </Tracker>
  ) : (
    layout(null)
  );
}
