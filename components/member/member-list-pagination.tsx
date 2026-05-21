import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface MemberListPaginationProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function MemberListPagination({
  currentPage,
  totalPages,
  buildHref,
}: MemberListPaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <Pagination>
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious href={buildHref(currentPage - 1)} />
          </PaginationItem>
        )}
        {pageWindows(currentPage, totalPages).map((entry, i) =>
          entry === null ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <PaginationLink
                href={buildHref(entry)}
                isActive={entry === currentPage}
              >
                {entry}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext href={buildHref(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}

function pageWindows(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | null)[] = [1];
  if (current > 3) pages.push(null);
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push(null);
  pages.push(total);
  return pages;
}
