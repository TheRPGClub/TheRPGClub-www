import { ArrowLeft, ArrowRight } from "lucide-react";
import { JournalFolio } from "@/components/journal/journal-book";
import { ButtonLink } from "@/components/ui/button";

// A chapter's page foot when it runs to more than one page: the page number,
// the page count and the turns to newer and older entries.
export function JournalPager({
  page,
  pages,
  pageHref,
}: {
  page: number;
  pages: number;
  pageHref: (page: number) => string;
}) {
  return (
    <JournalFolio
      page={page}
      className="pt-4"
      action={
        <>
          {page > 1 && (
            <ButtonLink
              href={pageHref(page - 1)}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft aria-hidden />
              Newer entries
            </ButtonLink>
          )}
          {page < pages && (
            <ButtonLink
              href={pageHref(page + 1)}
              variant="ghost"
              size="sm"
            >
              Older entries
              <ArrowRight aria-hidden />
            </ButtonLink>
          )}
        </>
      }
    >
      <span>of {pages} pages</span>
    </JournalFolio>
  );
}
