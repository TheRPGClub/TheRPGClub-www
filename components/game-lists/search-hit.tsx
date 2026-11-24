import { Search } from "lucide-react";

// Where the searched game sits in a list: "Final Fantasy VI is No. 2 of 10"
// on a ranked list, "Final Fantasy VI is on it" otherwise.
export interface ListHit {
  title: string;
  // Set on a ranked list.
  place: number | null;
  of: number;
}

export function SearchHit({ hit }: { hit: ListHit }) {
  return (
    <p className="font-label mt-2 inline-flex flex-wrap items-center gap-1.5 text-[0.8rem] font-bold tracking-[0.07em] text-foreground">
      <Search aria-hidden className="size-3.5 text-faint-foreground" />
      {hit.title} is{" "}
      {hit.place !== null ? (
        <em className="font-headline text-lg leading-none text-highlight not-italic">
          No. {hit.place} of {hit.of}
        </em>
      ) : (
        "on it"
      )}
    </p>
  );
}
