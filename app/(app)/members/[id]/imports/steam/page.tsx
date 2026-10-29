import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type {
  ApiCollection,
  ApiSingle,
  SteamCollectionImport,
  User,
  UserSocial,
} from "@/lib/api/types";
import { loadActiveImport, loadImportSummary } from "@/lib/imports/active";
import { importsHubHref } from "@/lib/imports/kinds";
import { steamProfileFromSocials } from "@/lib/imports/steam";
import { MemberListShell } from "@/components/member/member-list-shell";
import { ImportReviewLoop } from "@/components/imports/import-review-loop";
import { SteamImportForm } from "@/components/imports/steam-import-form";

// The member's linked Steam profile, to prefill the form. Empty when they
// have none or the socials can't be read.
async function loadSteamProfile(userId: string): Promise<string> {
  try {
    const res = await apiFetch(`/api/v1/users/${userId}/socials`, { cache: "no-store" });
    if (!res.ok) return "";
    const body: ApiCollection<UserSocial> = await res.json();
    return steamProfileFromSocials(body.data ?? []);
  } catch {
    return "";
  }
}

export default async function SteamImportPage({
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
    loadActiveImport<SteamCollectionImport>("steam", id),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = user.global_name ?? user.username ?? id;
  const [counts, steamProfile] = await Promise.all([
    active ? loadImportSummary("steam", active.import_id) : null,
    active ? "" : loadSteamProfile(id),
  ]);

  return (
    <MemberListShell
      userId={id}
      displayName={displayName}
      title="Steam library import"
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
          <p className="text-sm text-muted-foreground">
            Importing the library of{" "}
            <span className="font-medium text-foreground">
              {active.source_profile_name ?? active.steam_profile_ref ?? active.steam_id64}
            </span>
          </p>
          <ImportReviewLoop
            kind="steam"
            userId={id}
            initialImport={active}
            initialCounts={counts}
          />
        </div>
      ) : (
        <div className="mx-auto grid w-full max-w-3xl gap-6">
          <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="space-y-1">
              <h2 className="font-semibold">Import your Steam library</h2>
              <p className="text-sm text-muted-foreground">
                We read the games you own on Steam and add each one to your
                collection as a digital copy on Steam. Games with exactly one
                matching title in GameDB are added straight away; you choose the
                game for the rest, one at a time. Games already in your
                collection are skipped.
              </p>
            </div>
            <SteamImportForm userId={id} defaultProfile={steamProfile} />
          </section>
        </div>
      )}
    </MemberListShell>
  );
}
