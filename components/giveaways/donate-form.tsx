"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Gift } from "lucide-react";
import { donateKeyAction } from "@/app/actions/giveaways";
import type { Game } from "@/lib/api/types";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  DonateGameField,
  DonatePlatformField,
  OTHER_PLATFORM,
} from "@/components/giveaways/donate-pick-fields";
import { DonateKeyField, DonateRegionField } from "@/components/giveaways/donate-key-fields";

// "Wrap a key": the donate form, on the yellow call-to-action panel. The game
// must come from the GameDB; one that isn't there can be added from IGDB by
// anyone who can donate (the API opens IGDB search and import to any signed-in
// user, TheRPGClub-api#342), so there is no Members blocked reason here.
export function DonateForm() {
  const [game, setGame] = useState<Game | null>(null);
  const [pickerKey, setPickerKey] = useState(0);
  const [platform, setPlatform] = useState<string>("");
  const [otherPlatform, setOtherPlatform] = useState("");
  const [region, setRegion] = useState("Global");
  const [keyValue, setKeyValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const changeGame = () => {
    setGame(null);
    setPickerKey((k) => k + 1);
  };
  const reset = () => {
    changeGame();
    setPlatform("");
    setOtherPlatform("");
    setRegion("Global");
    setKeyValue("");
    setShowKey(false);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(null);
    startTransition(async () => {
      const result = await donateKeyAction({
        gamedb_game_id: game?.game_id ?? null,
        platform: platform === OTHER_PLATFORM ? otherPlatform : platform,
        region,
        key_value: keyValue,
      });
      if (!result.ok) {
        setError(result.error ?? "Couldn't put the key on the shelf. Try again.");
        return;
      }
      setDone(`${result.data?.game_title ?? "Your key"} is on the shelf.`);
      reset();
    });
  };

  return (
    <form onSubmit={submit} className="rounded-md bg-highlight p-6 text-highlight-foreground" aria-labelledby="donate-title">
      <h2 id="donate-title" className="font-headline text-[2.2rem] leading-[0.9]">
        Wrap a key
      </h2>
      <p className="mt-2 mb-5 text-sm text-highlight-muted-foreground">
        It goes on the shelf straight away, and the bot updates the giveaways channel.
      </p>

      <DonateGameField game={game} pickerKey={pickerKey} onPick={setGame} onChange={changeGame} />
      <DonatePlatformField
        platform={platform}
        otherPlatform={otherPlatform}
        onPlatform={setPlatform}
        onOtherPlatform={setOtherPlatform}
      />
      <DonateRegionField region={region} onRegion={setRegion} />
      <DonateKeyField value={keyValue} onValue={setKeyValue} shown={showKey} onShown={setShowKey} />

      {error && (
        <p role="alert" className="mt-3 rounded-sm bg-background px-3 py-2 text-sm text-foreground">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="mt-3 text-sm font-semibold text-background">
          {done}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button type="submit" variant="inverse" disabled={isPending}>
          <Gift aria-hidden />
          {isPending ? "Wrapping…" : "Put it on the shelf"}
        </Button>
        <ButtonLink href="/giveaways" variant="inverse-outline">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
