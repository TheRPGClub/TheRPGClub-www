import type { ReactNode } from "react";
import type { Membership, UserSocial } from "@/lib/api/types";
import type { ProfileBirthday } from "@/lib/birthday";
import { MemberAvatar } from "@/components/issue/member-cover";
import { BannerOwnerActions } from "@/components/issue/member-banner-actions";
import { BannerByline, BirthdayTape } from "@/components/issue/member-banner-byline";
import { joinedLabel, roleList } from "@/components/issue/member-banner-labels";
import { BannerRoles } from "@/components/issue/member-banner-roles";
import { BannerSocials } from "@/components/issue/member-banner-socials";
import { cn } from "@/lib/utils";

// The member feature at the top of a profile: the name in monumental caps
// over key art, the handle, join date and shared Birthday, Discord roles as
// chips, socials, and the owner's own actions top-right. On the Birthday a
// paper day tape is pinned to the banner's top-left corner. The art is the member's own pick
// (their #1 favorite, else what they're playing); without one the banner is
// plain ink.

export function MemberBanner({
  userId,
  discordAvatar = null,
  displayName,
  username,
  joinedAt,
  membership,
  socials,
  art,
  birthday = null,
  owner,
  stats,
}: {
  userId: string;
  // Their Discord avatar hash, for the picture from Discord's image server.
  discordAvatar?: string | null;
  displayName: string;
  username: string | null;
  joinedAt: string | null;
  membership: Membership | undefined | null;
  socials: UserSocial[];
  art: string | null;
  // The member's shared Birthday; null when they don't share it.
  birthday?: ProfileBirthday | null;
  // The viewer's own profile: edit and imports.
  // importsHref: null when the viewer has nothing to import (no import
  // kind's Feature is shown).
  owner?: { editHref: string; importsHref: string | null } | null;
  // A row of the member's figures under the name (the profile's Playtime and
  // Completed count).
  stats?: ReactNode;
}) {
  const roles = roleList(membership);
  const tape = birthday?.today ? birthday.label : null;
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
      className="relative isolate overflow-hidden rounded-md border border-border bg-card"
    >
      {art && (
        // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
        <img
          src={art}
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover object-[60%_30%]"
        />
      )}
      {art && (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-background)_97%,transparent)_0%,color-mix(in_oklab,var(--color-background)_88%,transparent)_38%,color-mix(in_oklab,var(--color-background)_35%,transparent)_72%,color-mix(in_oklab,var(--color-background)_60%,transparent)_100%),linear-gradient(0deg,color-mix(in_oklab,var(--color-background)_90%,transparent)_0%,transparent_45%)]"
        />
      )}

      {owner && (
        <BannerOwnerActions
          editHref={owner.editHref}
          importsHref={owner.importsHref}
        />
      )}

      <div
        className={cn(
          "grid items-end gap-4 px-4.5 pb-5 sm:grid-cols-[auto_1fr] sm:gap-7 sm:px-8.5 sm:pb-7.5",
          owner ? (tape ? "pt-[6.75rem]" : "pt-16") : tape ? "pt-16" : "pt-6",
          tape ? "sm:pt-20" : "sm:pt-9",
          "sm:min-h-[21rem]",
        )}
      >
        <MemberAvatar
          userId={userId}
          discordAvatar={discordAvatar}
          name={displayName}
          className="size-24 shadow-[0_0_0_4px_var(--color-background),0_10px_30px_rgb(0_0_0/0.5)] sm:size-42"
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
          <BannerByline handle={handle} joined={joined} birthday={birthday} />
          {roles.length > 0 && <BannerRoles roles={roles} />}
          {socials.length > 0 && <BannerSocials socials={socials} />}
          {stats}
        </div>
      </div>

      {tape && <BirthdayTape label={tape} owner={!!owner} />}
    </section>
  );
}
