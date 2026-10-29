import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { ApiSingle, ImportJob, User } from "@/lib/api/types";
import { loadActiveImport } from "@/lib/imports/active";
import {
  IMPORT_KINDS,
  IMPORT_KIND_ORDER,
  IMPORT_STATUS_LABELS,
  importItemCount,
  importKindHref,
  type ImportKind,
} from "@/lib/imports/kinds";
import { MemberListShell } from "@/components/member/member-list-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export default async function ImportsHubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session) redirect("/");
  if (session.principal.discord_id !== id) redirect(`/members/${id}`);

  const [userRes, ...active] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    ...IMPORT_KIND_ORDER.map((kind) => loadActiveImport(kind, id)),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = user.global_name ?? user.username ?? id;

  return (
    <MemberListShell
      userId={id}
      displayName={displayName}
      title="Imports"
      action={
        <Link
          href={`/members/${id}/edit`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Edit profile
        </Link>
      }
    >
      <p className="text-sm text-muted-foreground">
        Bring games in from elsewhere. You can pause an import and come back to
        it later; you can have one open import of each kind.
      </p>
      <ul className="grid gap-4 md:grid-cols-3">
        {IMPORT_KIND_ORDER.map((kind, i) => (
          <ImportKindCard
            key={kind}
            kind={kind}
            href={importKindHref(id, kind)}
            label={IMPORT_KINDS[kind].label}
            description={IMPORT_KINDS[kind].description}
            active={active[i] as ImportJob | null}
          />
        ))}
      </ul>
    </MemberListShell>
  );
}

function ImportKindCard({
  kind,
  href,
  label,
  description,
  active,
}: {
  kind: ImportKind;
  href: string;
  label: string;
  description: string;
  active: ImportJob | null;
}) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-semibold">{label}</h2>
        {active && (
          <Badge variant={active.status === "active" ? "default" : "secondary"}>
            {IMPORT_STATUS_LABELS[active.status] ?? active.status}
          </Badge>
        )}
      </div>
      <p className="flex-1 text-sm text-muted-foreground">{description}</p>
      {active && (
        <p className="text-xs text-muted-foreground tabular-nums">
          Started {new Date(active.created_at).toLocaleDateString()} ·{" "}
          {importItemCount(kind, active.total_count)}
        </p>
      )}
      <Link
        href={href}
        className={buttonVariants({
          variant: active ? "default" : "outline",
          size: "sm",
          className: "self-start",
        })}
      >
        {active ? "Resume" : "Start"} <ArrowRight />
      </Link>
    </li>
  );
}
