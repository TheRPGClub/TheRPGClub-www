import type { UserSocial } from "@/lib/api/types";
import { SocialIcon } from "@/components/social-icon";

// The member's socials under their name: a link when the social has a URL,
// plain text otherwise.
export function BannerSocials({ socials }: { socials: UserSocial[] }) {
  return (
    <ul
      aria-label="Socials"
      className="mt-4 flex flex-wrap gap-x-4.5 gap-y-1.5"
    >
      {socials.map((social) => {
        const label = social.social_platform?.label ?? "Link";
        const body = (
          <>
            <SocialIcon
              label={social.social_platform?.label}
              width="15"
              height="15"
              className="shrink-0 text-faint-foreground"
            />
            <b className="font-label text-xs font-extrabold tracking-[0.1em] text-faint-foreground">
              {label}
            </b>
            <span className="break-all">{social.display_text}</span>
          </>
        );
        return (
          <li key={social.id}>
            {social.url ? (
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-dim-foreground transition-colors hover:text-highlight"
              >
                {body}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-dim-foreground">
                {body}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
