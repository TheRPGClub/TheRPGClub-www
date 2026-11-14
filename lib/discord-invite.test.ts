import { describe, expect, it } from "vitest";
import { discordInviteUrl } from "./discord-invite";

describe("discordInviteUrl", () => {
  it.each(["https://discord.gg/therpgclub", "https://discord.com/invite/abc123"])(
    "takes the invite %s",
    (invite) => {
      expect(discordInviteUrl(invite)).toBe(invite);
    },
  );

  it("trims stray whitespace from the setting", () => {
    expect(discordInviteUrl("  https://discord.gg/therpgclub\n")).toBe(
      "https://discord.gg/therpgclub",
    );
  });

  it.each([undefined, "", "   "])("refuses to run without the setting (%o)", (value) => {
    expect(() => discordInviteUrl(value)).toThrow(/DISCORD_INVITE_URL/);
  });

  it.each(["discord.gg/therpgclub", "javascript:alert(1)", "http://discord.gg/therpgclub"])(
    "refuses a setting that is not an https link (%s)",
    (value) => {
      expect(() => discordInviteUrl(value)).toThrow(/DISCORD_INVITE_URL/);
    },
  );
});
