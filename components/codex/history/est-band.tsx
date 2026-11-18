import { ArrowRight } from "lucide-react";
import { HISTORY_PATH } from "@/lib/codex/paths";
import { ButtonLink } from "@/components/ui/button";

// The front page's Club History band (2B "Front page"): the year of the
// earliest History Event set big in Founding rose, two plain sentences and
// the way into the Club History. The sentences are fixed copy; staff
// update them here by hand.
export function EstBand({ year }: { year: number }) {
  return (
    <section aria-label="Club History" className="px-4 pt-4.5 pb-12 sm:px-10 sm:pb-16">
      <div className="grid gap-x-9 gap-y-4 border-t-2 border-foreground pt-4.5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end">
        <p className="font-headline text-[6.5rem] leading-[0.78] text-kind-founding sm:text-[10.5rem]">{year}</p>
        <div>
          <p className="mb-4 max-w-[42ch] text-[1.125rem] leading-[1.4] sm:text-[1.25rem]">
            The club started as a subreddit in 2016 and moved to Discord in March 2018. Ten years, one game a month, and a
            lot of stories.
          </p>
          <ButtonLink href={HISTORY_PATH} variant="outline" className="max-sm:w-full">
            Read the Club History
            <ArrowRight data-icon="inline-end" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
