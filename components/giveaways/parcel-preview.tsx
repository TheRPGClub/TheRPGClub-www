import type { Game } from "@/lib/api/types";
import { platformFamily } from "@/lib/giveaways";
import { PlatformChip } from "@/components/giveaways/platform-chip";
import { WrappedCover } from "@/components/giveaways/wrap/wrapped-cover";

// The donation as it will stand on the shelf, wrapped live while the form is
// filled: the picked game's whole cover, tied in the platform's ribbon (it
// ties itself on as the game is picked). Before a game is picked, a dashed
// space waits for one.
export function ParcelPreview({ game, platform, region }: { game: Game | null; platform: string; region: string }) {
  if (!game) {
    return (
      <div className="grid aspect-[3/4] w-full place-content-center rounded-md border-2 border-dashed border-border-strong p-8 text-center">
        <p className="font-headline text-3xl leading-none text-dim-foreground">Pick a game</p>
        <p className="mt-2 text-sm text-faint-foreground">It wraps here, ready for the shelf.</p>
      </div>
    );
  }
  const ink = platformFamily(platform || "Other").ink;
  return (
    <WrappedCover
      key={game.game_id}
      title={game.title}
      coverUrl={game.cover_url}
      ink={ink}
      tieIn
      className="w-full -rotate-1 shadow-[0_24px_60px_rgb(0_0_0/0.6)]"
      fallbackClassName="text-3xl"
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
