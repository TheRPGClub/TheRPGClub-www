import { describe, expect, it } from "vitest";
import { avatarSrc, memberAvatarSrc, memberPictureSrc } from "@/lib/members/avatar";

describe("member avatars", () => {
  it("loads a stored avatar through this site, never the API's own address", () => {
    expect(memberAvatarSrc("42")).toBe("/api/members/42/avatar");
    expect(avatarSrc("/api/v1/users/42/avatar")).toBe("/api/members/42/avatar");
  });

  it("draws a member with a Discord avatar hash from Discord's image server", () => {
    expect(memberPictureSrc({ user_id: "42", discord_avatar: "abc" })).toBe(
      "https://cdn.discordapp.com/avatars/42/abc.png?size=256",
    );
    expect(memberPictureSrc({ user_id: "42", discord_avatar: null })).toBe("/api/members/42/avatar");
  });
});
