import { LandingPitch } from "@/components/issue/landing-pitch";
import { TrackPlate } from "@/components/issue/track-plate";

// Without winners to put on the cover: the pitch beside the two tracks as
// flat colour plates that describe them.
export function FlatHero({
  signInHref,
  notice,
}: {
  signInHref: string;
  // The sign-in-failed slip, pinned to the track plates.
  notice: React.ReactNode;
}) {
  return (
    <section className="grid gap-10 px-4 pt-24 pb-12 sm:px-10 sm:pt-28 sm:pb-16 lg:min-h-[52rem] lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-end lg:gap-14">
      <LandingPitch signInHref={signInHref} />
      <div className="grid gap-2.5">
        {notice}
        <TrackPlate kind="gotm" />
        <TrackPlate kind="nr_gotm" />
      </div>
    </section>
  );
}
