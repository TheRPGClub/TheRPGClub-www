"use client";

import { useState, useTransition, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bug, Check, Send, Sparkles, Wrench, type LucideIcon } from "lucide-react";
import type { Suggestion } from "@/lib/api/types";
import {
  SUGGESTION_DETAILS_MAX,
  SUGGESTION_TITLE_MAX,
  SUGGESTION_TYPES,
  type SuggestionType,
} from "@/lib/suggestions";
import { createSuggestionAction } from "@/app/actions/suggestions";
import { SuggestionCard } from "@/components/suggestions/suggestion-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<SuggestionType, LucideIcon> = {
  "New Feature": Sparkles,
  Improvement: Wrench,
  Bug,
};

const FIELD_LABEL = "font-label block text-[0.82rem] text-paper-mute";
const FIELD =
  "w-full min-w-0 rounded-sm border border-rule-strong bg-ink-2 px-3 text-paper caret-highlight outline-none transition-colors placeholder:text-paper-mute focus-visible:border-highlight focus-visible:ring-3 focus-visible:ring-highlight/25 disabled:opacity-50";
const HINT = "mt-1.5 flex justify-between gap-4 text-[0.85rem] text-paper-mute";

const STEPS = [
  <>
    It goes on the <b>Suggestion Board</b> as <b>Pending</b>, and members can
    upvote it.
  </>,
  <>
    A Superadmin <b>approves</b> it into a GitHub issue, or <b>rejects</b> it
    with a reason.
  </>,
  <>
    The bot posts the outcome in Discord and mentions you. You can withdraw it
    while it&apos;s Pending.
  </>,
];

// The Suggest something form, with a live preview of the card it will pin to
// the board and what happens after.
export function SuggestionForm({
  authorId,
  authorName,
}: {
  authorId: string;
  authorName: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [types, setTypes] = useState<SuggestionType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(type: SuggestionType) {
    setTypes((current) =>
      current.includes(type) ? current.filter((t) => t !== type) : [...current, type],
    );
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createSuggestionAction({ title, details, types });
      if (res.ok && res.data) {
        router.push(`/suggestions?pinned=${res.data.suggestion_id}`);
      } else {
        setError(res.error ?? "Couldn't submit it. Try again.");
      }
    });
  }

  // The preview's dates never show (its byline reads "just now").
  const now = "2026-01-01T00:00:00Z";
  const preview: Suggestion = {
    suggestion_id: 0,
    title: title.trim() || "Your title goes here",
    details: details.trim() || null,
    created_by: authorId,
    created_by_name: authorName,
    created_at: now,
    updated_at: now,
    labels: SUGGESTION_TYPES.filter((t) => types.includes(t.value))
      .map((t) => t.value)
      .join(", "),
    status: "pending",
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    target_repo: null,
    github_issue_number: null,
    github_issue_url: null,
    github_issue_state: null,
    upvote_count: 0,
    viewer_upvoted: false,
  };

  return (
    <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,640px)_minmax(0,400px)]">
      <form onSubmit={submit} noValidate className="min-w-0">
        <div className="mb-5.5">
          <label htmlFor="suggestion-title" className={FIELD_LABEL}>
            Title
          </label>
          <input
            id="suggestion-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={SUGGESTION_TITLE_MAX}
            required
            disabled={pending}
            aria-describedby="suggestion-title-hint"
            className={cn(FIELD, "mt-1.5 h-9")}
          />
          <p id="suggestion-title-hint" className={HINT}>
            <span>One line that says what should change.</span>
            <span className="tabular-nums">
              {title.length} / {SUGGESTION_TITLE_MAX}
            </span>
          </p>
        </div>

        <div className="mb-5.5">
          <label htmlFor="suggestion-details" className={FIELD_LABEL}>
            Details
          </label>
          <textarea
            id="suggestion-details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={SUGGESTION_DETAILS_MAX}
            required
            rows={7}
            disabled={pending}
            aria-describedby="suggestion-details-hint"
            className={cn(FIELD, "mt-1.5 min-h-[150px] py-2 leading-normal")}
          />
          <p id="suggestion-details-hint" className={HINT}>
            <span>What it should do, and why it would help.</span>
            <span className="tabular-nums">
              {details.length} / {SUGGESTION_DETAILS_MAX}
            </span>
          </p>
        </div>

        <fieldset className="mb-5.5" aria-describedby="suggestion-type-hint">
          <legend className={FIELD_LABEL}>Type</legend>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {SUGGESTION_TYPES.map((t) => {
              const on = types.includes(t.value);
              const Icon = on ? Check : TYPE_ICON[t.value];
              return (
                <button
                  key={t.value}
                  type="button"
                  aria-pressed={on}
                  title={t.blurb}
                  disabled={pending}
                  onClick={() => toggle(t.value)}
                  style={{ "--lc": t.ink } as CSSProperties}
                  className={cn(
                    "font-label inline-flex h-8 items-center gap-1.5 rounded-xs px-3 text-[0.85rem] whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-highlight/50 focus-visible:outline-none",
                    on
                      ? "bg-(--lc) text-ink"
                      : "text-(--lc) shadow-[inset_0_0_0_1.5px_var(--lc)] hover:bg-ink-3",
                  )}
                >
                  <Icon aria-hidden className="size-3.5" />
                  {t.value}
                </button>
              );
            })}
          </div>
          <p id="suggestion-type-hint" className={HINT}>
            <span>Pick every type that fits. Where it lands (bot or website) is decided on review.</span>
          </p>
        </fieldset>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-7 flex gap-2.5 border-t border-rule pt-5">
          <Button type="submit" variant="highlight" disabled={pending}>
            <Send aria-hidden />
            {pending ? "Submitting" : "Submit Suggestion"}
          </Button>
          <Link href="/suggestions" className={buttonVariants({ variant: "outline" })}>
            Cancel
          </Link>
        </div>
      </form>

      <aside aria-label="Preview" className="min-w-0">
        <div className="mb-3 flex items-baseline gap-2.5 border-b border-rule pb-1.5">
          <h2 className="font-label text-[1.05rem] font-extrabold">On the board</h2>
          <span className="font-label ml-auto text-[0.8rem] tracking-[0.08em] text-paper-mute">
            Preview
          </span>
        </div>
        <div aria-hidden className="pointer-events-none">
          <SuggestionCard
            suggestion={preview}
            mine
            bylineWhen="just now"
            headingLevel="h3"
            actions={
              <span className="font-label inline-flex h-[30px] items-center rounded-sm px-2.5 text-[0.85rem] font-extrabold text-paper-mute shadow-[inset_0_0_0_1px_var(--color-rule)]">
                Upvote
              </span>
            }
          />
        </div>

        <div className="mt-7 space-y-4">
          <div className="flex items-baseline border-b border-rule pb-1.5">
            <h2 className="font-label text-[1.05rem] font-extrabold">What happens next</h2>
          </div>
          <ol className="space-y-4">
            {STEPS.map((step, i) => (
              <li key={i} className="grid grid-cols-[28px_1fr] items-start gap-3">
                <span className="font-headline text-[1.6rem] text-paper-mute">{i + 1}</span>
                <p className="text-[0.92rem] text-paper-dim [&_b]:font-semibold [&_b]:text-paper">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
