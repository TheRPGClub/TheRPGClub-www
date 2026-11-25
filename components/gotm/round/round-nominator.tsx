import Link from "next/link";
import type { GotmRoundNomination } from "@/lib/api/types";
import { memberName } from "@/lib/achievements";
import { cn } from "@/lib/utils";

// Who put a game forward: their profile link, or plain "Unknown member" for
// a nominator imported as a placeholder (no profile to open).
export function Nominator({
  user,
  strong = false,
}: {
  user: GotmRoundNomination["user"];
  // On art the name reads brighter than its "Nominated by".
  strong?: boolean;
}) {
  if (!user) return <span className="italic">Unknown member</span>;
  return (
    <Link
      href={`/members/${user.user_id}`}
      className={cn(
        "underline decoration-border-strong underline-offset-3 transition-colors hover:text-highlight hover:decoration-highlight",
        strong ? "text-foreground" : "text-foreground/90",
      )}
    >
      {memberName(user)}
    </Link>
  );
}
