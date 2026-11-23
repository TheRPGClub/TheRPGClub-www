import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { requireAuth, requireFeature } from "@/lib/session";
import { PreviewBadge } from "@/components/feature/preview-badge";
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
import { PageHeader } from "@/components/templates/page-header";
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

// The page every import kind shares: owner-only, the import template with a
// way back to the hub, then either the open import's review loop or the
// kind's start screen.
export async function ImportPage<J extends ImportJob>({
  kind,
  userId,
  intro,
  form,
}: ImportPageProps<J>) {
  const session = await requireAuth();
  if (session.principal.discord_id !== userId) redirect(`/members/${userId}`);
  const feature = IMPORT_KINDS[kind].feature;
  const features = await requireFeature(feature);

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
    <div className="space-y-7">
      <PageHeader
        back={{ href: importsHubHref(userId), label: "Imports" }}
        title={IMPORT_KINDS[kind].label}
        badge={features.preview(feature) && <PreviewBadge />}
      />
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
    </div>
  );
}
