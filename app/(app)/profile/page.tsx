import Image from "next/image";
import { requireAuth } from "@/lib/session";
import { discordAvatarUrl } from "@/lib/auth-types";

const roleColors: Record<string, string> = {
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  zinc: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${roleColors[color] ?? roleColors.zinc}`}
    >
      {label}
    </span>
  );
}

export default async function ProfilePage() {
  const { principal, membership } = await requireAuth();
  const displayName = principal.global_name ?? principal.username;
  const avatarUrl = discordAvatarUrl(
    principal.discord_id,
    principal.avatar,
    256,
  );

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border bg-card p-8 w-full max-w-sm shadow-sm mx-auto">
      <Image
        src={avatarUrl}
        alt={displayName}
        width={96}
        height={96}
        className="rounded-full ring-2 ring-border"
        priority
      />
      <div className="text-center">
        <p className="text-xl font-semibold">{displayName}</p>
        {principal.global_name && (
          <p className="text-sm text-muted-foreground">@{principal.username}</p>
        )}
      </div>
      {membership && (
        <div className="flex flex-wrap gap-2 justify-center">
          {membership.admin && <Badge label="Admin" color="red" />}
          {membership.moderator && <Badge label="Moderator" color="orange" />}
          {membership.regular && <Badge label="Regular" color="blue" />}
          {membership.member && <Badge label="Member" color="green" />}
          {membership.newcomer && <Badge label="Newcomer" color="zinc" />}
          {!membership.active && <Badge label="Inactive" color="zinc" />}
        </div>
      )}
    </div>
  );
}
