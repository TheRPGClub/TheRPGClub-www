import { describe, expect, it } from "vitest";

import { featuredVideoEmbed, youTubeId } from "./featured-video";

describe("Featured Video", () => {
  it.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ?t=4",
    "https://m.youtube.com/watch?v=dQw4w9WgXcQ&list=x",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://youtube.com/shorts/dQw4w9WgXcQ",
  ])("reads the YouTube id of %s", (link) => {
    expect(youTubeId(link)).toBe("dQw4w9WgXcQ");
  });

  it("embeds YouTube through its privacy-enhanced host", () => {
    expect(featuredVideoEmbed("https://youtu.be/dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("embeds nothing else", () => {
    expect(featuredVideoEmbed("https://vimeo.com/123")).toBeNull();
    expect(featuredVideoEmbed("not a link")).toBeNull();
    expect(featuredVideoEmbed(null)).toBeNull();
  });
});
