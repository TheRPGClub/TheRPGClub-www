import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, ChevronLeft, Link2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { ApiSingle, ImportJob, ImportSummary, User } from "@/lib/api/types";
import {
  loadActiveImport,
  loadImportSummary,
  loadSocials,
} from "@/lib/imports/active";
import {
  IMPORT_KINDS,
  IMPORT_KIND_ORDER,
  IMPORT_STATUS_LABELS,
  importItemCount,
  importKindHref,
  importProgress,
  resultReasonLabel,
  resultReasonRows,
  type ImportKind,
} from "@/lib/imports/kinds";
import {
  hasRequiredAccount,
  linkAccountsHref,
  requiredAccount,
} from "@/lib/imports/linked-account";
import { ImportShell } from "@/components/issue/import-shell";
import { Chip } from "@/components/issue/chip";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The imports hub: any open import leads as a yellow progress panel (it's
// the member's unfinished business), then every import kind as a row with
// what it does and the one thing to do next: start it, resume it, or link
// the account it reads first.

// The member list each kind writes to, named for the row's subtitle.
const AFFECTS_LABEL: Record<string, string> = {
  "collected-games": "Adds to Collection",
  "completed-games": "Adds to Completed",
};

const DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export default async function ImportsHubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session) redirect("/");
  if (session.principal.discord_id !== id) redirect(`/members/${id}`);

  const [userRes, socials, ...active] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    loadSocials(id),
    ...IMPORT_KIND_ORDER.map((kind) => loadActiveImport(kind, id)),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = user.global_name ?? user.username ?? id;

  const kinds = IMPORT_KIND_ORDER.map((kind, i) => ({
    kind,
    active: active[i] as ImportJob | null,
  }));
  const open = kinds.filter((k) => k.active !== null);
  const counts = await Promise.all(
    open.map(({ kind, active: job }) => loadImportSummary(kind, job!.import_id)),
  );

  return (
    <ImportShell
      trail={[
        ["Members", "/members"],
        [displayName, `/members/${id}`],
      ]}
      title="Imports"
      count={open.length > 0 ? `${open.length} open` : undefined}
      description="Bring games in from elsewhere. You can pause an import and come back to it later; you can have one open import of each kind."
      actions={
        <Link
          href={`/members/${id}/edit`}
          className={buttonVariants({ variant: "outline" })}
        >
          <ChevronLeft data-icon="inline-start" />
          Edit profile
        </Link>
      }
    >
      {open.map(({ kind, active: job }, i) => (
        <OpenImportPanel
          key={kind}
          kind={kind}
          job={job!}
          counts={counts[i]}
          href={importKindHref(id, kind)}
        />
      ))}

      <ul className="border-t-2 border-paper">
        {kinds.map(({ kind, active: job }) => {
          const account = requiredAccount(kind);
          const blocked = !job && account !== null && !hasRequiredAccount(kind, socials);
          return (
            <ImportKindRow
              key={kind}
              kind={kind}
              href={importKindHref(id, kind)}
              active={job}
              blockedBy={blocked ? account : null}
              linkHref={linkAccountsHref(id)}
            />
          );
        })}
      </ul>
    </ImportShell>
  );
}

