import type { CodexMember } from "@/lib/codex/types";
import { memberPictureSrc } from "@/lib/members/avatar";
import { MemberMark } from "@/components/challenges/host-badge";

// A member's round mark on the Codex: their stored avatar from the API, with
// their initials until it loads or when they have none.
export function CodexMemberMark({ member, size = 22 }: { member: CodexMember; size?: number }) {
  return <MemberMark name={member.name} src={memberPictureSrc(member)} size={size} />;
}
