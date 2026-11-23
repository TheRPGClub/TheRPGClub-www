import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// A nested page's way back to its parent, set small above the page's title
// (www#164; the app has no top bar or trail): the arrow and the parent's
// name in label caps, the arrow alone on phones. Its accessible name says
// where it goes either way. Top-level pages have none. `onArt` is for one
// laid on a key-art banner.
//
// It sits above the title that follows it (relative z-10): an Anton title
// set tighter than its font's ascent (DeskHeader's leading-[0.85]) has a
// glyph box reaching up over the link, and as the later sibling it would
// take the click.
export function BackLink({
  href,
  label,
  onArt = false,
  className,
}: {
  href: string;
  // The parent page's name, as its own heading reads ("Staff desk").
  label: string;
  onArt?: boolean;
  // Layout only: where it sits (it carries a small foot margin by default).
  className?: string;
}) {
  return (
    <ButtonLink
      href={href}
      variant={onArt ? "back-on-art" : "back"}
      size="bare"
      aria-label={`Back to ${label}`}
      title={`Back to ${label}`}
      className={cn(
        "relative z-10 mb-3 items-center gap-1.5 self-start [&_svg]:size-3.5 max-md:-ml-1.5 max-md:size-8 max-md:justify-center max-md:[&_svg]:size-5",
        className,
      )}
    >
      <ArrowLeft aria-hidden />
      <span className="max-md:hidden">{label}</span>
    </ButtonLink>
  );
}
