import Link from "next/link";

interface GotmCardProps {
  label: string;
  title: string;
  artUrl: string | null;
  coverUrl: string | null;
  year: number | null;
  description: string | null | undefined;
  imageAlign?: "left" | "right";
  href?: string;
  className?: string;
}

export function GotmCard({
  label,
  title,
  artUrl,
  coverUrl,
  year,
  description,
  imageAlign = "right",
  href,
  className: extraClassName,
}: GotmCardProps) {
  const left = imageAlign === "left";
  const imageUrl = artUrl ?? coverUrl;
  const className = `group relative overflow-hidden rounded-xl border bg-card min-h-56 flex items-center${extraClassName ? ` ${extraClassName}` : ""}`;
  const content = (
    <>
      {imageUrl && (
        <div
          className={`absolute top-0 h-full w-[70%] overflow-hidden ${left ? "left-0" : "right-0"}`}
        >
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
        className={`relative p-6 space-y-1 max-w-[45%] sm:max-w-[30%] ${left ? "ml-auto text-right" : ""}`}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <h1 className={`font-bold tracking-tight line-clamp-5 ${title.length > 30 ? "text-lg" : title.length > 20 ? "text-xl" : "text-2xl"}`}>
          {title}
        </h1>
        {year && (
          <p className={`text-sm text-muted-foreground${left ? " text-right" : ""}`}>
            {year}
          </p>
        )}
        {description && (
          <p className="text-sm text-muted-foreground pt-1 line-clamp-5">
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

  return <div className={className}>{content}</div>;
}

export function gotmCardProps(
  game: {
    title?: string | null;
    cover_url?: string | null;
    art_url?: string | null;
    initial_release_date?: string | null;
    description?: string | null;
  } | null,
  fallbackTitle: string,
) {
  const year = game?.initial_release_date
    ? new Date(game.initial_release_date).getFullYear()
    : null;

  return {
    title: game?.title ?? fallbackTitle,
    coverUrl: game?.cover_url ?? null,
    artUrl: game?.art_url ?? null,
    year,
    description: game?.description ?? null,
  };
}
