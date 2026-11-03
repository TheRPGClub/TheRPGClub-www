"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CircleCheck, CircleDashed, ImageIcon, Link2, Plus, Send, Upload, X } from "lucide-react";
import { createLiveEventAction } from "@/app/actions/live-events";
import type { LiveEvent } from "@/lib/api/types";
import {
  clockReading,
  durationText,
  IMAGE_ACCEPT,
  imageFileProblem,
  liveEventLinks,
  liveEventPhase,
  safeImageUrl,
  squishTopic,
  TOPIC_MAX,
  validateLiveEventInput,
} from "@/lib/live-events";
import { localInputToOffsetIso, toLocalInputValue } from "@/lib/public-reminders";
import { useIsClient } from "@/hooks/use-is-client";
import { useLiveEvent, type LiveEventState } from "@/hooks/use-live-event";
import { ProofCard } from "@/components/admin/desk/proof-card";
import { LiveEventPoster } from "@/components/admin/live-events/live-event-poster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const LABEL = "font-label block text-[0.82rem] tracking-[0.06em] text-paper-mute";

function fileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
  const [topic, setTopic] = useState("");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [imageMode, setImageMode] = useState<"file" | "url">("file");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<LiveEvent | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);

  // Free the last file preview when the form goes away.
  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  const setPreviewUrl = (next: string | null) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = next;
    setPreview(next);
  };

  const pickFile = (picked: File | null) => {
    if (!picked) return;
    const problem = imageFileProblem(picked);
    if (problem) {
      setError(problem);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    setError(null);
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const switchImageMode = (mode: "file" | "url") => {
    if (mode === "url") clearFile();
    else setImageUrl("");
    setImageMode(mode);
  };

  // Picking a start with no end (or an end before it) proposes an hour.
  const changeStart = (value: string) => {
    setStartLocal(value);
    const start = localInputToOffsetIso(value);
    const end = localInputToOffsetIso(endLocal);
    if (start && (!end || Date.parse(end) <= Date.parse(start))) {
      setEndLocal(toLocalInputValue(new Date(Date.parse(start) + 3_600_000).toISOString()));
    }
  };

  const startsAt = localInputToOffsetIso(startLocal);
  const endsAt = localInputToOffsetIso(endLocal);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = imageMode === "url" ? imageUrl : "";
    const checked = validateLiveEventInput({ topic, starts_at: startsAt, ends_at: endsAt, image_url: url });
    if (!checked.ok) {
      setError(checked.error);
      return;
    }
    const form = new FormData();
    form.set("topic", checked.data.topic);
    form.set("starts_at", checked.data.starts_at);
    form.set("ends_at", checked.data.ends_at);
    if (checked.data.image_url) form.set("image_url", checked.data.image_url);
    if (imageMode === "file" && file) form.set("image", file);
    setError(null);
    startTransition(async () => {
      const result = await createLiveEventAction(form).catch(() => null);
      if (!result?.ok || !result.data) {
        setError(result?.error ?? "Couldn't reach the club's server. Try again.");
        return;
      }
      setSent(result.data);
    });
  };

  const startAnother = () => {
    setSent(null);
    setTopic("");
    setStartLocal("");
    setEndLocal("");
    setImageUrl("");
    clearFile();
    setError(null);
  };

  const locked = pending || sent !== null;
  const urlPreview = imageMode === "url" ? safeImageUrl(imageUrl) : null;

  const layout = (tracked: LiveEventState | null) => {
    const event = tracked?.event ?? null;
    const jobId = event?.bot_job_id ?? null;
    return (
      <div className="mt-6 grid items-start gap-9 xl:grid-cols-[minmax(0,1fr)_30rem]">
        <form onSubmit={submit} aria-label="New live event" className="min-w-0">
          <label htmlFor="live-event-topic" className={LABEL}>
            Topic
          </label>
          <input
            id="live-event-topic"
            name="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={TOPIC_MAX}
            required
            disabled={locked}
            autoComplete="off"
            placeholder="What are we playing?"
            className="font-headline block w-full border-0 border-b-2 border-rule-strong bg-transparent pt-1.5 pb-2.5 text-[1.8rem] leading-none text-paper caret-highlight outline-none placeholder:text-paper-mute focus-visible:border-highlight disabled:opacity-70 md:text-[2.4rem]"
          />
          <p className="mt-1 text-right text-[0.8rem] text-paper-mute">
            {squishTopic(topic).length} / {TOPIC_MAX}
          </p>

          <div className="mt-4 grid border-t border-rule md:grid-cols-2">
            <Clock
              id="live-event-start"
              label="Starts"
              value={startLocal}
              onChange={changeStart}
              iso={startsAt}
              disabled={locked}
            />
            <Clock
              id="live-event-end"
              label="Ends"
              value={endLocal}
              onChange={setEndLocal}
              iso={endsAt}
              duration={startsAt && endsAt ? durationText(startsAt, endsAt) : null}
              disabled={locked}
              second
            />
          </div>

          <fieldset className="mt-5" disabled={locked}>
            <legend className={LABEL}>
              Image <span className="normal-case">(optional)</span>
            </legend>
            <div className="mt-1 flex flex-wrap items-center gap-2.5">
              {imageMode === "file" ? (
                <>
                  <label className="flex h-9 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-sm border border-rule bg-ink-2 px-3 text-sm focus-within:border-paper-mute focus-within:ring-2 focus-within:ring-highlight/40">
                    <ImageIcon aria-hidden className="size-4 shrink-0 text-paper-mute" />
                    <span className={cn("min-w-0 truncate", file ? "text-paper" : "text-paper-mute")}>
                      {file ? file.name : "Choose a JPEG, PNG, WebP or GIF"}
                    </span>
                    {file && <span className="ml-auto shrink-0 text-[0.82rem] text-paper-mute">{fileSize(file.size)}</span>}
                    {!file && <Upload aria-hidden className="ml-auto size-4 shrink-0 text-paper-mute" />}
                    <input
                      ref={fileInput}
                      type="file"
                      name="image"
                      accept={IMAGE_ACCEPT}
                      className="sr-only"
                      onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {file && (
                    <Button type="button" variant="ghost" size="icon-sm" onClick={clearFile} aria-label="Remove the image">
                      <X />
                    </Button>
                  )}
                  <span className="text-[0.84rem] text-paper-mute">or</span>
                  <Button type="button" variant="outline" size="sm" onClick={() => switchImageMode("url")}>
                    <Link2 data-icon="inline-start" />
                    Use a URL
                  </Button>
                </>
              ) : (
                <>
                  <Input
                    type="url"
                    name="image_url"
                    inputMode="url"
                    aria-label="Image URL"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="min-w-0 flex-1 basis-56"
                  />
                  <span className="text-[0.84rem] text-paper-mute">or</span>
                  <Button type="button" variant="outline" size="sm" onClick={() => switchImageMode("file")}>
                    <Upload data-icon="inline-start" />
                    Upload a file
                  </Button>
                </>
              )}
            </div>
            <p className="mt-1.5 text-[0.82rem] text-paper-mute">At most 10 MB. The bot puts it on the thread and the event.</p>
          </fieldset>

          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            {sent ? (
              <>
                <Button type="button" variant="outline" onClick={startAnother}>
                  <Plus data-icon="inline-start" />
                  Start another
                </Button>
                <span className="text-[0.86rem] text-paper-mute">
                  {"This one's with the bot. You can edit it in Discord once it's there."}
                </span>
              </>
            ) : (
              <>
                <Button type="submit" variant="highlight" disabled={pending}>
                  <Send data-icon="inline-start" />
                  {pending ? "Sending..." : "Send to the bot"}
                </Button>
                <span className="text-[0.86rem] text-paper-mute">The bot makes the thread, then the event.</span>
              </>
            )}
          </div>

          {tracked && <Dispatch state={tracked} guildId={guildId} />}
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
                topic={event ? event.topic : squishTopic(topic)}
                startsAt={event ? event.starts_at : startsAt}
                imageSrc={event ? (event.image_url ?? preview) : (preview ?? urlPreview)}
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

function Clock({
  id,
  label,
  value,
  onChange,
  iso,
  duration,
  disabled,
  second,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  iso: string | null;
  duration?: string | null;
  disabled: boolean;
  second?: boolean;
}) {
  const isClient = useIsClient();
  const reading = isClient && iso ? clockReading(iso) : null;
  return (
    <div className={cn("min-w-0 border-b border-rule py-3.5 md:pr-4", second && "md:border-l md:pl-4")}>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <p aria-hidden className="font-headline mt-1 text-[2.6rem] leading-[0.9]">
        {reading?.time ?? "--:--"}
      </p>
      <p className="mt-1 font-semibold">
        {reading ? (
          <>
            {reading.day}
            {duration ? ` · ${duration}` : ""}
          </>
        ) : (
          <span className="text-paper-mute">Pick a day and time</span>
        )}
      </p>
      <p className="mt-0.5 text-[0.85rem] text-paper-dim">
        Club time <b className="font-semibold text-paper">{reading?.club ?? "--"}</b>
      </p>
      <Input
        id={id}
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={disabled}
        className="mt-2.5"
      />
    </div>
  );
}

// What happened to the event since it was sent, step by step: saved, the
// bot picking it up, the thread, then the scheduled event.
function Dispatch({ state, guildId }: { state: LiveEventState; guildId: string | null }) {
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
    <section aria-label="Dispatch" className="mt-5 border-t-2 border-paper pt-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-label text-[1rem] font-extrabold tracking-[0.06em]">Dispatch</h3>
        {event.bot_job_id != null && (
          <span className="font-label text-[0.78rem] tracking-[0.08em] text-paper-mute">Bot job #{event.bot_job_id}</span>
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
          <Step icon="failed" meta={event.bot_job_id == null ? <Link href="/admin" className="hover:text-highlight">The wire</Link> : null}>
            {event.bot_job_id == null
              ? "The bot couldn't finish. Its error is on the wire."
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
        "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-rule py-1.75 text-[0.9rem]",
        muted && "text-paper-mute",
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
      <span className="text-[0.8rem] text-paper-mute">{meta}</span>
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
