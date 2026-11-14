import type { SteamCollectionImport } from "@/lib/api/types";
import { ImportPage } from "@/components/templates/import-page";
import { ImportingLine } from "@/components/templates/import-step";
import { SteamImportStart } from "@/components/imports/steam-import-start";

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
