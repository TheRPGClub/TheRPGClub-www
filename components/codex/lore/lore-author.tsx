import Link from "next/link";
import type { CodexMember } from "@/lib/codex/types";
import { CodexMemberMark } from "@/components/codex/codex-member-mark";

// "by Mog Whisperer" with their avatar, the name linking to their profile.
// `lead` is the word before the name ("by", "Told by").
export function LoreAuthor({ member, lead = "by", size = 22 }: { member: CodexMember; lead?: string; size?: number }) {
  return (
    <>
      <CodexMemberMark member={member} size={size} />
      <span>
        {lead}{" "}
        <Link
          href={`/members/${member.user_id}`}
          className="font-semibold text-foreground underline-offset-4 hover:text-highlight hover:underline"
        >
          {member.name}
        </Link>
      </span>
    </>
  );
}
