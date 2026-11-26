"use client";

import { useState, useTransition, type FormEvent } from "react";
import { donateKeyAction } from "@/app/actions/giveaways";
import type { Game } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { DonateGameField, DonatePlatformField, OTHER_PLATFORM } from "@/components/giveaways/donate-pick-fields";
import { DonateKeyField, DonateRegionField } from "@/components/giveaways/donate-key-fields";
import { ParcelPreview } from "@/components/giveaways/parcel-preview";

// Donating a key: the parcel wrapping itself live beside its paper label,
// which is the form. The game must come from the GameDB; one that isn't there
// can be added from IGDB by anyone who can donate (TheRPGClub-api#342).
export function DonateForm({ donorName }: { donorName: string }) {
  const [game, setGame] = useState<Game | null>(null);
  const [pickerKey, setPickerKey] = useState(0);
  const [platform, setPlatform] = useState<string>("");
  const [otherPlatform, setOtherPlatform] = useState("");
  const [region, setRegion] = useState("Global");
  const [keyValue, setKeyValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const platformName = platform === OTHER_PLATFORM ? otherPlatform.trim() : platform;

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
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(null);
    startTransition(async () => {
      const result = await donateKeyAction({
        gamedb_game_id: game?.game_id ?? null,
        platform: platformName,
        region,
        key_value: keyValue,
      });
      if (!result.ok) {
        setError(result.error ?? "Couldn't put the key on the shelf. Try again.");
        return;
      }
      setDone(`${result.data?.game_title ?? "Your key"} is on the shelf. Thank you!`);
      reset();
    });
  };

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12">
      <div className="mx-auto w-full max-w-[22rem] lg:mt-4">
        <ParcelPreview game={game} platform={platformName} region={region} />
      </div>
      <form
        onSubmit={submit}
        aria-label="Donate a key"
        className="rounded-md bg-foreground px-5 pt-5 pb-6 text-background shadow-[0_12px_30px_rgb(0_0_0/0.5)] sm:px-8 lg:-rotate-[0.6deg]"
      >
        <div className="mb-5 flex items-end justify-between gap-4 border-b-2 border-background pb-3">
          <p className="max-w-[34ch] text-sm text-slip-muted-foreground">
            It goes on the shelf straight away, and the bot posts it in the giveaways channel.
          </p>
          <p className="text-right">
            <span className="font-label block text-[0.7rem] font-extrabold text-slip-muted-foreground">From</span>
            <span className="font-headline block text-[1.75rem] leading-none">{donorName}</span>
          </p>
        </div>
        <DonateGameField game={game} pickerKey={pickerKey} onPick={setGame} onChange={changeGame} />
        <DonatePlatformField
          platform={platform}
          otherPlatform={otherPlatform}
          onPlatform={setPlatform}
          onOtherPlatform={setOtherPlatform}
        />
        <DonateRegionField region={region} onRegion={setRegion} />
        <DonateKeyField value={keyValue} onValue={setKeyValue} />
        {error && (
          <p role="alert" className="mt-3 rounded-sm bg-background px-3 py-2 text-sm text-foreground">
            {error}
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
          {done && (
            <p role="status" className="mr-auto text-sm font-semibold">
              {done}
            </p>
          )}
          <Button type="submit" variant="highlight" disabled={isPending} className="min-w-32">
            {isPending ? "Wrapping…" : "Donate"}
          </Button>
        </div>
      </form>
    </div>
  );
}
