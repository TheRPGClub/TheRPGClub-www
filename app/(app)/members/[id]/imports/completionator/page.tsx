import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { ApiSingle, CompletionatorImport, User } from "@/lib/api/types";
import { loadActiveImport, loadImportSummary } from "@/lib/imports/active";
import { importsHubHref } from "@/lib/imports/kinds";
import { MemberListShell } from "@/components/member/member-list-shell";
import { CsvImportForm } from "@/components/imports/csv-import-form";
import { ImportReviewLoop } from "@/components/imports/import-review-loop";

export default async function CompletionatorImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session) redirect("/");
  if (session.principal.discord_id !== id) redirect(`/members/${id}`);

  const [userRes, active] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    loadActiveImport<CompletionatorImport>("completionator", id),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = user.global_name ?? user.username ?? id;
  const counts = active ? await loadImportSummary("completionator", active.import_id) : null;

  return (
    <MemberListShell
      userId={id}
      displayName={displayName}
      title="Completionator import"
      action={
        <Link
          href={importsHubHref(id)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          All imports
        </Link>
      }
    >
      {active ? (
        <div className="mx-auto w-full max-w-3xl space-y-3">
          {active.source_filename && (
            <p className="text-sm text-muted-foreground">
              Importing <span className="font-medium text-foreground">{active.source_filename}</span>
            </p>
          )}
          <ImportReviewLoop
            kind="completionator"
            userId={id}
            initialImport={active}
            initialCounts={counts}
          />
        </div>
      ) : (
        <div className="mx-auto grid w-full max-w-3xl gap-6">
          <section className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">1. Export from Completionator</h2>
            <p className="text-sm text-muted-foreground">
              On Completionator, export your completed games as a CSV file. Use
              the file as it is: the columns are read in order (name, platform,
              region, type, time, date).
            </p>
          </section>

          <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="space-y-1">
              <h2 className="font-semibold">2. Upload it</h2>
              <p className="text-sm text-muted-foreground">
                Rows with one clear GameDB match and a known platform are added
                straight away, and rows you already logged with the same details
                are skipped. You review the rest one at a time: choose the game,
                check the completion, or pick what to update on one you already have.
              </p>
            </div>
            <CsvImportForm userId={id} kind="completionator" />
          </section>
        </div>
      )}
    </MemberListShell>
  );
}
