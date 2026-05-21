import { notFound } from "next/navigation";
import { Boxes } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type {
  ApiCollection,
  ApiSingle,
  GameCollection,
  User,
} from "@/lib/api/types";
import { MemberGameCard } from "@/components/member/member-game-card";
import { MemberListShell } from "@/components/member/member-list-shell";
import { MemberListPagination } from "@/components/member/member-list-pagination";

const PAGE_SIZE = 24;

export default async function CollectedGamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page = "1" }] = await Promise.all([params, searchParams]);
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [userRes, listRes] = await Promise.all([
    apiFetch(`/api/v1/users/${id}`, { cache: "no-store" }),
    apiFetch(
      `/api/v1/users/${id}/collections?limit=${PAGE_SIZE}&offset=${offset}`,
      { cache: "no-store" },
    ),
  ]);

  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = user.global_name ?? user.username ?? id;

  let entries: GameCollection[] = [];
  let total = 0;
  if (listRes.ok) {
    const body: ApiCollection<GameCollection> = await listRes.json();
    entries = body.data;
    total = body.meta.total ?? entries.length;
  }
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) =>
    `/members/${id}/collected-games${p > 1 ? `?page=${p}` : ""}`;

  return (
    <MemberListShell
      userId={id}
      displayName={displayName}
      title="Collection"
      count={total}
    >
      {entries.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          No owned games tracked yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {entries.map((entry) => (
            <MemberGameCard
              key={entry.entry_id}
              game={entry.game}
              platform={entry.platform}
              note={entry.note}
              meta={
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Boxes className="size-3" />
                  {entry.ownership_type ? ` ${entry.ownership_type}` : " Owned"}
                </span>
              }
            />
          ))}
        </div>
      )}

      <MemberListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={href}
      />
    </MemberListShell>
  );
}
