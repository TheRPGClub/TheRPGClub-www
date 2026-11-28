// A History Event's photo pinned up beside its chapter (2B): on a paper
// mount, tilted, a paper pin at the top centre ringed in the muted ink.
export function PinnedMount({ url, alt, tilt }: { url: string; alt: string; tilt: number }) {
  return (
    <figure
      data-slot="pinned-mount"
      style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
      className="relative w-[60%] shrink-0 rounded-[2px] bg-foreground px-2 pt-2 pb-2.5 lg:w-full"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- an uploaded image on the club's image store, which next/image isn't configured for */}
      <img src={url} alt={alt} loading="lazy" className="block aspect-[4/3] w-full rounded-[1px] bg-muted object-cover" />
    </figure>
  );
}
