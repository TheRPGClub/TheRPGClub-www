import type { CodexMember } from "@/lib/codex/types";
import { MemberMark } from "@/components/challenges/host-badge";

// A member's round mark on the Codex: their stored avatar from the API, with
// their initials until it loads or when they have none.
export function CodexMemberMark({ member, size = 22 }: { member: CodexMember; size?: number }) {
  const api = process.env.API_URL ?? "http://localhost:3000";
  return <MemberMark name={member.name} src={member.avatar_url ? `${api}${member.avatar_url}` : null} size={size} />;
}
