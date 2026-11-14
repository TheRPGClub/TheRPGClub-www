import { loadSocials } from "@/lib/imports/active";
import { steamProfileFromSocials } from "@/lib/imports/steam";
import { ImportStep } from "@/components/templates/import-step";
import { SteamImportForm } from "@/components/imports/steam-import-form";

// The Steam import's start screen. Async so the linked profile is only read
// when there's no open import to show instead; the read is shared with the
// page's linked-account check.
export async function SteamImportStart({ userId }: { userId: string }) {
  const steamProfile = steamProfileFromSocials((await loadSocials(userId)) ?? []);
  return (
    <ImportStep
      title="Import your Steam library"
      description="We read the games you own on Steam and add each one to your collection as a digital copy on Steam. Games with exactly one matching title in GameDB are added straight away; you choose the game for the rest, one at a time. Games already in your collection are skipped."
    >
      <SteamImportForm userId={userId} defaultProfile={steamProfile} />
    </ImportStep>
  );
}
