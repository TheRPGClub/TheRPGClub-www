import { Link2 } from "lucide-react";
import { linkedAccountsEditHref } from "@/lib/achievements";
import { ButtonLink } from "@/components/ui/button";

// A note on the binder's right page (a failed read, an empty index), and
// the member's own call to link a first account.

export function BinderNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 rounded-sm border border-dashed border-border-strong px-4 py-6 text-sm text-faint-foreground">
      {children}
    </p>
  );
}

export function LinkAccountCta({ userId }: { userId: string }) {
  return (
    <div data-slot="binder-cta" className="flex flex-col items-start gap-4 rounded-md border border-dashed border-border-strong px-5 py-8 sm:px-7">
      <p className="font-headline text-3xl text-foreground sm:text-4xl">
        No Linked Accounts yet
      </p>
      <p className="max-w-[52ch] text-dim-foreground">
        Link your RetroAchievements, Steam or PSN account and the club mirrors
        your achievements here and on your profile. Only you see this page
        until you do.
      </p>
      <ButtonLink
        href={linkedAccountsEditHref(userId)}
        variant="highlight"
      >
        <Link2 data-icon="inline-start" /> Link an account
      </ButtonLink>
    </div>
  );
}
