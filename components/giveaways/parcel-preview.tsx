import type { Game } from "@/lib/api/types";
import { platformFamily } from "@/lib/giveaways";
import { PlatformChip } from "@/components/giveaways/platform-chip";
import { WrappedCover } from "@/components/giveaways/wrap/wrapped-cover";

// The donation as it will stand on the shelf, wrapped live while the form is
// filled: the picked game's whole cover, tied in the platform's ribbon (it
// ties itself on as the game is picked). Before a game is picked, an empty
// parcel in the platform's gift paper waits for one.
export function ParcelPreview({ game, platform, region }: { game: Game | null; platform: string; region: string }) {
  const ink = platformFamily(platform || "Steam").ink;
  if (!game) {
    return (
      <WrappedCover title="" coverUrl={null} ink={ink} className="w-full -rotate-1 shadow-[0_24px_60px_rgb(0_0_0/0.6)]">
        <p className="absolute right-[8%] bottom-[7%] left-[8%] -rotate-2 rounded-xs bg-foreground p-3 text-background shadow-[0_3px_6px_rgb(0_0_0/0.45)]">
          <span className="font-headline block text-[11cqw] leading-none">Pick a game</span>
          <span className="mt-1 block text-[4.6cqw] text-slip-muted-foreground">It wraps up here, ready for the shelf.</span>
        </p>
      </WrappedCover>
    );
  }
  return (
    <WrappedCover
      key={game.game_id}
      title={game.title}
      coverUrl={game.cover_url}
      ink={ink}
      tieIn
      className="w-full -rotate-1 shadow-[0_24px_60px_rgb(0_0_0/0.6)]"
    >
      {platform && (
        <span className="absolute top-3 left-3 rounded-xs shadow-[0_0_0_2px_rgb(11_11_13/0.45)]">
          <PlatformChip ink={ink}>
            {platform}
            {region !== "Global" ? ` · ${region}` : ""}
          </PlatformChip>
        </span>
      )}
    </WrappedCover>
  );
}
