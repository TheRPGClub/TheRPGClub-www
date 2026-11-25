import type { MemberProfile } from "@/lib/members/profile-page";
import { bannerArt } from "@/lib/members/profile-page";
import { importsHubHref } from "@/lib/imports/kinds";
import { MemberBanner } from "@/components/issue/member-banner";
import { memberName } from "@/lib/achievements";
import { profileBirthday } from "@/lib/birthday";
import { clubToday } from "@/lib/challenges/dates";
import { formatPlaytime } from "@/lib/members/profile-playtime";

// The profile's hero: the member's masthead, wearing their own pick's art,
// with edit and imports on their own page. Their Birthday shows only when
// they share it, and "today" is the club's (America/New_York). Under the
// name: their Playtime across every game, beside the Completed count.
export function ProfileBanner({ profile }: { profile: MemberProfile }) {
  const { user, isSelf, show, lists, playtime, counts } = profile;
  const stats = [
    playtime && { value: formatPlaytime(playtime.total), label: "Playtime, all games" },
    show.completed && { value: counts.completed.toLocaleString("en-US"), label: "Completed" },
  ].filter((s) => !!s);
  return (
    <MemberBanner
      userId={user.user_id}
      displayName={memberName(user)}
      username={user.username}
      joinedAt={user.server_joined_at}
      membership={user.membership}
      socials={user.socials ?? []}
      art={bannerArt(lists.favorites.data, lists.nowPlaying.data)}
      birthday={profileBirthday(user.birthday, clubToday())}
      stats={stats.length > 0 && <BannerStats stats={stats} />}
      owner={
        isSelf
          ? {
              editHref: `/members/${user.user_id}/edit`,
              importsHref: show.imports ? importsHubHref(user.user_id) : null,
            }
          : null
      }
    />
  );
}

function BannerStats({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <dl className="mt-4 flex flex-wrap gap-x-6.5 gap-y-2">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col-reverse">
          <dt className="font-label mt-1 text-[0.72rem] leading-tight font-bold tracking-[0.08em] text-faint-foreground">
            {stat.label}
          </dt>
          <dd className="font-headline text-[2rem] leading-[0.9]">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
