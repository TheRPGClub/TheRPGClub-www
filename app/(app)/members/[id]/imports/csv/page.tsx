import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Download } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { ApiSingle, CollectionCsvImport, User } from "@/lib/api/types";
import { loadActiveImport, loadImportSummary } from "@/lib/imports/active";
import { importsHubHref } from "@/lib/imports/kinds";
import { MemberListShell } from "@/components/member/member-list-shell";
import { CsvImportForm } from "@/components/imports/csv-import-form";
import { ImportReviewLoop } from "@/components/imports/import-review-loop";
import { buttonVariants } from "@/components/ui/button";

const TEMPLATE_HREF = "/templates/collection-import-template.csv";

const COLUMNS: [string, string][] = [
  ["title", "Required. The game's name."],
  ["platform", "Optional. A platform name, abbreviation or id, e.g. PS5 or Switch."],
  ["ownership_type", "Digital, Physical, Subscription or Other. Blank means Digital."],
  ["note", "Optional, up to 500 characters."],
  ["gamedb_id", "Optional. Adds that GameDB game without searching."],
  ["igdb_id", "Optional. Imports that IGDB game. Use gamedb_id or igdb_id, not both."],
];

export default async function CollectionCsvImportPage({
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
    loadActiveImport<CollectionCsvImport>("csv", id),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = user.global_name ?? user.username ?? id;
  const counts = active ? await loadImportSummary("csv", active.import_id) : null;

  return (
    <MemberListShell
      userId={id}
      displayName={displayName}
      title="Collection CSV import"
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
          {active.source_file_name && (
            <p className="text-sm text-muted-foreground">
              Importing <span className="font-medium text-foreground">{active.source_file_name}</span>
            </p>
          )}
          <ImportReviewLoop
            kind="csv"
            userId={id}
            initialImport={active}
            initialCounts={counts}
          />
        </div>
      ) : (
        <div className="mx-auto grid w-full max-w-3xl gap-6">
          <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="space-y-1">
              <h2 className="font-semibold">1. Fill in the template</h2>
              <p className="text-sm text-muted-foreground">
                One game per row. Rows whose note says EXAMPLE ROW are ignored,
                so you can leave them in.
              </p>
            </div>
            <a
              href={TEMPLATE_HREF}
              download="collection-import-template.csv"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Download /> Download the template
            </a>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              {COLUMNS.map(([column, help]) => (
                <div key={column} className="contents">
                  <dt className="font-mono text-xs leading-5">{column}</dt>
                  <dd className="text-muted-foreground">{help}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="space-y-1">
              <h2 className="font-semibold">2. Upload it</h2>
              <p className="text-sm text-muted-foreground">
                Rows with an id, or with exactly one matching title, are added
                straight away. You choose the game for the rest, one row at a time.
              </p>
            </div>
            <CsvImportForm userId={id} />
          </section>
        </div>
      )}
    </MemberListShell>
  );
}
