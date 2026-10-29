import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MemberAvatar } from "@/components/issue/member-cover";

// Two members' completed games drawn as two rings: each ring's number is the
// games only that member has finished, the paper lens between them the games
// both have. Counts are distinct games across each member's whole history.

interface Side {
  id: string;
  name: string;
  only: number;
  href: string;
}

export function CompareVenn({
  left,
  right,
  both,
}: {
  left: Side;
  right: Side;
  both: number;
}) {
  return (
    <section
      aria-label={`Overlap between ${left.name} and ${right.name}`}
      className="py-2"
    >
      <div className="relative mx-auto aspect-[560/300] w-full max-w-[35rem]">
        <Ring side={left} align="left" />
        <Ring side={right} align="right" />
        <div className="absolute top-1/2 left-1/2 grid h-[87.3%] w-1/4 -translate-x-1/2 -translate-y-1/2 place-items-center text-center">
          <svg
            viewBox="0 0 140 262"
            aria-hidden
            className="absolute inset-0 size-full"
          >
            <path
              d="M70 0 A150 150 0 0 1 70 262 A150 150 0 0 1 70 0 Z"
              className="fill-paper"
            />
          </svg>
          <p className="relative text-ink">
            <b className="font-headline block text-[3rem] leading-[0.85] font-normal sm:text-[4.75rem]">
              {both}
            </b>
            <span className="font-label mt-1.5 block text-[0.7rem] leading-[1.15] font-extrabold tracking-[0.08em] sm:text-[0.8rem]">
              Both
              <br />
              finished
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

function Ring({ side, align }: { side: Side; align: "left" | "right" }) {
  const right = align === "right";
  return (
    <div
      className={
        "absolute top-0 flex aspect-square h-full flex-col justify-center rounded-full shadow-[inset_0_0_0_2px_var(--color-paper-dim)] " +
        (right
          ? "right-0 items-end pr-[7.5%] text-right"
          : "left-0 items-start pl-[7.5%]")
      }
    >
      <p
        className={
          "font-headline mb-1.5 flex max-w-[60%] items-center gap-2 text-lg sm:mb-3 sm:text-[1.65rem] " +
          (right ? "flex-row-reverse" : "")
        }
      >
        <MemberAvatar
          userId={side.id}
          name={side.name}
          className="size-6 shrink-0 sm:size-8.5"
          fallbackClassName="text-sm sm:text-xl"
        />
        <span className="line-clamp-2 leading-[0.95] break-words">{side.name}</span>
      </p>
      <p className="font-headline text-[2.5rem] leading-[0.85] sm:text-[4rem]">
        {side.only}
      </p>
      <p className="font-label mt-1.5 max-w-[60%] truncate text-[0.7rem] font-extrabold tracking-[0.08em] text-paper-mute sm:text-[0.8rem]">
        Only {side.name}
      </p>
      <Link
        href={side.href}
        className="font-label mt-2.5 hidden max-w-[60%] items-center gap-1 text-[0.8rem] font-extrabold tracking-[0.08em] text-paper-dim transition-colors hover:text-highlight sm:inline-flex [&_svg]:size-3.5"
      >
        <span className="truncate">Completed list</span>
        <ArrowRight aria-hidden className="shrink-0" />
        <span className="sr-only">: {side.name}</span>
      </Link>
    </div>
  );
}
