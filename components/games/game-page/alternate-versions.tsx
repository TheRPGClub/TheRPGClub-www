import { fetchGameRelations } from "@/lib/games/game-page";
import { ButtonLink } from "@/components/ui/button";
import { DetailSection } from "@/components/templates/detail-template";

// The game's other versions, last on its page, shown only when it has some.
// Admins link and unlink them on the Game Edit page.
export async function AlternateVersions({ gameId }: { gameId: number }) {
  const relations = await fetchGameRelations(gameId);
  const alternates = relations?.alternates ?? [];
  if (alternates.length === 0) return null;

  return (
    <DetailSection
      id="alternate-versions"
      title="Alternate versions"
      count={`${alternates.length} ${alternates.length === 1 ? "version" : "versions"}`}
      className="mt-10"
      headingClassName="mb-4"
    >
      <ul className="flex flex-wrap gap-2">
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
    </DetailSection>
  );
}
