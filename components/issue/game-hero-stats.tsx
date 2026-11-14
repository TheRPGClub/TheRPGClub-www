// The club's numbers for a game, at the foot of its cover story, and its
// release date on a wide screen.

export interface GameHeroStat {
  label: string;
  value: number;
}

export function GameHeroStats({
  stats,
  releaseDate,
}: {
  stats: GameHeroStat[];
  releaseDate: string | null;
}) {
  return (
    <dl className="col-start-2 row-start-1 flex items-end gap-4 self-end md:col-start-3 md:gap-7 md:pb-1.5">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col-reverse md:text-right">
          <dt className="font-label text-[0.75rem] font-extrabold tracking-[0.08em] text-dim-foreground md:text-[0.82rem]">
            {stat.label}
          </dt>
          <dd className="font-headline text-[2.5rem] leading-[0.9] md:text-[3.75rem]">
            {stat.value}
          </dd>
        </div>
      ))}
      {releaseDate && (
        <div className="hidden flex-col-reverse text-right lg:flex">
          <dt className="font-label text-[0.82rem] font-extrabold tracking-[0.08em] text-dim-foreground">
            Released
          </dt>
          <dd className="font-headline mb-0.5 text-[1.9rem] leading-none">
            {releaseDate}
          </dd>
        </div>
      )}
    </dl>
  );
}
