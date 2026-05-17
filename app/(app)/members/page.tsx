import Link from "next/link";
import { Suspense } from "react";
import { apiFetch } from "@/lib/api";
import type { ApiCollection, User } from "@/lib/api/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = process.env.API_URL ?? "http://localhost:3000";
const FETCH_LIMIT = 500;
const MEMBERS_REVALIDATE_SECONDS = 300;

type RoleKey = "admin" | "moderator" | "regular";

const ROLE_SECTIONS: { key: RoleKey; title: string; accent: string }[] = [
  {
    key: "regular",
    title: "Regulars",
    accent: "text-blue-300",
  },
  {
    key: "moderator",
    title: "Moderators",
    accent: "text-orange-300",
  },
  {
    key: "admin",
    title: "Admins",
    accent: "text-red-300",
  },
];

function highestRole(user: User): RoleKey | null {
  if (user.role_admin) return "admin";
  if (user.role_moderator) return "moderator";
  if (user.role_regular) return "regular";
  return null;
}

function displayName(user: User): string {
  return user.global_name ?? user.username ?? user.user_id;
}

export default async function MembersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Members</h1>
      </div>

      <Suspense fallback={<MembersSkeleton />}>
        <MembersList />
      </Suspense>
    </div>
  );
}

async function MembersList() {
  let users: User[] = [];

  try {
    const res = await apiFetch(`/api/v1/users?limit=${FETCH_LIMIT}`, {
      next: { revalidate: MEMBERS_REVALIDATE_SECONDS, tags: ["members"] },
    });
    if (res.ok) {
      const body: ApiCollection<User> = await res.json();
      users = body.data;
    }
  } catch {
    // render empty state
  }

  const buckets: Record<RoleKey, User[]> = {
    admin: [],
    moderator: [],
    regular: [],
  };

  for (const user of users) {
    if (user.is_bot) continue;
    if (user.server_left_at) continue;
    const role = highestRole(user);
    if (!role) continue;
    buckets[role].push(user);
  }

  const totalShown =
    buckets.admin.length + buckets.moderator.length + buckets.regular.length;
  if (totalShown === 0) {
    return <p className="text-muted-foreground">No members found.</p>;
  }

  return (
    <div className="space-y-10">
      {ROLE_SECTIONS.map((section) => {
        const sectionUsers = buckets[section.key];
        if (sectionUsers.length === 0) return null;
        return (
          <section key={section.key} className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h2 className={`text-lg font-semibold ${section.accent}`}>
                {section.title}
              </h2>
              <span className="text-sm text-muted-foreground">
                {sectionUsers.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {sectionUsers.map((user) => (
                <MemberCard key={user.user_id} user={user} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function MemberCard({ user }: { user: User }) {
  const name = displayName(user);
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <Link
      href={`/members/${user.user_id}`}
      className="group flex flex-col items-center gap-2 rounded-lg border bg-card p-3 text-center transition-colors hover:bg-muted/40"
    >
      <Avatar
        size="lg"
        className="size-16 transition-transform group-hover:scale-105"
      >
        <AvatarImage
          src={`${API_BASE}/api/v1/users/${user.user_id}/avatar`}
          alt={name}
        />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <p className="w-full truncate text-sm font-medium leading-tight">
        {name}
      </p>
    </Link>
  );
}

function MembersSkeleton() {
  return (
    <div className="space-y-10">
      {ROLE_SECTIONS.map((section) => (
        <section key={section.key} className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 rounded-lg border p-3"
              >
                <Skeleton className="size-16 rounded-full" />
                <Skeleton className="h-3.5 w-3/4" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
