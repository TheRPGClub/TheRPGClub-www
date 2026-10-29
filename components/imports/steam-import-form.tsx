"use client";

import { useActionState } from "react";
import { Download } from "lucide-react";
import { startSteamImportAction, type SteamImportFormState } from "@/app/actions/imports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Start step of the Steam import: the member's Steam profile, prefilled from
// their linked Steam social. The API reads the library from Steam and maps
// its errors (private profile, unknown profile, Steam down) to codes that the
// action turns into messages.
export function SteamImportForm({
  userId,
  defaultProfile,
}: {
  userId: string;
  defaultProfile: string;
}) {
  const [state, formAction, pending] = useActionState(
    startSteamImportAction.bind(null, userId),
    { error: null, steamProfile: defaultProfile } satisfies SteamImportFormState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="steam-profile"
          className="font-label block text-[0.9rem] font-extrabold tracking-[0.06em] text-paper-dim"
        >
          Steam profile
        </label>
        <Input
          // Remount after a failed attempt so the input shows what was sent.
          key={state.steamProfile}
          id="steam-profile"
          name="steam_profile"
          defaultValue={state.steamProfile}
          placeholder="https://steamcommunity.com/id/yourname"
          autoComplete="off"
          spellCheck={false}
          required
          aria-invalid={state.error ? true : undefined}
          aria-describedby="steam-profile-help"
        />
        <p id="steam-profile-help" className="text-xs text-paper-mute">
          Your profile URL, your 17-digit SteamID64 or your custom URL name.
          Your game details must be public.
        </p>
      </div>

      <Button type="submit" variant="highlight" disabled={pending}>
        <Download data-icon="inline-start" /> {pending ? "Reading your Steam library…" : "Start import"}
      </Button>

      {state.error && (
        <p
          role="alert"
          className="rounded-sm border border-destructive/40 bg-destructive/8 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
