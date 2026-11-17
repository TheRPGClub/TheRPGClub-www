import Image from "next/image";
import { initials } from "@/lib/challenges/runs";
import { cn } from "@/lib/utils";

// A member's round mark: their initials on paper (the Challenge JSON carries
// no Discord avatar), or the club's logo for a club-hosted Challenge.
export function MemberMark({
  name,
  club = false,
  size = 24,
  className,
}: {
  name: string;
  club?: boolean;
  size?: number;
  className?: string;
}) {
  const style = {
    width: size,
    height: size,
    fontSize: Math.round(size * 0.42),
  };
  if (club) {
    return (
      <Image
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full bg-background object-contain", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={style}
      className={cn(
        "font-label inline-grid shrink-0 place-items-center rounded-full bg-dim-foreground leading-none font-extrabold tracking-[0.02em] text-background",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

// The Host with their mark, as a flyer's footer and the rules row print it.
export function HostLine({ name, club, className }: { name: string; club: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <MemberMark name={name} club={club} />
      <span className="truncate">{name}</span>
    </span>
  );
}
