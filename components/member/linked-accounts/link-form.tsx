"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2 } from "lucide-react";

import { linkAccountAction } from "@/app/actions/linked-accounts";
import type { AchievementProvider } from "@/lib/api/types";
import { PROVIDER_LABEL } from "@/lib/achievements";
import { IDENTIFIER_FIELD } from "@/lib/linked-accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineError, ProviderName } from "./account-parts";

// A Provider with no Linked Account yet: its identifier field, prefilled from
// the member's socials where one matches, and the link button.
export function LinkForm({
  userId,
  provider,
  initial,
}: {
  userId: string;
  provider: AchievementProvider;
  initial: string;
}) {
  const router = useRouter();
  const field = IDENTIFIER_FIELD[provider];
  const helpId = useId();
  const [identifier, setIdentifier] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await linkAccountAction(userId, provider, identifier);
      if (!result.ok) {
        setError(result.error ?? "Couldn't link this account.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <ProviderName provider={provider} />
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Input
          type="text"
          name="identifier"
          aria-label={field.label}
          aria-describedby={helpId}
          aria-invalid={error ? true : undefined}
          placeholder={field.placeholder}
          autoComplete="off"
          spellCheck={false}
          maxLength={256}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={pending}
        />
        <Button
          type="submit"
          variant="highlight"
          disabled={pending || !identifier.trim()}
        >
          {pending ? (
            <Loader2 data-icon="inline-start" className="motion-safe:animate-spin" />
          ) : (
            <Link2 data-icon="inline-start" />
          )}
          Link {PROVIDER_LABEL[provider]}
        </Button>
      </div>
      <p id={helpId} className="mt-1.5 text-[0.82rem] text-faint-foreground">
        {field.help}
      </p>
      <InlineError message={error} />
    </form>
  );
}
