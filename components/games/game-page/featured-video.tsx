import type { Game } from "@/lib/api/types";
import { featuredVideoEmbed } from "@/lib/games/featured-video";
import { DetailSection } from "@/components/templates/detail-template";

// The game's Featured Video under its heading: the YouTube player alone, no
// caption (the player carries the title and the link out). Absent when the
// game has none, or its link isn't a YouTube video.
export function FeaturedVideo({ game }: { game: Pick<Game, "title" | "featured_video_url"> }) {
  const embed = featuredVideoEmbed(game.featured_video_url);
  if (!embed) return null;

  return (
    <DetailSection id="featured-video" title="Featured video" className="mt-10" headingClassName="mb-4">
      <iframe
        src={embed}
        title={`${game.title}: Featured Video`}
        loading="lazy"
        allow="encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="block aspect-video w-full rounded-md bg-black"
      />
    </DetailSection>
  );
}
