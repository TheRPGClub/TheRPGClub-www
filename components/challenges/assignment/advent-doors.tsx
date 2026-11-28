import type { Door } from "@/lib/challenges/edition";
import { AdventDoor } from "@/components/challenges/assignment/advent-door";

// The Edition's doors (surface brief challenges-assignment, 4A): six across
// where the column allows (three on phones), one per member in sign-up order, opening as the Edition
// moves on. While the viewer can still join, the last door is theirs in
// yellow: "Your door: sign up" (the Sign up button sits in the side panel).
export function AdventDoors({ doors, yourSeat, label }: { doors: Door[]; yourSeat: boolean; label: string }) {
  if (doors.length === 0 && !yourSeat) {
    return (
      <p className="grid min-h-40 place-items-center rounded-sm border border-dashed border-border-strong px-6 text-center text-dim-foreground">
        Nobody has signed up yet.
      </p>
    );
  }
  return (
    <div className="@container self-start">
      <ol
        aria-label={label}
        data-slot="advent-doors"
        className="grid grid-cols-3 gap-2 @md:grid-cols-4 @md:gap-2.5 @[34rem]:grid-cols-5 @[40rem]:grid-cols-6"
      >
        {doors.map((door) => (
          <AdventDoor key={door.key} door={door} />
        ))}
        {yourSeat && (
          <li data-slot="advent-door" data-variant="your-seat" className="flex aspect-[3/4] flex-col justify-between rounded-sm bg-highlight p-2.5 text-highlight-foreground shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-highlight)_35%,transparent)]">
            <span className="font-headline text-[1.875rem] leading-[0.9]">{doors.length + 1}</span>
            <span className="font-label text-[0.84rem] leading-[1.15] font-bold tracking-[0.06em]">
              Your door: sign up
            </span>
          </li>
        )}
      </ol>
    </div>
  );
}
