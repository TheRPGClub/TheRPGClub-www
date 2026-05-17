import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { ApiSingle, User, UserSocial } from "@/lib/api/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SocialIcon } from "@/components/social-icon";

const API_BASE = process.env.API_URL ?? "http://localhost:3000";

const roleColors: Record<string, string> = {
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  purple:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
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

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [userRes, session] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    getSession(),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();

  const displayName = user.global_name ?? user.username ?? user.user_id;
  const initials = displayName.slice(0, 2).toUpperCase();
  const membership = user.membership;
  const isSelf = session?.principal.discord_id === user.user_id;
  const socials: UserSocial[] = user.socials ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link
          href="/members"
          className="hover:text-foreground transition-colors"
        >
          Members
        </Link>
        <span>›</span>
        <span className="text-foreground">{displayName}</span>
      </div>

      <div className="relative flex flex-col items-center gap-6 rounded-2xl border bg-card p-8 shadow-sm">
        {isSelf && (
          <Button
            variant="outline"
            size="sm"
            className="absolute right-4 top-4"
            nativeButton={false}
            render={<Link href={`/members/${user.user_id}/edit`} />}
          >
            <Pencil />
            Edit
          </Button>
        )}

        <Avatar size="lg" className="size-24">
          <AvatarImage
            src={`${API_BASE}/api/v1/users/${user.user_id}/avatar`}
            alt={displayName}
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="text-center">
          <p className="text-xl font-semibold">{displayName}</p>
          {user.global_name &&
            user.username &&
            user.global_name !== user.username && (
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            )}
        </div>

        {membership && (
          <div className="flex flex-wrap justify-center gap-2">
            {membership.admin && <Badge label="Admin" color="red" />}
            {membership.dev && <Badge label="Dev" color="purple" />}
            {membership.moderator && (
              <Badge label="Moderator" color="orange" />
            )}
            {membership.regular && <Badge label="Regular" color="blue" />}
            {membership.member && <Badge label="Member" color="green" />}
            {membership.longstanding && (
              <Badge label="Longstanding" color="green" />
            )}
            {membership.newcomer && <Badge label="Newcomer" color="zinc" />}
            {!membership.active && <Badge label="Inactive" color="zinc" />}
          </div>
        )}

        {socials.length > 0 && (
          <dl className="grid w-full grid-cols-1 gap-x-6 gap-y-3 border-t pt-6 sm:grid-cols-2">
            {socials.map((social) => (
              <div key={social.id} className="flex items-start gap-3">
                <SocialIcon
                  label={social.social_platform?.label}
                  className="mt-0.5 shrink-0 text-muted-foreground"
                />
                <div className="flex min-w-0 flex-col">
                  <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {social.social_platform?.label ?? "Unknown"}
                  </dt>
                  <dd className="text-sm">
                    {social.url ? (
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all underline-offset-2 hover:underline"
                      >
                        {social.display_text}
                      </a>
                    ) : (
                      <span className="break-all">{social.display_text}</span>
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