function OpenImportPanel({
  kind,
  job,
  counts,
  href,
}: {
  kind: ImportKind;
  job: ImportJob;
  counts: ImportSummary | null;
  href: string;
}) {
  const progress = importProgress(job.total_count, counts);
  const outcomes = resultReasonRows(counts).slice(0, 3);
  const status = IMPORT_STATUS_LABELS[job.status] ?? job.status;
  const noun = IMPORT_KINDS[kind].itemNoun.other;

  return (
    <section
      aria-label={`Open import: ${IMPORT_KINDS[kind].label}`}
      className="grid gap-4 rounded-md bg-highlight px-5 py-5 text-ink sm:grid-cols-[auto_1fr] sm:items-center sm:gap-7 sm:px-6.5 sm:py-6 lg:grid-cols-[auto_1fr_auto]"
    >
      <p className="font-headline text-[5rem] leading-[0.78] sm:text-[6.75rem]">
        {progress.percent}
        <span className="text-[2.5rem]">%</span>
      </p>
      <div className="min-w-0">
        <h2 className="font-headline text-[1.9rem] leading-[0.95] sm:text-[2.25rem]">
          {IMPORT_KINDS[kind].label}, {status.toLowerCase()}
        </h2>
        <p className="mt-1.5 font-medium text-highlight-ink">
          {progress.resolved} of {progress.total} {noun} done. Started{" "}
          {DATE.format(new Date(job.created_at))}.
        </p>
        <div
          role="progressbar"
          aria-label="Import progress"
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={progress.resolved}
          className="mt-3.5 h-2 overflow-hidden bg-ink/18"
        >
          <div className="h-full bg-ink" style={{ width: `${progress.percent}%` }} />
        </div>
        {outcomes.length > 0 && (
          <ul className="font-label mt-3 flex flex-wrap gap-x-5.5 gap-y-1.5 text-[0.82rem] font-extrabold tracking-[0.06em]">
            {outcomes.map(([reason, n]) => (
              <li key={reason}>
                <b className="font-headline mr-1.5 text-[1.4rem] font-normal tracking-normal">
                  {n}
                </b>
                {resultReasonLabel(reason)}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link
        href={href}
        className={cn(
          buttonVariants({ size: "lg" }),
          "justify-self-start bg-ink text-paper hover:bg-ink/85 sm:col-span-2 lg:col-span-1",
        )}
      >
        {job.status === "paused" ? "Resume" : "Continue"}
        <ArrowRight data-icon="inline-end" />
      </Link>
    </section>
  );
}

function ImportKindRow({
  kind,
  href,
  active,
  blockedBy,
  linkHref,
}: {
  kind: ImportKind;
  href: string;
  active: ImportJob | null;
  blockedBy: string | null;
  linkHref: string;
}) {
  const config = IMPORT_KINDS[kind];
  const affects = AFFECTS_LABEL[config.affects[0] ?? ""];

  return (
    <li className="grid gap-3 border-b border-rule py-5.5 md:grid-cols-[17rem_1fr_14rem] md:items-center md:gap-7 lg:grid-cols-[19rem_1fr_14rem]">
      <h2 className="font-headline text-[2.15rem] leading-[0.95]">
        {config.label}
        {affects && (
          <span className="font-label mt-1.5 block text-[0.82rem] font-extrabold tracking-[0.08em] text-paper-mute">
            {affects}
          </span>
        )}
      </h2>
      <p className="max-w-[60ch] text-[0.92rem] text-paper-dim">
        {config.description}
      </p>
      <div className="flex flex-col items-start gap-2 md:items-end md:text-right">
        {active ? (
          <>
            <Chip tone="highlight">
              {IMPORT_STATUS_LABELS[active.status] ?? active.status}
            </Chip>
            <small className="text-[0.8rem] text-paper-mute">
              Started {DATE.format(new Date(active.created_at))} ·{" "}
              {importItemCount(kind, active.total_count)}
            </small>
            <Link
              href={href}
              className="font-label inline-flex items-center gap-1 text-sm font-extrabold text-paper transition-colors hover:text-highlight"
            >
              Open it <ArrowRight aria-hidden className="size-4 text-gotm" />
            </Link>
          </>
        ) : blockedBy ? (
          <>
            <span className="inline-flex items-center gap-1.5 text-[0.82rem] text-paper-dim">
              <Link2 aria-hidden className="size-3.5 text-highlight" />
              Link {blockedBy} first
            </span>
            <Link href={linkHref} className={buttonVariants({ variant: "outline" })}>
              Link account
            </Link>
          </>
        ) : (
          <Link href={href} className={buttonVariants({ variant: "outline" })}>
            Start
            <ArrowRight data-icon="inline-end" />
          </Link>
        )}
      </div>
    </li>
  );
}
