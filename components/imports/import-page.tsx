import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { ImportJob } from "@/lib/api/types";
import { loadActiveImport, loadImportSummary, loadSocials } from "@/lib/imports/active";
import {
  IMPORT_KINDS,
  importsHubHref,
  type ImportKind,
} from "@/lib/imports/kinds";
import {
  hasRequiredAccount,
  linkAccountsHref,
  requiredAccount,
} from "@/lib/imports/linked-account";
import { ImportShell } from "@/components/issue/import-shell";
import { buttonVariants } from "@/components/ui/button";
import { ImportReviewLoop } from "@/components/imports/import-review-loop";
import { LinkAccountDialog } from "@/components/imports/link-account-dialog";

interface ImportPageProps<J extends ImportJob> {
  kind: ImportKind;
  userId: string;
  // What the open import is reading (a file name, a Steam profile), shown
  // above the review loop. Null shows nothing.
  intro: (active: J) => ReactNode;
  // The start screen, shown when there's no open import. Only rendered then,
  // so an async server component here only fetches when it's needed.
  form: ReactNode;
}

// The page every import kind shares: owner-only, the member's shell with a
// link back to the hub, then either the open import's review loop or the
// kind's start screen.
export async function ImportPage<J extends ImportJob>({
  kind,
  userId,
  intro,
  form,
}: ImportPageProps<J>) {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.principal.discord_id !== userId) redirect(`/members/${userId}`);

  const [userRes, active] = await Promise.all([
    apiFetch(`/api/v1/users/${userId}`, { cache: "no-store" }),
    loadActiveImport<J>(kind, userId),
  ]);

  if (!userRes.ok) notFound();
  const counts = active ? await loadImportSummary(kind, active.import_id) : null;
  // An open import keeps going even if the account was unlinked since; only a
  // new start needs the linked account.
  const account = requiredAccount(kind);
  const blocked =
    !active && account !== null && !hasRequiredAccount(kind, await loadSocials(userId));

  return (
    <ImportShell
      title={IMPORT_KINDS[kind].label}
      width={active ? "max-w-[84rem]" : "max-w-4xl"}
      actions={
        <Link href={importsHubHref(userId)} className={buttonVariants({ variant: "outline" })}>
          <ChevronLeft data-icon="inline-start" />
          All imports
        </Link>
      }
    >
      {active ? (
        <div className="space-y-4">
          {intro(active)}
          <ImportReviewLoop
            kind={kind}
            userId={userId}
            initialImport={active}
            initialCounts={counts}
          />
        </div>
      ) : blocked ? (
        <>
          {/* The start screen stays visible behind the dialog, blurred and
              inert, so the member sees what linking unlocks but can't use it. */}
          <div inert aria-hidden className="grid gap-5 select-none blur-sm">
            {form}
          </div>
          <LinkAccountDialog
            account={account}
            linkHref={linkAccountsHref(userId)}
            backHref={importsHubHref(userId)}
          />
        </>
      ) : (
        <div className="grid gap-5">{form}</div>
      )}
    </ImportShell>
  );
}

// The "Importing <name>" line most kinds show above the review loop.
export function ImportingLine({ prefix = "Importing", name }: { prefix?: string; name: ReactNode }) {
  if (!name) return null;
  return (
    <p className="text-sm text-paper-mute">
      {prefix} <span className="font-semibold text-paper">{name}</span>
    </p>
  );
}

// One step of an import's start screen: a numbered heading, what to do, and
// the controls for it.
export function ImportStep({
  step,
  title,
  description,
  children,
}: {
  step?: number;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="grid gap-4 rounded-md border border-rule bg-ink-2 p-5 sm:grid-cols-[auto_1fr] sm:gap-x-6 sm:p-6">
      {step !== undefined && (
        <span
          aria-hidden
          className="font-headline text-[4.25rem] leading-[0.8] text-ink-3 [-webkit-text-stroke:1.5px_var(--color-paper-mute)]"
        >
          {step}
        </span>
      )}
      <div className="min-w-0 space-y-4">
        <div className="space-y-1.5">
          <h2 className="font-headline text-[2rem] leading-[0.95]">
            {step !== undefined && <span className="sr-only">Step {step}: </span>}
            {title}
          </h2>
          {description && (
            <p className="max-w-[65ch] text-sm text-paper-dim">{description}</p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
