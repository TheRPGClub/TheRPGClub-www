import { Fragment, type ReactNode } from "react";
import { Cake } from "lucide-react";
import type { ProfileBirthday } from "@/lib/birthday";
import { cn } from "@/lib/utils";

// The line under the member's name: handle, join month and, when they share
// it, their Birthday (day and month, never the year). On the day itself it
// reads "Birthday today" in paper.
export function BannerByline({
  handle,
  joined,
  birthday,
}: {
  handle: string | null;
  joined: string | null;
  birthday: ProfileBirthday | null;
}) {
  const parts: { key: string; node: ReactNode }[] = [];
  if (handle) parts.push({ key: "handle", node: handle });
  if (joined) parts.push({ key: "joined", node: <>In the club since {joined}</> });
  if (birthday) parts.push({ key: "birthday", node: <BylineBirthday birthday={birthday} /> });
  if (parts.length === 0) return null;

  return (
    <p className="font-label mt-3 text-[1.05rem] font-bold tracking-[0.06em] text-dim-foreground">
      {parts.map(({ key, node }, i) => (
        <Fragment key={key}>
          {i > 0 && (
            <span aria-hidden className="mx-2 text-faint-foreground">
              ·
            </span>
          )}
          {node}
        </Fragment>
      ))}
    </p>
  );
}

function BylineBirthday({ birthday }: { birthday: ProfileBirthday }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap",
        birthday.today && "text-foreground",
      )}
    >
      <Cake aria-hidden className="size-[0.9em] shrink-0 -translate-y-px" />
      {birthday.today ? (
        "Birthday today"
      ) : (
        <span>
          <span className="sr-only">Birthday </span>
          {birthday.label}
        </span>
      )}
    </span>
  );
}

// On the Birthday, a paper day tape pinned across the banner's top-left
// corner, running off its edge, with a torn right end. On a phone it drops
// below the owner's actions when they're there.
export function BirthdayTape({ label, owner }: { label: string; owner: boolean }) {
  return (
    <p
      data-slot="birthday-tape"
      className={cn(
        "absolute -left-1.5 z-10 drop-shadow-[0_6px_14px_rgb(0_0_0/0.45)] sm:top-5.5",
        owner ? "top-14" : "top-3.5",
      )}
    >
      <span data-slot="birthday-tape-strip" className="font-label flex items-center gap-2 bg-foreground/95 py-2 pr-4 pl-4.5 text-[0.82rem] leading-none font-extrabold tracking-[0.08em] text-background sm:py-2.5 sm:pr-5 sm:pl-5.5 sm:text-[0.95rem]">
        <Cake aria-hidden className="size-3.5 shrink-0" />
        Birthday today · {label}
      </span>
    </p>
  );
}
