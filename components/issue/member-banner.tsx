import Link from "next/link";
import { FileUp, Pencil } from "lucide-react";
import type { Membership, UserSocial } from "@/lib/api/types";
import { SocialIcon } from "@/components/social-icon";
import { MemberAvatar } from "@/components/issue/member-cover";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The member feature at the top of a profile: the name in monumental caps
// over key art, the handle and join date, Discord roles as chips, socials,
// and the owner's own actions top-right. The art is the member's own pick
// (their #1 favorite, else what they're playing); without one the banner is
// plain ink.

function roleList(membership: Membership | undefined | null): string[] {
  if (!membership) return [];
  const roles: string[] = [];
  if (membership.admin) roles.push("Admin");
  if (membership.dev) roles.push("Dev");
  if (membership.moderator) roles.push("Moderator");
  if (membership.regular) roles.push("Regular");
  if (membership.member) roles.push("Member");
  if (membership.longstanding) roles.push("Longstanding");
  if (membership.newcomer) roles.push("Newcomer");
  if (!membership.active) roles.push("Inactive");
  return roles;
}

function joinedLabel(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function MemberBanner({
  userId,
  displayName,
  username,
  joinedAt,
  membership,
  socials,
  art,
  owner,
}: {
  userId: string;
  displayName: string;
  username: string | null;
  joinedAt: string | null;
  membership: Membership | undefined | null;
  socials: UserSocial[];
  art: string | null;
  // The viewer's own profile: edit and imports.
  owner?: { editHref: string; importsHref: string } | null;
}) {
  const roles = roleList(membership);
  const joined = joinedLabel(joinedAt);
  const handle =
    username && username !== displayName ? `@${username}` : null;
  // Long names step down so the masthead never overflows its column.
  const nameSize =
    displayName.length > 14
      ? "text-6xl sm:text-7xl lg:text-[5.5rem]"
      : displayName.length > 9
        ? "text-[4.25rem] sm:text-[5.5rem] lg:text-[6.5rem]"
        : "text-[4.75rem] sm:text-[6.5rem] lg:text-[8.25rem]";

  return (
    <section
      aria-label="Member profile"
      className="relative isolate overflow-hidden rounded-md border border-rule bg-ink-2"
    >
      {art && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={art}
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover object-[60%_30%]"
        />
      )}
      {art && (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(11_11_13/0.97)_0%,rgb(11_11_13/0.88)_38%,rgb(11_11_13/0.35)_72%,rgb(11_11_13/0.6)_100%),linear-gradient(0deg,rgb(11_11_13/0.9)_0%,transparent_45%)]"
        />
      )}

      {owner && (
        <div className="absolute top-3 right-3 z-10 flex gap-2 sm:top-5 sm:right-5">
          <Link
            href={owner.importsHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "bg-ink/70",
            )}
          >
            <FileUp data-icon="inline-start" />
            Imports
          </Link>
          <Link
            href={owner.editHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "bg-ink/70",
            )}
          >
            <Pencil data-icon="inline-start" />
            Edit profile
          </Link>
        </div>
      )}

      <div
        className={cn(
          "grid items-end gap-4 px-4.5 pb-5 sm:grid-cols-[auto_1fr] sm:gap-7 sm:px-8.5 sm:pb-7.5",
          owner ? "pt-16 sm:pt-9" : "pt-6 sm:pt-9",
          "sm:min-h-[21rem]",
        )}
      >
        <MemberAvatar
          userId={userId}
          name={displayName}
          className="size-24 shadow-[0_0_0_4px_var(--color-ink),0_10px_30px_rgb(0_0_0/0.5)] sm:size-42"
          fallbackClassName="text-[3.5rem] sm:text-[6rem]"
        />
        <div className="min-w-0">
          <h1
            className={cn(
              "font-headline leading-[0.8] tracking-[-0.01em] break-words",
              nameSize,
            )}
          >
            {displayName}
          </h1>
          {(handle || joined) && (
            <p className="font-label mt-3 text-[1.05rem] font-bold tracking-[0.06em] text-paper-dim">
              {handle}
              {handle && joined && (
                <span aria-hidden className="mx-2 text-paper-mute">
                  ·
                </span>
              )}
              {joined && <>In the club since {joined}</>}
            </p>
          )}
          {roles.length > 0 && (
            <ul aria-label="Roles" className="mt-3.5 flex flex-wrap gap-1.5">
              {roles.map((role, i) => (
                <li
                  key={role}
                  className={cn(
                    "font-label inline-flex h-6 items-center rounded-xs px-2 text-[0.78rem] font-extrabold tracking-[0.08em]",
                    i === 0
                      ? "bg-paper text-ink"
                      : "text-paper shadow-[inset_0_0_0_1.5px_var(--color-paper-dim)]",
                  )}
                >
                  {role}
                </li>
              ))}
            </ul>
          )}
          {socials.length > 0 && (
            <ul
              aria-label="Socials"
              className="mt-4 flex flex-wrap gap-x-4.5 gap-y-1.5"
            >
              {socials.map((social) => {
                const label = social.social_platform?.label ?? "Link";
                const body = (
                  <>
                    <SocialIcon
                      label={social.social_platform?.label}
                      width="15"
                      height="15"
                      className="shrink-0 text-paper-mute"
                    />
                    <b className="font-label text-xs font-extrabold tracking-[0.1em] text-paper-mute">
                      {label}
                    </b>
                    <span className="break-all">{social.display_text}</span>
                  </>
                );
                return (
                  <li key={social.id}>
                    {social.url ? (
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-paper-dim transition-colors hover:text-highlight"
                      >
                        {body}
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-paper-dim">
                        {body}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
