import { cn } from "@/lib/utils";

// The review's story as it is written: set exactly as the review page sets it
// (components/rich-text/static-elements.tsx, the article voice), so what the
// writer sees is what the reader gets. Paragraphs in Barlow at 1.06rem / 1.75,
// headings in condensed caps, a quote as the Anton pull quote between paper
// rules. Only the spoiler differs: it stays readable while written, marked
// with a yellow highlighter stroke and a pencilled "spoiler" above it.
//
// Descendant selectors, as the Codex's manuscript sheet does, so the shared
// editor's own elements stay as they are everywhere else.
export const REVIEW_STORY = cn(
  "max-w-[68ch] text-[1.06rem] leading-[1.75] text-foreground/90 caret-highlight outline-none",
  "[&_strong]:text-foreground [&_p]:mt-[1em] [&_p:first-child]:mt-0",
  "[&_[data-slate-placeholder]]:text-faint-foreground [&_[data-slate-placeholder]]:opacity-100",
  // Headings: the published article's sizes and rhythm.
  "[&_:is(h1,h2,h3)]:font-label [&_:is(h1,h2,h3)]:leading-[1.1] [&_:is(h1,h2,h3)]:font-extrabold [&_:is(h1,h2,h3)]:tracking-[0.02em] [&_:is(h1,h2,h3)]:text-foreground",
  "[&_:is(h1,h2)]:mt-[1.6em] [&_:is(h1,h2)]:mb-[0.5em] [&_h3]:mt-[1.5em] [&_h3]:mb-[0.4em] [&_:is(h1,h2,h3):first-child]:mt-0",
  "[&_h1]:text-[1.75rem] [&_h2]:text-[1.55rem] [&_h3]:text-[1.25rem]",
  // The pull quote.
  "[&_blockquote]:font-headline [&_blockquote]:my-[1.4em] [&_blockquote]:border-x-0 [&_blockquote]:border-y-2 [&_blockquote]:border-foreground [&_blockquote]:py-4 [&_blockquote]:pl-0 [&_blockquote]:text-[2rem] [&_blockquote]:leading-[1.02] [&_blockquote]:text-foreground [&_blockquote]:not-italic",
  "[&_:is(ul,ol)]:my-[0.8em] [&_li]:marker:text-faint-foreground",
  "[&_a]:text-foreground [&_a]:decoration-faint-foreground/60 [&_a:hover]:text-highlight [&_a:hover]:decoration-highlight",
  // The spoiler, readable while written.
  "[&_[data-spoiler]]:relative [&_[data-spoiler]]:rounded-none [&_[data-spoiler]]:bg-[linear-gradient(transparent_55%,rgb(255_212_0/0.22)_55%)] [&_[data-spoiler]]:no-underline",
  "[&_[data-spoiler]]:after:absolute [&_[data-spoiler]]:after:-top-3.5 [&_[data-spoiler]]:after:right-0 [&_[data-spoiler]]:after:text-[0.75rem] [&_[data-spoiler]]:after:leading-none [&_[data-spoiler]]:after:font-semibold [&_[data-spoiler]]:after:text-highlight [&_[data-spoiler]]:after:italic [&_[data-spoiler]]:after:content-['spoiler']",
);
