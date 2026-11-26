import { ArrowUpRight } from "lucide-react";
import { splitLastWord } from "@/lib/news";
import { cn } from "@/lib/utils";

// A headline that opens the outside page in a new tab, says so to screen
// readers, and keeps its up-right arrow on the last word's line. Without an
// address (an image-only News Item) it is plain text.

export const OUTBOUND_LINK =
  "rounded-xs transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight";

export function OutboundHeadline({
  text,
  href,
  className,
}: {
  text: string;
  href: string | null;
  className?: string;
}) {
  if (!href) return <span className={className}>{text}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(OUTBOUND_LINK, className)}>
      <Arrowed text={text} />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function Arrowed({ text }: { text: string }) {
  const [head, last] = splitLastWord(text);
  const arrow = (
    <ArrowUpRight aria-hidden className="ml-0.5 inline size-[0.8em] -translate-y-px align-baseline opacity-60" />
  );
  // A long last word (a bare address) stays free to wrap.
  if (last.length > 24) {
    return (
      <>
        {text}
        {arrow}
      </>
    );
  }
  return (
    <>
      {head}
      <span className="whitespace-nowrap">
        {last}
        {arrow}
      </span>
    </>
  );
}
