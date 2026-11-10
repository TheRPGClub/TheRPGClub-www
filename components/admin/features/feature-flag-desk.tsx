"use client";

import { useId, useState, useTransition } from "react";
import { MessageSquareText, Power, X } from "lucide-react";
import { setFeatureFlagAction } from "@/app/actions/feature-flags";
import type { FeatureState } from "@/lib/features";
import {
  changeWhen,
  changerName,
  FEATURE_STATES,
  isCommand,
  needsOffConfirm,
  normalizeReason,
  REASON_MAX,
  splitFeatureFlags,
  STATE_LABEL,
  type FeatureFlagEntry,
} from "@/lib/feature-flags";
import { SectionHeading } from "@/components/issue/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Each state's ink on the desk: Live in done green, Preview in highlighter
// yellow, Off in masthead red (DESIGN.md, Production desk: the Off-red
// exception). Type and strokes only, never a fill behind type.
const STATE_INK: Record<FeatureState, string> = {
  live: "text-ok",
  preview: "text-highlight",
  off: "text-gotm",
};

const COVERAGE = [
  { key: "website", label: "Website" },
  { key: "bot", label: "Bot" },
  { key: "posts", label: "Posts" },
] as const;

const TH =
  "font-label border-b border-rule pt-2 pb-1.5 pr-3 text-left align-bottom text-[0.72rem] tracking-[0.08em] text-paper-mute";
const TH_COVER = "border-l border-rule-strong pl-3 text-paper-dim";

// The desk's two departments, Core Features and Hideable Features, as one
// table split in two: the same columns, so a Feature's coverage, last change
// and state line up down the page. Each row's Off / Preview / Live control
// saves on click; Off asks first. Below 85rem (1360px) a row stacks into a block.
export function FeatureFlagDesk({ entries, now }: { entries: FeatureFlagEntry[]; now: string }) {
  const [rows, setRows] = useState(entries);
  const [clock, setClock] = useState(() => new Date(now));
  const [landed, setLanded] = useState<string | null>(null);
  const { core, hideable } = splitFeatureFlags(rows);

  const onSaved = (entry: FeatureFlagEntry, changed: boolean) => {
    setRows((current) => current.map((row) => (row.key === entry.key ? entry : row)));
    setClock(new Date());
    if (changed) setLanded(entry.key);
  };

  return (
    <div className="mt-6.5 space-y-10">
      <FlagDepartment
        title="Core features"
        entries={core}
        clock={clock}
        landed={landed}
        onSaved={onSaved}
        groupHead
      />
      <FlagDepartment title="Hideable features" entries={hideable} clock={clock} landed={landed} onSaved={onSaved} />
    </div>
  );
}

interface RowProps {
  clock: Date;
  landed: string | null;
  onSaved: (entry: FeatureFlagEntry, changed: boolean) => void;
}

