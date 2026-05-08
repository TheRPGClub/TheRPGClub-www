import Link from "next/link";
import { Star } from "lucide-react";

interface GotmCardProps {
  label: string;
  title: string;
  artUrl: string | null;
  coverUrl: string | null;
  year: number | null;
  rating: number | null;
  description: string | null | undefined;
  imageAlign?: "left" | "right";
  href?: string;
}

export function GotmCard({
  label,
  title,
  artUrl,
  coverUrl,
  year,
  rating,
  description,
  imageAlign = "right",
  href,
}: GotmCardProps) {
  const left = imageAlign === "left";
  const imageUrl = artUrl ?? coverUrl;
  const className = "group relative overflow-hidden rounded-xl border bg-card min-h-56 block";
  const content = (
    <>
      {imageUrl && (
        <div className={`absolute top-0 h-full w-[70%] overflow-hidden ${left ? "left-0" : "right-0"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-[center_20%] transition-transform group-hover:scale-105"
          />
          <div
            className={`absolute inset-0 ${left ? "bg-linear-to-l" : "bg-linear-to-r"} from-card to-transparent`}
          />
        </div>
      )}
      <div
        className={`relative p-6 space-y-1 max-w-[30%] ${left ? "ml-auto" : ""}`}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {year && <span>{year}</span>}
          {rating && (
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-current" />
              {rating}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground pt-1 text-justify">
            {description}
          </p>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}

export function gotmCardProps(
  game: {
    title?: string | null;
    cover_url?: string | null;
    art_url?: string | null;
    initial_release_date?: string | null;
    total_rating?: number | string | null;
    description?: string | null;
  } | null,
  fallbackTitle: string,
) {
  const coverUrl = game?.cover_url;
  const artUrl = game?.art_url;
  const year = game?.initial_release_date
    ? new Date(game.initial_release_date).getFullYear()
    : null;
  const rating = game?.total_rating
    ? Math.round(Number(game.total_rating))
    : null;

  return {
    title: game?.title ?? fallbackTitle,
    coverUrl: coverUrl ?? null,
    artUrl: artUrl ?? null,
    year,
    rating,
    description: game?.description ?? null,
  };
}
