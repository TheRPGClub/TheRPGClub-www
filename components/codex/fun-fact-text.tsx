import Link from "next/link";
import { funFactSegments } from "@/lib/codex/fun-fact-text";
import type { CodexMember } from "@/lib/codex/types";

// A Fun Fact as it reads: each mentioned member as their current name,
// linking to their profile, in the ink of whatever the text sits on (paper
// on the band, ink on a card).
export function FunFactText({
  body,
  mentions,
}: {
  body: string;
  mentions: Readonly<Record<string, CodexMember>>;
}) {
  return (
    <>
      {funFactSegments(body, mentions).map((segment, i) =>
        segment.kind === "text" ? (
          <span key={i}>{segment.text}</span>
        ) : (
          <Link
            key={i}
            href={`/members/${segment.member.user_id}`}
            className="font-semibold whitespace-nowrap underline decoration-current/40 decoration-1 underline-offset-[3px] transition-colors hover:decoration-current"
          >
            {segment.member.name}
          </Link>
        ),
      )}
    </>
  );
}
