import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { ApiSingle, ImportJob, User } from "@/lib/api/types";
import { loadActiveImport, loadImportSummary } from "@/lib/imports/active";
import { IMPORT_KINDS, importsHubHref, type ImportKind } from "@/lib/imports/kinds";
import { MemberListShell } from "@/components/member/member-list-shell";
import { ImportReviewLoop } from "@/components/imports/import-review-loop";

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
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = user.global_name ?? user.username ?? userId;
  const counts = active ? await loadImportSummary(kind, active.import_id) : null;

  return (
    <MemberListShell
      userId={userId}
      displayName={displayName}
      title={`${IMPORT_KINDS[kind].label} import`}
      action={
        <Link
          href={importsHubHref(userId)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          All imports
        </Link>
      }
    >
      {active ? (
        <div className="mx-auto w-full max-w-3xl space-y-3">
          {intro(active)}
          <ImportReviewLoop
            kind={kind}
            userId={userId}
            initialImport={active}
            initialCounts={counts}
          />
        </div>
      ) : (
        <div className="mx-auto grid w-full max-w-3xl gap-6">{form}</div>
      )}
    </MemberListShell>
  );
}

// The "Importing <name>" line most kinds show above the review loop.
export function ImportingLine({ prefix = "Importing", name }: { prefix?: string; name: ReactNode }) {
  if (!name) return null;
  return (
    <p className="text-sm text-muted-foreground">
      {prefix} <span className="font-medium text-foreground">{name}</span>
    </p>
  );
}
