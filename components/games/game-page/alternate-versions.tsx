import { fetchGameRelations } from "@/lib/games/game-page";
import { ButtonLink } from "@/components/ui/button";
import { LinkVersionForm } from "@/components/game-links/link-version-form";
import { DetailSection } from "@/components/templates/detail-template";

// The game's other versions, last on its page. Admins also get "Link a
// version" here, so the section shows for them even before the game has any.
export async function AlternateVersions({
  gameId,
  canLink,
}: {
  gameId: number;
  canLink: boolean;
}) {
  const relations = await fetchGameRelations(gameId);
  const alternates = relations?.alternates ?? [];
  if (alternates.length === 0 && !canLink) return null;

  return (
    <DetailSection
      id="alternate-versions"
      title="Alternate versions"
      count={
        alternates.length
          ? `${alternates.length} ${alternates.length === 1 ? "version" : "versions"}`
          : undefined
      }
      className="mt-10"
      headingClassName="mb-4"
    >
      {alternates.length === 0 && (
        <p className="text-sm text-faint-foreground">
          No other version of this game is linked yet.
        </p>
      )}
      <ul className="flex flex-wrap gap-2 empty:hidden">
        {alternates.map((alt) => (
          <li key={alt.game_id}>
            <ButtonLink
              href={`/games/${alt.game_id}`}
              variant="outline"
              className="h-auto min-h-9 py-1.5 text-left whitespace-normal"
            >
              {alt.title}
            </ButtonLink>
          </li>
        ))}
      </ul>
      {canLink && (
        <LinkVersionForm
          gameId={gameId}
          alternateIds={alternates.map((alt) => alt.game_id)}
        />
      )}
    </DetailSection>
  );
}
