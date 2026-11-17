import Image from "next/image";
import { initials } from "@/lib/challenges/runs";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// A member's round mark: their avatar when the API names one (their initials
// on dim paper until it loads, or if it can't), else the initials alone, or
// the club's logo for a club-hosted Challenge.
export function MemberMark({
  name,
  src = null,
  club = false,
  size = 24,
  className,
}: {
  name: string;
  src?: string | null;
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
  if (src) {
    return (
      <Avatar variant="member-mark" aria-hidden style={{ width: size, height: size }} className={className}>
        <AvatarImage src={src} alt="" />
        <AvatarFallback style={{ fontSize: style.fontSize }}>{initials(name)}</AvatarFallback>
      </Avatar>
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
export function HostLine({
  name,
  club,
  avatar = null,
  className,
}: {
  name: string;
  club: boolean;
  avatar?: string | null;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <MemberMark name={name} club={club} src={avatar} />
      <span className="truncate">{name}</span>
    </span>
  );
}
