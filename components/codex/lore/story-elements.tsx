import Link from "next/link";
import { KEYS, type NodeComponents } from "platejs";
import { SlateElement, type SlateElementProps } from "platejs/static";
import { MENTION_TYPE, type MentionNode } from "@/lib/codex/story-schema";
import type { CodexMember } from "@/lib/codex/types";

// How a Lore Entry's story reads on its page (design 3D): paragraphs in
// Barlow at 18px, headings in Anton caps over a jade bar, a quote set as the
// pull quote, and mentions as the members' current names linking to their
// profiles. Lists, links and spoilers keep the shared renderer's.

function Paragraph(props: SlateElementProps) {
  return (
    <SlateElement {...props} as="p" className="whitespace-pre-wrap">
      {props.children}
    </SlateElement>
  );
}

function makeHeading(tag: "h1" | "h2" | "h3") {
  return function Heading(props: SlateElementProps) {
    return (
      <SlateElement
        {...props}
        as={tag}
        className="font-headline text-[1.75rem] leading-[0.9] text-foreground after:mt-2.5 after:block after:h-[3px] after:w-11 after:bg-codex-lore sm:text-[2rem]"
      >
        {props.children}
      </SlateElement>
    );
  };
}

// The pull quote: Anton caps in jade between jade rules. With more than one
// paragraph, the last is the cite under it (a leading dash dropped).
function PullQuote(props: SlateElementProps) {
  const many = props.element.children.length > 1;
  return (
    <SlateElement
      {...props}
      as="blockquote"
      className={
        "border-y-2 border-codex-lore pt-5.5 pb-5 " +
        "[&>p]:font-headline [&>p]:max-w-[17ch] [&>p]:text-[2.125rem] [&>p]:leading-[0.92] [&>p]:text-codex-lore sm:[&>p]:text-[3.375rem] " +
        (many
          ? "[&>p:last-child]:font-label [&>p:last-child]:mt-3 [&>p:last-child]:max-w-none [&>p:last-child]:text-[0.875rem] [&>p:last-child]:leading-snug [&>p:last-child]:font-bold [&>p:last-child]:tracking-[0.08em] [&>p:last-child]:text-dim-foreground"
          : "")
      }
    >
      {props.children}
    </SlateElement>
  );
}

function makeMention(mentions: Readonly<Record<string, CodexMember>>) {
  return function Mention(props: SlateElementProps) {
    const node = props.element as unknown as MentionNode;
    const member = Object.hasOwn(mentions, node.userId) ? mentions[node.userId] : null;
    return (
      <SlateElement {...props} as="span">
        {member ? (
          <Link
            href={`/members/${member.user_id}`}
            className="font-semibold text-foreground underline decoration-codex-lore/70 decoration-2 underline-offset-[3px] hover:decoration-codex-lore"
          >
            {member.name}
          </Link>
        ) : (
          <span className="font-semibold text-foreground">{node.value ? `@${node.value}` : "@member"}</span>
        )}
        {props.children}
      </SlateElement>
    );
  };
}

export function loreStoryComponents(mentions: Readonly<Record<string, CodexMember>>): NodeComponents {
  return {
    [KEYS.p]: Paragraph,
    [KEYS.h1]: makeHeading("h1"),
    [KEYS.h2]: makeHeading("h2"),
    [KEYS.h3]: makeHeading("h3"),
    [KEYS.blockquote]: PullQuote,
    [MENTION_TYPE]: makeMention(mentions),
  };
}
