import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { NoticeSlip } from "@/components/issue/notice-slip";
import { cn } from "@/lib/utils";

// The front page's answer to /?error=auth_failed, where the API sends every
// failed Discord sign-in: a notice slip with Try again (sign-in from the
// start) and a dismiss that drops the error from the address.

export function SignInFailedSlip({
  signInHref,
  className,
}: {
  signInHref: string;
  // Placement only.
  className?: string;
}) {
  return (
    <NoticeSlip
      role="alert"
      title="Sign-in didn't go through."
      dismissHref="/"
      className={cn("w-full max-w-[23rem]", className)}
      action={
        <a
          href={signInHref}
          className={cn(buttonVariants({ variant: "inverse", size: "lg" }), "h-11 max-sm:w-full")}
        >
          Try again
          <ArrowRight data-icon="inline-end" />
        </a>
      }
    >
      It&apos;s usually a hiccup on the way back from Discord. Try again; if it keeps happening, let
      the staff know.
    </NoticeSlip>
  );
}
