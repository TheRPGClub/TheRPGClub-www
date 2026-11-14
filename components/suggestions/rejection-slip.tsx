import type { CSSProperties } from "react";

// The reason a Superadmin gave, typed on a paper slip taped to the card.
export function RejectionSlip({
  reason,
  reviewerName,
  tilt,
}: {
  reason: string;
  reviewerName?: string | null;
  tilt: number;
}) {
  return (
    <div
      style={{ "--slip": `${tilt}deg` } as CSSProperties}
      className="relative mx-4 mt-1 ml-8 rotate-(--slip) rounded-xs bg-foreground px-3.5 pt-2.5 pb-3 text-background shadow-[0_6px_14px_rgb(0_0_0/0.45)] before:absolute before:-top-[7px] before:left-1/2 before:-ml-[27px] before:h-3.5 before:w-[54px] before:-rotate-3 before:bg-foreground/35"
    >
      <p className="font-label flex justify-between gap-3 text-[0.74rem] font-extrabold text-[#8a1559]">
        Reason
        {reviewerName && (
          <span className="font-bold text-[#55554f]">
            {reviewerName}
          </span>
        )}
      </p>
      <p className="mt-0.5 text-[0.95rem] leading-snug break-words whitespace-pre-line italic">
        {reason}
      </p>
    </div>
  );
}
