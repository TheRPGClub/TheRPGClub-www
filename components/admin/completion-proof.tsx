import type { CompletionAnnouncement } from "@/lib/completions";
import { cn } from "@/lib/utils";

// The proof of the bot's completion post in Whatcha Playing: the Components
// V2 container it sends, the member's name as the heading, the line of
// details, and the game's cover as the thumbnail. Dimmed with a note when
// the form will not announce.
export function CompletionProof({
  announcement,
  title,
  coverUrl,
  muted,
}: {
  // Null until a member and a game are picked.
  announcement: CompletionAnnouncement | null;
  title: string | null;
  coverUrl: string | null;
  muted?: boolean;
}) {
  return (
    <div className={cn("bg-ink-2 p-5 transition-opacity sm:p-6", muted && "opacity-45")}>
      <p className="font-label text-[0.85rem] tracking-[0.08em] text-paper-dim">
        Completion post · Whatcha Playing
      </p>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-md border border-rule-strong bg-ink p-4">
        {announcement && title ? (
          <div className="min-w-0 space-y-3">
            <p className="font-headline text-[2rem] leading-[0.95] break-words sm:text-[2.4rem]">
              {announcement.heading}
            </p>
            <p className="text-[0.95rem] leading-[1.45] text-paper-dim">
              {announcement.lead} <b className="font-semibold text-paper">{title}</b>
              {" - "}
              {announcement.details}
              <br />
              {announcement.yearly}
            </p>
          </div>
        ) : (
          <div className="min-w-0 space-y-3" aria-hidden>
            <p className="font-headline text-[2rem] leading-[0.95] text-paper-mute sm:text-[2.4rem]">
              Member
            </p>
            <p className="text-[0.95rem] text-paper-mute">
              Pick a member and a game to see the post.
            </p>
          </div>
        )}
        <div className="h-[6.5rem] w-[5rem] overflow-hidden rounded-[3px] bg-ink-3">
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="size-full object-cover" />
          )}
        </div>
      </div>
    </div>
  );
}
