import { fetchGuildChannels } from "@/lib/api/guild-channels";
import { requireAuth } from "@/lib/session";
import { canUseTier, staffSection } from "@/lib/staff";
import { DeskHeader } from "@/components/admin/desk/desk-header";
import { SayForm } from "@/components/admin/say-form";
import { StaffOnly } from "@/components/staff-only";

const SECTION = staffSection("say");

// /admin/say: the bot posts a message in a text channel, or replies to one,
// as the bot's /superadmin say does. Superadmins only.
export default async function SayPage() {
  const session = await requireAuth();
  if (!canUseTier(session.membership, SECTION.tier)) {
    return <StaffOnly title={SECTION.label} tier={SECTION.tier} />;
  }

  const channels = await fetchGuildChannels();

  return (
    <div>
      <DeskHeader
        title={SECTION.label}
        side={
          <>
            <b>Any text channel</b>
            <br />
            Post, or reply to a message
          </>
        }
      />
      <p className="mt-4 max-w-[60ch] text-paper-dim">{SECTION.blurb}</p>
      {channels === null ? (
        <p role="alert" className="mt-6 text-destructive">
          {"Couldn't load the channel list. Refresh to try again."}
        </p>
      ) : channels.length === 0 ? (
        <p className="mt-6 text-paper-dim">
          No channels have been synced from Discord yet. The bot sends the list when it starts.
        </p>
      ) : (
        <SayForm channels={channels} />
      )}
    </div>
  );
}
