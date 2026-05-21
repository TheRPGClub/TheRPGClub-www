import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type {
  ApiCollection,
  ApiSingle,
  Game,
  Review,
} from "@/lib/api/types";
import { GameReviewsList } from "@/components/member/game-reviews-list";
import { MemberListPagination } from "@/components/member/member-list-pagination";

const PAGE_SIZE = 10;

export default async function GameReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page = "1" }] = await Promise.all([params, searchParams]);
  const gameId = parseInt(id, 10);
  if (isNaN(gameId)) notFound();

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [gameRes, session, listRes] = await Promise.all([
    apiFetch(`/api/v1/games/${gameId}`, { cache: "no-store" }),
    getSession(),
    apiFetch(
      `/api/v1/games/${gameId}/reviews?limit=${PAGE_SIZE}&offset=${offset}`,
      { cache: "no-store" },
    ),
  ]);

  if (!gameRes.ok) notFound();
  const { data: game }: ApiSingle<Game> = await gameRes.json();

  let reviews: Review[] = [];
  let total = 0;
  if (listRes.ok) {
    const body: ApiCollection<Review> = await listRes.json();
    reviews = body.data;
    total = body.meta.total ?? reviews.length;
  }
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) =>
    `/games/${gameId}/reviews${p > 1 ? `?page=${p}` : ""}`;

  const ownerId = session?.principal.discord_id ?? null;
  const canWriteReview = !!(
    ownerId &&
    ((game.now_playing ?? []).some((e) => e.user_id === ownerId) ||
      (game.completions ?? []).some((e) => e.user_id === ownerId))
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/games" className="hover:text-foreground transition-colors">
          Games
        </Link>
        <span>›</span>
        <Link
          href={`/games/${game.game_id}`}
          className="hover:text-foreground transition-colors"
        >
          {game.title}
        </Link>
        <span>›</span>
        <span className="text-foreground">Reviews</span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        <span className="text-sm text-muted-foreground tabular-nums">{total}</span>
      </div>

      <GameReviewsList
        gameId={gameId}
        reviews={reviews}
        ownerId={ownerId}
        canWriteReview={canWriteReview}
      />

      <MemberListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={href}
      />
    </div>
  );
}
