import { notFound, redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getFeatures, requireAuth } from "@/lib/session";
import type { ImportJob } from "@/lib/api/types";
import {
  loadActiveImport,
  loadImportSummary,
  loadSocials,
} from "@/lib/imports/active";
import { importKindHref, shownImportKinds } from "@/lib/imports/kinds";
import { PageHeader } from "@/components/templates/page-header";
import { ImportKindList } from "@/components/imports/import-kind-list";
import { OpenImportPanel } from "@/components/imports/open-import-panel";

// The imports hub: any open import leads as a yellow progress panel (it's
// the member's unfinished business), then every import kind as a row with
// what it does and the one thing to do next: start it, resume it, or link
// the account it reads first.
export default async function ImportsHubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  if (session.principal.discord_id !== id) redirect(`/members/${id}`);

  // Only the imports whose Feature (the list they write to) is shown.
  const order = shownImportKinds(await getFeatures());

  const [userRes, socials, ...active] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    loadSocials(id),
    ...order.map((kind) => loadActiveImport(kind, id)),
  ]);

  if (!userRes.ok) notFound();

  const kinds = order.map((kind, i) => ({
    kind,
    active: active[i] as ImportJob | null,
  }));
  const open = kinds.filter((k) => k.active !== null);
  const counts = await Promise.all(
    open.map(({ kind, active: job }) => loadImportSummary(kind, job!.import_id)),
  );

  return (
    <div className="space-y-7">
      <PageHeader
        back={{ href: `/members/${id}/edit`, label: "Edit profile" }}
        title="Imports"
        count={open.length > 0 ? `${open.length} open` : undefined}
        description="Bring games in from elsewhere. You can pause an import and come back to it later; you can have one open import of each kind."
      />
      {open.map(({ kind, active: job }, i) => (
        <OpenImportPanel
          key={kind}
          kind={kind}
          job={job!}
          counts={counts[i]}
          href={importKindHref(id, kind)}
        />
      ))}
      <ImportKindList userId={id} kinds={kinds} socials={socials} />
    </div>
  );
}
