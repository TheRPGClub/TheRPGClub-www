import Link from "next/link";
import { ArrowRight } from "lucide-react";

const accentClasses = {
  emerald: {
    pill: "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
    number: "text-emerald-200/90",
    glow: "from-emerald-950/40 to-transparent",
    hoverBorder: "hover:border-emerald-500/40",
    cta: "text-emerald-300",
  },
  purple: {
    pill: "bg-purple-500/15 text-purple-300 ring-1 ring-inset ring-purple-500/30",
    number: "text-purple-200/90",
    glow: "from-purple-950/40 to-transparent",
    hoverBorder: "hover:border-purple-500/40",
    cta: "text-purple-300",
  },
} as const;

type Accent = keyof typeof accentClasses;

interface GotmCardProps {
  label: string;
  round: number;
  monthYear: string;
  accent: Accent;
  title: string;
  artUrl: string | null;
  coverUrl: string | null;
  year: number | null;
  description: string | null | undefined;
  imageAlign?: "left" | "right";
  compact?: boolean;
  showMeta?: boolean;
  href?: string;
  className?: string;
}

export function GotmCard({
  label,
  round,
  monthYear,
  accent,
  title,
  artUrl,
  coverUrl,
  year,
  description,
  imageAlign = "right",
  compact = false,
  showMeta = true,
  href,
  className: extraClassName,
}: GotmCardProps) {
  const left = imageAlign === "left";
  const imageUrl = artUrl ?? coverUrl;
  const accentStyle = accentClasses[accent];
  const className = `group relative overflow-hidden rounded-xl border bg-card min-h-56 flex transition-colors duration-300 ${accentStyle.hoverBorder}${extraClassName ? ` ${extraClassName}` : ""}`;
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
        className={`absolute inset-y-0 ${left ? "right-0" : "left-0"} w-[55%] ${left ? "bg-linear-to-l" : "bg-linear-to-r"} ${accentStyle.glow} pointer-events-none`}
      />
      <div
        className={`relative p-6 flex flex-col max-w-[45%] sm:max-w-[30%] ${left ? "ml-auto text-right items-end" : "items-start"}`}
      >
        {showMeta && (
          <>
            <span
              className={`inline-flex items-center whitespace-nowrap rounded-full font-semibold uppercase tracking-[0.15em] ${accentStyle.pill} ${compact ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-0.5 text-[10px]"}`}
            >
              {label}
            </span>
            {compact ? (
              <div className={`mt-3 leading-tight ${left ? "text-right" : ""}`}>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Round
                </p>
                <span
                  className={`block text-4xl font-extralight leading-none tracking-tight ${accentStyle.number}`}
                >
                  {round}
                </span>
                <p className="mt-1 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {monthYear}
                </p>
              </div>
            ) : (
              <div className={`mt-3 flex items-center gap-2 ${left ? "flex-row-reverse" : ""}`}>
                <span
                  className={`text-5xl font-extralight leading-[0.85] tracking-tight ${accentStyle.number}`}
                >
                  {round}
                </span>
                <div className={`text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground leading-tight ${left ? "text-right" : ""}`}>
                  <p>Round</p>
                  <p className="whitespace-nowrap">{monthYear}</p>
                </div>
              </div>
            )}
          </>
        )}
        <div className="flex-1 flex flex-col justify-center pt-4 w-full gap-2">
          <h1 className={`font-bold tracking-tight line-clamp-3 break-words ${compact ? (title.length > 30 ? "text-base" : title.length > 20 ? "text-lg" : "text-xl") : (title.length > 30 ? "text-xl" : title.length > 20 ? "text-2xl" : "text-3xl")}`}>
            {title}
          </h1>
          {year && (
            <span
              className={`inline-flex items-center rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground ${left ? "self-end" : "self-start"}`}
            >
              {year}
            </span>
          )}
          {description && (
            <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-4">
              {description}
            </p>
          )}
        </div>
        {href && (
          <div
            className={`mt-4 flex items-center gap-1 text-xs font-medium ${accentStyle.cta}`}
          >
            <span>View game</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
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
