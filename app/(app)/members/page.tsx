import Link from "next/link";
import { Suspense } from "react";
import { apiFetch } from "@/lib/api";
import { MEMBERS_REVALIDATE_SECONDS } from "@/lib/api/members";
import type { ApiCollection, User } from "@/lib/api/types";
import { firstParam, type RawSearchParams } from "@/lib/search-params";
import { PageHeader } from "@/components/issue/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// The club's contributor wall: every current member with a club role as a
// square portrait, staff first and banded with their role. A switch narrows
// the wall to staff or regulars.

const API_BASE = process.env.API_URL ?? "http://localhost:3000";
const FETCH_LIMIT = 500;

type RoleKey = "admin" | "moderator" | "regular";
type Show = "everyone" | "staff" | "regulars";

const ROLE_ORDER: Record<RoleKey, number> = { admin: 0, moderator: 1, regular: 2 };
const ROLE_BAND: Partial<Record<RoleKey, string>> = {
  admin: "Admin",
  moderator: "Moderator",
};

const SHOW_OPTIONS: { value: Show; label: string }[] = [
  { value: "everyone", label: "Everyone" },
  { value: "staff", label: "Staff" },
  { value: "regulars", label: "Regulars" },
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

function parseShow(value: string | undefined): Show {
  return value === "staff" || value === "regulars" ? value : "everyone";
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const show = parseShow(firstParam((await searchParams).show));

  return (
    <Suspense fallback={<MembersSkeleton />}>
      <MembersWall show={show} />
    </Suspense>
  );
}

interface Member {
  user: User;
  role: RoleKey;
}

async function fetchMembers(): Promise<Member[] | null> {
  try {
    const res = await apiFetch(`/api/v1/users?per=${FETCH_LIMIT}`, {
      next: { revalidate: MEMBERS_REVALIDATE_SECONDS, tags: ["members"] },
    });
    if (!res.ok) return null;
    const body: ApiCollection<User> = await res.json();
    const members: Member[] = [];
    for (const user of body.data) {
      if (user.is_bot || user.server_left_at) continue;
      const role = highestRole(user);
      if (role) members.push({ user, role });
    }
    // Staff first; the API's own order (by name) holds within a role.
    return members.sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);
  } catch {
    return null;
  }
}

async function MembersWall({ show }: { show: Show }) {
  const members = await fetchMembers();
  const all = members ?? [];
  const staff = all.filter((m) => m.role !== "regular");
  const regulars = all.filter((m) => m.role === "regular");
  const counts: Record<Show, number> = {
    everyone: all.length,
    staff: staff.length,
    regulars: regulars.length,
  };
  const shown =
    show === "staff" ? staff : show === "regulars" ? regulars : all;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        count={
          members
            ? `${all.length} ${all.length === 1 ? "member" : "members"}`
            : undefined
        }
      />

      {members && all.length > 0 && <ShowSwitch current={show} counts={counts} />}

      {!members ? (
        <EmptyState>Couldn&apos;t load the members. Try again in a moment.</EmptyState>
      ) : shown.length === 0 ? (
        <EmptyState>
          {all.length === 0
            ? "No members found."
            : show === "staff"
              ? "No staff to show."
              : "No regulars to show."}
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 md:grid-cols-4 xl:grid-cols-5">
          {shown.map((member) => (
            <li key={member.user.user_id}>
              <MemberTile member={member} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ShowSwitch({
  current,
  counts,
}: {
  current: Show;
  counts: Record<Show, number>;
}) {
  return (
    <nav
      aria-label="Show members"
      className="flex w-full overflow-hidden rounded-sm border border-rule-strong sm:inline-flex sm:w-auto"
    >
      {SHOW_OPTIONS.map((option) => {
        const active = option.value === current;
        return (
          <Link
            key={option.value}
            href={option.value === "everyone" ? "/members" : `/members?show=${option.value}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "font-label inline-flex h-9.5 flex-1 items-center justify-center gap-2 border-l border-rule-strong px-3.5 text-[0.92rem] font-extrabold tracking-[0.06em] whitespace-nowrap transition-colors first:border-l-0 sm:flex-none",
              active
                ? "bg-paper text-ink"
                : "text-paper-dim hover:bg-ink-3 hover:text-paper",
            )}
          >
            {option.label}
            <span
              className={cn(
                "text-[0.78rem] tabular-nums",
                active ? "text-ink/60" : "text-paper-mute",
              )}
            >
              {counts[option.value]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function MemberTile({ member }: { member: Member }) {
  const { user, role } = member;
  const name = displayName(user);
  const band = ROLE_BAND[role];

  return (
    <Link
      href={`/members/${user.user_id}`}
      className="group/tile flex flex-col overflow-hidden rounded-md border border-rule bg-ink-2 transition-colors hover:border-paper-mute"
    >
      <span className="relative block aspect-square overflow-hidden">
        <Avatar className="size-full rounded-none after:hidden">
          <AvatarImage
            src={`${API_BASE}/api/v1/users/${user.user_id}/avatar`}
            alt=""
            className="rounded-none transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/tile:scale-[1.04]"
          />
          {/* No avatar on file: the member's initial, set like a cover
              line on an ink block. */}
          <AvatarFallback className="font-headline rounded-none bg-ink-3 text-[4.5rem] text-paper-mute sm:text-[6rem]">
            {name.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {band && (
          <span
            className={cn(
              "font-label absolute inset-x-0 bottom-0 py-1.25 text-center text-[0.78rem] font-extrabold tracking-[0.12em] text-paper",
              role === "admin" ? "bg-ink" : "bg-ink/75",
            )}
          >
            {band}
          </span>
        )}
      </span>
      <span className="block min-w-0 px-3 pt-2.5 pb-3">
        <span className="font-headline block truncate text-[1.35rem] leading-none sm:text-2xl">
          {name}
        </span>
        {user.username && (
          <span className="mt-1 block truncate text-[0.8rem] text-paper-mute">
            @{user.username}
          </span>
        )}
      </span>
    </Link>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-rule-strong px-4 py-12 text-center text-paper-dim">
      {children}
    </p>
  );
}

function MembersSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader title="Members" />
      <Skeleton className="h-9.5 w-80 rounded-sm" />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 md:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-md border border-rule">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
