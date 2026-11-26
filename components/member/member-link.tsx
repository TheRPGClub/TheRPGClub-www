import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// A member's mark or name, opening their profile. It sits above a card's
// stretched link (`relative z-[2]`), so a byline inside a card still opens
// the member, not the card. Without a member (the club) it is plain text.
export function MemberLink({
  userId,
  children,
  className,
}: {
  userId: string | null | undefined;
  children: ReactNode;
  className?: string;
}) {
  if (!userId) return <span className={className}>{children}</span>;
  return (
    <Link
      href={`/members/${userId}`}
      className={cn(
        "relative z-[2] rounded-full outline-highlight outline-offset-2 transition-colors hover:text-highlight focus-visible:outline-2",
        className,
      )}
    >
      {children}
    </Link>
  );
}
