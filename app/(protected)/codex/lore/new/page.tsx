import { redirect } from "next/navigation";
import { requireAuth, requireFeature } from "@/lib/session";
import { isRegularOrStaff } from "@/lib/staff";
import { readStory } from "@/lib/codex/lore-story";
import { LORE_PATH } from "@/lib/codex/paths";
import { memberAvatarPath } from "@/lib/codex/avatar";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { LoreDesk } from "@/components/codex/desk/lore-desk";
import { LoreAuthor } from "@/components/codex/lore/lore-author";

// Writing a new Lore Entry at the desk (www#125, design 5D): Regulars and
// staff, as the API allows.
export default async function NewLoreEntryPage() {
  const session = await requireAuth();
  const features = await requireFeature("club_codex");
  if (!isRegularOrStaff(session.membership)) redirect(LORE_PATH);
  const { principal } = session;
  const me = {
    user_id: principal.discord_id,
    name: principal.global_name ?? principal.username,
    avatar_url: memberAvatarPath(principal.discord_id),
  };
  return (
    <LoreDesk
      entry={null}
      initialValue={readStory(null)}
      author={<LoreAuthor member={me} />}
      badge={features.preview("club_codex") && <PreviewBadge />}
    />
  );
}
