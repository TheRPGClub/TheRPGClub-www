import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { GotyVote } from "@/lib/api/goty";
import { GotyNominationNotice } from "./goty-nomination-notice";

const vote = { year: 2026, name: "GOTY Vote 2026" } as GotyVote;

const text = (title: string | null) =>
  renderToStaticMarkup(
    <GotyNominationNotice vote={vote} deleter="Rowan" nominator="Mara" title={title} reason="Released in 2025" />,
  )
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;|“|”/g, '"');

// The bot's goty_nomination_deleted post (bot buildGotyNominationDeletedNotice).
describe("GotyNominationNotice", () => {
  it("reads as the bot's post", () => {
    expect(text("Clair Obscur")).toBe(
      '@Rowan deleted @Mara\'s GOTY Vote 2026 Game of the Year nomination "Clair Obscur". Reason: Released in 2025',
    );
  });

  it("leaves the title out when the game has none", () => {
    expect(text(null)).toBe("@Rowan deleted @Mara's GOTY Vote 2026 Game of the Year nomination. Reason: Released in 2025");
  });
});
