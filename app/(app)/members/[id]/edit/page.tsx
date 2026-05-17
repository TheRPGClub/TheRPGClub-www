import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type {
  ApiCollection,
  ApiSingle,
  SocialPlatform,
  User,
} from "@/lib/api/types";
import { SocialsEditor } from "@/components/socials-editor";

async function loadPlatforms(): Promise<SocialPlatform[]> {
  try {
    const res = await apiFetch("/api/v1/social_platforms", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const body: ApiCollection<SocialPlatform> = await res.json();
    return body.data;
  } catch {
    return [];
  }
}

export default async function MemberEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session) redirect("/");
  if (session.principal.discord_id !== id) {
    redirect(`/members/${id}`);
  }

  const [userRes, platforms] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    loadPlatforms(),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = user.global_name ?? user.username ?? user.user_id;

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
        <Link
          href={`/members/${user.user_id}`}
          className="hover:text-foreground transition-colors"
        >
          {displayName}
        </Link>
        <span>›</span>
        <span className="text-foreground">Edit</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Edit profile</h1>
        <Link
          href={`/members/${user.user_id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to profile
        </Link>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <SocialsEditor
          userId={user.user_id}
          socials={user.socials ?? []}
          platforms={platforms}
        />
      </div>
    </div>
  );
}
