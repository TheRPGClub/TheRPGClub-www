// A History Event's photo pinned up beside its chapter (2B): on a paper
// mount, tilted, a paper pin at the top centre ringed in the muted ink.
export function PinnedMount({ url, alt, tilt }: { url: string; alt: string; tilt: number }) {
  return (
    <figure
      style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
      className="relative w-[60%] shrink-0 rotate-[calc(var(--tilt)/2)] rounded-[2px] bg-foreground px-2 pt-2 pb-2.5 shadow-[0_12px_30px_rgb(0_0_0/0.5)] before:absolute before:-top-1.5 before:left-1/2 before:z-10 before:size-3 before:-translate-x-1/2 before:rounded-full before:bg-foreground before:shadow-[inset_0_0_0_3px_var(--color-muted),0_3px_6px_rgb(0_0_0/0.45)] before:content-[''] lg:w-full lg:rotate-(--tilt)"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- an uploaded image on the club's image store, which next/image isn't configured for */}
      <img src={url} alt={alt} loading="lazy" className="block aspect-[4/3] w-full rounded-[1px] bg-muted object-cover" />
    </figure>
  );
}