function FlagDepartment({
  title,
  entries,
  groupHead = false,
  ...row
}: RowProps & { title: string; entries: FeatureFlagEntry[]; groupHead?: boolean }) {
  const headingId = useId();
  if (entries.length === 0) return null;
  return (
    <section aria-labelledby={headingId}>
      <SectionHeading title={<span id={headingId}>{title}</span>} />
      <table className="w-full border-collapse max-[85rem]:block min-[85rem]:table-fixed">
        <colgroup className="max-[85rem]:hidden">
          <col className="w-[10.5rem]" />
          <col />
          <col />
          <col />
          <col className="w-[11.5rem]" />
          <col className="w-[15.25rem]" />
        </colgroup>
        <thead className="max-[85rem]:sr-only">
          {groupHead ? (
            <>
              <tr>
                <th scope="col" rowSpan={2} className={TH}>
                  Feature
                </th>
                <th
                  scope="colgroup"
                  colSpan={3}
                  className={cn(TH, TH_COVER, "border-rule-strong pt-2.5 pb-1 text-paper")}
                >
                  One flag switches
                  <span className="ml-2 font-semibold tracking-[0.06em] text-paper-mute">all three at once</span>
                </th>
                <th scope="col" rowSpan={2} className={TH}>
                  Last change
                </th>
                <th scope="col" rowSpan={2} className={cn(TH, "pr-0 text-right")}>
                  State
                </th>
              </tr>
              <tr>
                {COVERAGE.map((c) => (
                  <th key={c.key} scope="col" className={cn(TH, TH_COVER)}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </>
          ) : (
            <tr>
              <th scope="col" className={TH}>
                Feature
              </th>
              {COVERAGE.map((c) => (
                <th key={c.key} scope="col" className={cn(TH, TH_COVER)}>
                  {c.label}
                </th>
              ))}
              <th scope="col" className={TH}>
                Last change
              </th>
              <th scope="col" className={cn(TH, "pr-0 text-right")}>
                State
              </th>
            </tr>
          )}
        </thead>
        <tbody className="max-[85rem]:block">
          {entries.map((entry) => (
            <FlagRow key={entry.key} entry={entry} {...row} />
          ))}
        </tbody>
      </table>
    </section>
  );
}

type Panel = "reason" | "confirm" | null;

function FlagRow({ entry, clock, landed, onSaved }: RowProps & { entry: FeatureFlagEntry }) {
  const id = useId();
  const [panel, setPanel] = useState<Panel>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<FeatureState | null>(null);
  const [, startTransition] = useTransition();
  const shown = saving ?? entry.state;
  const busy = saving !== null;

  const save = (next: FeatureState) => {
    const { error: reasonError } = normalizeReason(draft);
    if (reasonError) {
      setError(reasonError);
      setPanel((p) => p ?? "reason");
      return;
    }
    setError(null);
    setSaving(next);
    startTransition(async () => {
      let result: Awaited<ReturnType<typeof setFeatureFlagAction>>;
      try {
        result = await setFeatureFlagAction(entry.key, next, draft);
      } catch {
        result = { ok: false, error: "Couldn't reach the club's server. Try again." };
      }
      setSaving(null);
      if (result.ok && result.entry) {
        setDraft("");
        setPanel(null);
        onSaved(result.entry, result.changed !== false);
      } else {
        setError(result.error ?? "Couldn't save the change. Try again.");
      }
    });
  };

  const pick = (next: FeatureState) => {
    if (busy || next === entry.state) {
      if (next === entry.state && panel === "confirm") setPanel(null);
      return;
    }
    if (needsOffConfirm(entry.state, next)) {
      setError(null);
      setPanel("confirm");
      return;
    }
    save(next);
  };

  const panelId = `${id}-panel`;
  const reasonId = `${id}-reason`;
  const off = entry.state === "off";

  return (
    <>
      <tr
        className={cn(
          "align-middle max-[85rem]:grid max-[85rem]:grid-cols-[minmax(0,1fr)_auto] max-[85rem]:items-center max-[85rem]:gap-x-3 max-[85rem]:gap-y-2 max-[85rem]:py-3.5",
          panel || error ? "max-[85rem]:pb-2" : "border-b border-rule",
        )}
      >
        <th scope="row" className="py-2.5 pr-3 text-left font-normal max-[85rem]:p-0">
          <span
            className={cn(
              "font-headline flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[1.4rem] leading-[1.05]",
              off && "text-paper-mute",
            )}
          >
            {entry.name}
            {entry.state === "preview" && (
              <span className="font-label inline-flex h-[22px] items-center rounded-xs px-[7px] text-[0.72rem] font-extrabold tracking-[0.08em] text-highlight shadow-[inset_0_0_0_1.5px_var(--color-highlight)]">
                Staff only
              </span>
            )}
          </span>
        </th>
        {COVERAGE.map((c) => (
          <td
            key={c.key}
            className="bg-paper/[0.018] py-2.5 pr-3 align-middle max-[85rem]:col-span-2 max-[85rem]:grid max-[85rem]:grid-cols-[4.5rem_minmax(0,1fr)] max-[85rem]:items-baseline max-[85rem]:bg-transparent max-[85rem]:p-0 min-[85rem]:border-l min-[85rem]:border-rule min-[85rem]:pl-3"
          >
            <span className="font-label text-[0.72rem] tracking-[0.08em] text-paper-mute min-[85rem]:hidden">{c.label}</span>
            <CoverageChips items={entry.coverage[c.key]} />
          </td>
        ))}
        <td className="py-2.5 pr-3 max-[85rem]:col-span-2 max-[85rem]:p-0" aria-live="polite">
          {busy ? (
            <span className="font-label text-[0.72rem] tracking-[0.06em] text-paper-mute">Saving...</span>
          ) : (
            <LastChange entry={entry} clock={clock} landed={landed === entry.key} />
          )}
        </td>
        <td className="py-2.5 max-[85rem]:col-start-2 max-[85rem]:row-start-1 max-[85rem]:p-0">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              aria-label={`Reason for ${entry.name}'s next change`}
              aria-expanded={panel === "reason"}
              aria-controls={panelId}
              disabled={busy}
              onClick={() => setPanel((p) => (p === "reason" ? null : "reason"))}
              className={cn(
                "grid size-9 place-items-center rounded-sm text-paper-mute transition-colors outline-none hover:bg-ink-3 hover:text-paper focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 min-[85rem]:size-8",
                draft.trim() && "text-highlight shadow-[inset_0_0_0_1.5px_var(--color-highlight)] hover:text-highlight",
                panel === "reason" && "bg-ink-3 text-paper",
              )}
            >
              <MessageSquareText aria-hidden className="size-4" />
            </button>
            <div
              role="group"
              aria-label={`${entry.name} state`}
              aria-busy={busy}
              className="grid shrink-0 grid-cols-[repeat(3,auto)] min-[85rem]:grid-cols-[repeat(3,4.25rem)] rounded-sm bg-ink-2 shadow-[inset_0_0_0_1px_var(--color-rule-strong)]"
            >
              {FEATURE_STATES.map((state) => {
                const selected = shown === state;
                const arming = state === "off" && panel === "confirm";
                return (
                  <button
                    key={state}
                    type="button"
                    aria-pressed={selected}
                    aria-expanded={state === "off" && !off ? panel === "confirm" : undefined}
                    aria-controls={state === "off" && !off ? panelId : undefined}
                    disabled={busy && !selected}
                    onClick={() => pick(state)}
                    className={cn(
                      "font-label inline-flex h-9 items-center justify-center rounded-sm px-2 text-[0.82rem] tracking-[0.06em] min-[85rem]:px-1 transition-[color,background-color,box-shadow] duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 min-[85rem]:h-8",
                      selected
                        ? cn("bg-ink font-extrabold shadow-[inset_0_0_0_2px_currentColor]", STATE_INK[state])
                        : "text-paper-mute hover:bg-ink-3 hover:text-paper disabled:opacity-50",
                      arming && "text-gotm outline-[1.5px] -outline-offset-[3px] outline-gotm outline-dashed",
                    )}
                  >
                    {STATE_LABEL[state]}
                  </button>
                );
              })}
            </div>
          </div>
        </td>
      </tr>
      {(panel || error) && (
        <tr className="border-b border-rule max-[85rem]:block">
          <td colSpan={6} id={panelId} className="pt-0.5 pb-3.5 max-[85rem]:block">
            <div className="ml-auto max-w-[42rem]">
              {panel === "confirm" ? (
                <OffConfirm
                  name={entry.name}
                  reasonId={reasonId}
                  draft={draft}
                  onDraft={setDraft}
                  busy={busy}
                  onConfirm={() => save("off")}
                  onCancel={() => {
                    setPanel(null);
                    setError(null);
                  }}
                />
              ) : panel === "reason" ? (
                <ReasonEditor
                  name={entry.name}
                  reasonId={reasonId}
                  draft={draft}
                  onDraft={setDraft}
                  onClose={() => setPanel(null)}
                />
              ) : null}
              {error && (
                <p role="alert" className="mt-2 text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function CoverageChips({ items }: { items: string[] }) {
  if (items.length === 0) {
    return (
      <span className="inline-block h-[1.5px] w-3 translate-y-[-3px] bg-rule-strong">
        <span className="sr-only">None</span>
      </span>
    );
  }
  return (
    <ul className="flex flex-wrap gap-[5px]">
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "font-label inline-flex min-h-[22px] max-w-full min-w-0 items-center rounded-xs bg-paper/8 px-[7px] py-[3px] text-[0.78rem] leading-[1.15] tracking-[0.04em] text-paper-dim",
            isCommand(item) ? "tracking-[0.02em] whitespace-nowrap normal-case" : "[overflow-wrap:anywhere]",
          )}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function LastChange({ entry, clock, landed }: { entry: FeatureFlagEntry; clock: Date; landed: boolean }) {
  const change = entry.last_change;
  if (!change) {
    return (
      <span className="font-label text-[0.72rem] leading-[1.3] tracking-[0.06em] text-paper-mute">
        Never set
      </span>
    );
  }
  return (
    <div
      key={change.changed_at}
      className={cn(
        landed && "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-left-1 motion-safe:duration-300",
      )}
    >
      <span className="font-label block text-[0.72rem] leading-[1.3] tracking-[0.06em] text-paper-mute tabular-nums">
        <b className={cn("font-extrabold", STATE_INK[change.to_state])}>{STATE_LABEL[change.to_state]}</b>
        {" · "}
        <span className="text-paper-dim">{changerName(change)}</span>
        {" · "}
        <time dateTime={change.changed_at} title={new Date(change.changed_at).toUTCString()}>
          {changeWhen(change.changed_at, clock)}
        </time>
      </span>
      {change.reason && (
        <q className="mt-0.5 block text-[0.8rem] leading-[1.3] text-paper-dim italic">{change.reason}</q>
      )}
    </div>
  );
}

function ReasonField({
  reasonId,
  draft,
  onDraft,
  autoFocus,
  onEnter,
}: {
  reasonId: string;
  draft: string;
  onDraft: (v: string) => void;
  autoFocus?: boolean;
  onEnter?: () => void;
}) {
  const over = draft.trim().length > REASON_MAX;
  return (
    <Input
      id={reasonId}
      value={draft}
      onChange={(e) => onDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onEnter) {
          e.preventDefault();
          onEnter();
        }
      }}
      placeholder="e.g. Journal sync broken, pausing"
      autoComplete="off"
      autoFocus={autoFocus}
      aria-invalid={over || undefined}
      aria-describedby={`${reasonId}-hint`}
      className="min-w-48 flex-1 bg-ink"
    />
  );
}

function ReasonEditor({
  name,
  reasonId,
  draft,
  onDraft,
  onClose,
}: {
  name: string;
  reasonId: string;
  draft: string;
  onDraft: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="rounded-md border border-highlight/60 bg-ink-2 px-3.5 pt-2.5 pb-3">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={reasonId} className="font-label text-[0.78rem] tracking-[0.08em] text-paper">
          Reason for {name}&apos;s next change
        </label>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the reason"
          className="grid size-7 place-items-center rounded-sm text-paper-mute outline-none hover:bg-ink-3 hover:text-paper focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
      <div className="mt-1.5 flex">
        <ReasonField reasonId={reasonId} draft={draft} onDraft={onDraft} autoFocus onEnter={onClose} />
      </div>
      <p id={`${reasonId}-hint`} className="mt-1.5 text-[0.8rem] text-paper-mute">
        Optional. It goes with the state you pick next, here and in the admin channel.
      </p>
    </div>
  );
}

function OffConfirm({
  name,
  reasonId,
  draft,
  onDraft,
  busy,
  onConfirm,
  onCancel,
}: {
  name: string;
  reasonId: string;
  draft: string;
  onDraft: (v: string) => void;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <fieldset className="min-w-0 rounded-md border-[1.5px] border-dashed border-destructive bg-destructive/[0.04] px-3.5 pt-1 pb-3.5">
      <legend className="font-label flex items-center gap-1.5 px-1.5 text-[0.72rem] tracking-[0.08em] text-destructive">
        <Power aria-hidden className="size-[13px]" />
        Turn {name} Off?
      </legend>
      <p className="mt-0.5 mb-2.5 text-[0.84rem] text-paper-dim">
        Nobody can use it, staff included. Its pages go not-found, its bot commands answer that it isn&apos;t
        available yet, and its automated posts and jobs pause until it&apos;s back on.
      </p>
      <label htmlFor={reasonId} className="sr-only">
        Reason (optional)
      </label>
      <div className="flex flex-wrap gap-2">
        <ReasonField reasonId={reasonId} draft={draft} onDraft={onDraft} autoFocus onEnter={onConfirm} />
        <Button type="button" variant="destructive-solid" disabled={busy} onClick={onConfirm}>
          <Power data-icon="inline-start" />
          {busy ? "Turning off..." : "Turn Off"}
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
      </div>
      <p id={`${reasonId}-hint`} className="mt-1.5 text-[0.8rem] text-paper-mute">
        Reason optional; it shows here and in the admin channel.
      </p>
    </fieldset>
  );
}
