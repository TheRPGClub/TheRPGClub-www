import Link from "next/link";
import type { NodeComponents } from "platejs";
import { SlateElement, type SlateElementProps } from "platejs/static";
import { MENTION_TYPE, type MentionNode } from "@/lib/codex/story-schema";
import type { CodexMember } from "@/lib/codex/types";

// A member a History Event's description mentions, by their current name:
// a link to their profile for a Member, plain text for a Visitor (profiles
// are for Members).
export function MemberName({ member, linked }: { member: CodexMember; linked: boolean }) {
  if (!linked) return <span className="font-semibold text-foreground">{member.name}</span>;
  return (
    <Link
      href={`/members/${member.user_id}`}
      className="font-semibold text-foreground underline decoration-foreground/40 decoration-1 underline-offset-[3px] transition-colors hover:decoration-foreground"
    >
      {member.name}
    </Link>
  );
}

export function mentionComponents(mentions: Readonly<Record<string, CodexMember>>, linked: boolean): NodeComponents {
  return {
    [MENTION_TYPE]: function Mention(props: SlateElementProps) {
      const node = props.element as unknown as MentionNode;
      const member = Object.hasOwn(mentions, node.userId) ? mentions[node.userId] : null;
      return (
        <SlateElement {...props} as="span">
          {member ? (
            <MemberName member={member} linked={linked} />
          ) : (
            <span className="font-semibold text-foreground">{node.value || "a member"}</span>
          )}
          {props.children}
        </SlateElement>
      );
    },
  };
}
