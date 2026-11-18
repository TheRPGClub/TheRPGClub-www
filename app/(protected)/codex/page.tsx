import { notFound } from "next/navigation";
import { getSession, requireFeature } from "@/lib/session";
import { readCodexContents } from "@/lib/codex/contents-page";
import { isRegularOrStaff } from "@/lib/staff";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { CodexContents } from "@/components/codex/contents/codex-contents";

// The Club Codex contents page (spec api#397, design 1C, www#124): a Fun
// Fact, a door into each part, and what was added lately.

export default async function CodexPage() {
  const features = await requireFeature("club_codex");
  const [session, contents] = await Promise.all([getSession(), readCodexContents()]);
  // The flag changed after the gate ran.
  if (contents === "not_found") notFound();

  return (
    <CodexContents
      contents={contents}
      canAdd={isRegularOrStaff(session?.membership ?? null)}
      badge={features.preview("club_codex") && <PreviewBadge />}
    />
  );
}
