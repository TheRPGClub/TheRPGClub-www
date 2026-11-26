import { describe, expect, it } from "vitest";
import type { PublicWinner } from "@/lib/api/types";
import { SITE_DESCRIPTION, shareCardMetadata } from "./metadata";

const WINNER: PublicWinner = {
  round_number: 42,
  month_year: "2026-11",
  kind: "gotm",
  game_id: 1,
  title: "Chrono Trigger",
  cover_url: null,
  art_url: null,
};

describe("shareCardMetadata", () => {
  it("sets the large card keyed by the latest round, absolute to the site", () => {
    const meta = shareCardMetadata([WINNER], { SITE_URL: "https://therpgclub.com" });
    expect(meta.metadataBase?.toString()).toBe("https://therpgclub.com/");
    expect(meta.description).toBe(SITE_DESCRIPTION);
    expect(meta.twitter).toMatchObject({ card: "summary_large_image" });
    expect(meta.openGraph).toMatchObject({
      type: "website",
      siteName: "The RPG Club",
      images: [{ url: "/share-card?round=42", width: 1200, height: 630 }],
    });
  });

  it("names the bare brand card without winners", () => {
    const meta = shareCardMetadata([], { SITE_URL: "https://therpgclub.com" });
    expect(meta.openGraph).toMatchObject({ images: [{ url: "/share-card" }] });
  });

  it("leaves metadataBase to Next when no origin is configured", () => {
    expect(shareCardMetadata([], {}).metadataBase).toBeUndefined();
  });
});
