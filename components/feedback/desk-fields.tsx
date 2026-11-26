import type { ReactNode } from "react";
import type { Feedback } from "@/lib/api/types";
import { shortDate } from "@/lib/feedback";
import { whereLabel } from "@/lib/feedback-desk";
import { ScreenshotThumb } from "./screenshot-thumb";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-border px-5 py-2.5">
      <dt className="font-label mb-1 text-[0.75rem] leading-none font-bold tracking-[0.06em] text-(--k) uppercase">
        {label}
      </dt>
      <dd className="text-sm leading-snug whitespace-pre-line text-dim-foreground">{children}</dd>
    </div>
  );
}

// The Feedback under review, read-only in the Sheet: its title in Anton,
// who filed it (and, on a Bug Report, where), then its details or a Bug
// Report's own fields and screenshot (a kind change keeps whatever it has).
export function DeskFields({ feedback: f }: { feedback: Feedback }) {
  const bug = f.kind === "bug_report";
  const where = bug ? whereLabel(f.where) : null;
  const hits = bug ? "hit this too" : f.upvote_count === 1 ? "upvote" : "upvotes";
  const filed = [
    where,
    f.created_by_name ?? "Unknown member",
    shortDate(f.created_at),
    `${f.upvote_count} ${hits}`,
  ].filter(Boolean);

  return (
    <dl>
      <Field label="Title">
        <span className="font-headline block text-[1.4rem] leading-tight text-foreground">{f.title}</span>
      </Field>
      <Field label={where ? "Where · Reporter" : "Filed by"}>{filed.join(" · ")}</Field>
      {f.details && <Field label="Details">{f.details}</Field>}
      {bug && (
        <>
          {f.what_happened && <Field label="What happened">{f.what_happened}</Field>}
          {f.expected && <Field label="What they expected">{f.expected}</Field>}
          {f.steps && <Field label="Steps">{f.steps}</Field>}
          {f.screenshot_url && (
            <Field label="Screenshot">
              <ScreenshotThumb url={f.screenshot_url} title={f.title} />
            </Field>
          )}
        </>
      )}
    </dl>
  );
}
