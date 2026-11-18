import { funFactSegments } from "@/lib/codex/fun-fact-text";
import { BaseMentionPlugin } from "@/lib/codex/story-plugins";
import { DESCRIPTION_SCHEMA, sanitizeStory } from "@/lib/codex/story-schema";
import type { CodexEntry } from "@/lib/codex/types";
import { RichTextContent } from "@/components/rich-text/rich-text-content";
import { richTextStaticPlugins } from "@/components/rich-text/static-kit";
import { MemberName, mentionComponents } from "./history-mention";

const PLUGINS = [...richTextStaticPlugins, BaseMentionPlugin];
const TEXT =
  "max-w-[60ch] text-[0.95rem] leading-[1.55] text-dim-foreground [&_p+p]:mt-2 [&_strong]:text-foreground [&_:is(h1,h2,h3)]:mt-3 [&_:is(h1,h2,h3)]:font-semibold [&_:is(h1,h2,h3)]:text-foreground";

// A History Event's description (2B): its rich text, members by their
// current names (linked for Members). One written without rich text (by
// the bot, say) reads from its Discord text a paragraph at a time.
export function HistoryDescription({ event, linked }: { event: CodexEntry; linked: boolean }) {
  const value = sanitizeStory(event.rich_body, DESCRIPTION_SCHEMA);
  if (value) {
    return (
      <RichTextContent
        value={value}
        plugins={PLUGINS}
        components={mentionComponents(event.mentions, linked)}
        className={TEXT}
      />
    );
  }
  const body = event.body?.trim();
  if (!body) return null;
  return (
    <div className={TEXT}>
      {body.split(/\n{2,}/).map((paragraph, i) => (
        <p key={i} className="whitespace-pre-wrap">
          {funFactSegments(paragraph, event.mentions).map((segment, j) =>
            segment.kind === "text" ? (
              <span key={j}>{segment.text}</span>
            ) : (
              <MemberName key={j} member={segment.member} linked={linked} />
            ),
          )}
        </p>
      ))}
    </div>
  );
}
