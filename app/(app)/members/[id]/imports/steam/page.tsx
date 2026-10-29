import { apiFetch } from "@/lib/api";
import type { ApiCollection, SteamCollectionImport, UserSocial } from "@/lib/api/types";
import { steamProfileFromSocials } from "@/lib/imports/steam";
import { ImportPage, ImportingLine } from "@/components/imports/import-page";
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

// The start screen. Async so the linked profile is only read when there's no
// open import to show instead.
async function SteamImportStart({ userId }: { userId: string }) {
  const steamProfile = await loadSteamProfile(userId);
  return (
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
      <SteamImportForm userId={userId} defaultProfile={steamProfile} />
    </section>
  );
}

export default async function SteamImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ImportPage<SteamCollectionImport>
      kind="steam"
      userId={id}
      intro={(active) => (
        <ImportingLine
          prefix="Importing the library of"
          name={active.source_profile_name ?? active.steam_profile_ref ?? active.steam_id64}
        />
      )}
      form={<SteamImportStart userId={id} />}
    />
  );
}
