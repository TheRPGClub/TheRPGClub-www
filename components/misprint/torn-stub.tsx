import bodyMask from "./torn-edge-body.png";
import lipMask from "./torn-edge-lip.png";

// The stub left in the gutter where a page was torn out of the issue. The
// tear's shape is two raster masks (the paper's edge and its fibrous lip,
// both tiling down the page); its colours are the Theme's tokens, so the
// shape belongs to the page and the paper to the Theme. A Theme with no
// torn paper draws the stub its own way by its slot (torn-stub) and drops
// the tear (torn-stub-lip, torn-stub-body, torn-stub-stitch).
const mask = (src: string) => ({
  maskImage: `url(${src})`,
  WebkitMaskImage: `url(${src})`,
  maskSize: "80px 1024px",
  WebkitMaskSize: "80px 1024px",
  maskRepeat: "repeat-y",
  WebkitMaskRepeat: "repeat-y",
});

export function TornStub() {
  return (
    <div aria-hidden data-slot="torn-stub" className="pointer-events-none relative w-10 shrink-0 sm:w-20">
      <div data-slot="torn-stub-lip" className="absolute inset-0 bg-border-strong" style={mask(lipMask.src)} />
      <div data-slot="torn-stub-body" className="absolute inset-0 bg-card" style={mask(bodyMask.src)} />
      {/* The binding's stitch line, a little in from the spine. */}
      <div data-slot="torn-stub-stitch" className="absolute inset-y-0 left-3 border-l-2 border-dotted border-border-strong sm:left-4.5" />
    </div>
  );
}
