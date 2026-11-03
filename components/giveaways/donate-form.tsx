"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { Check, Eye, EyeOff, Gift, X } from "lucide-react";
import { donateKeyAction } from "@/app/actions/giveaways";
import type { Game } from "@/lib/api/types";
import { DONATE_PLATFORMS, GAME_KEY_REGIONS, MAX_KEY, MAX_PLATFORM, MAX_TITLE } from "@/lib/giveaways";
import { GamePicker } from "@/components/member/game-picker";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FIELD = "border-ink bg-[#fff8cc] text-ink caret-ink placeholder:text-ink/55 focus-visible:border-ink focus-visible:ring-ink/20";
const LABEL = "font-label mb-1.5 block text-sm text-ink";
const OTHER = "Other";

// "Wrap a key": the donate form, on the yellow call-to-action panel.
export function DonateForm() {
  const [game, setGame] = useState<Game | null>(null);
  const [pickerKey, setPickerKey] = useState(0);
  const [typedTitle, setTypedTitle] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string>("");
  const [otherPlatform, setOtherPlatform] = useState("");
  const [region, setRegion] = useState("Global");
  const [keyValue, setKeyValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setGame(null);
    setPickerKey((k) => k + 1);
    setTypedTitle(null);
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
        game_title: game ? "" : (typedTitle ?? ""),
        platform: platform === OTHER ? otherPlatform : platform,
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
    <form onSubmit={submit} className="rounded-md bg-highlight p-6 text-ink" aria-labelledby="donate-title">
      <h2 id="donate-title" className="font-headline text-[2.2rem] leading-[0.9]">
        Wrap a key
      </h2>
      <p className="mt-2 mb-5 text-sm text-highlight-ink">
        It goes on the shelf straight away, and the bot updates the giveaways channel.
      </p>

      <div className="mb-4">
        <span className={LABEL} id="donate-game">
          Game
        </span>
        {typedTitle !== null ? (
          <div className="space-y-1.5">
            <Input
              aria-labelledby="donate-game"
              value={typedTitle}
              maxLength={MAX_TITLE}
              onChange={(e) => setTypedTitle(e.target.value)}
              placeholder="The game's title"
              className={FIELD}
            />
            <button type="button" onClick={() => setTypedTitle(null)} className="font-label text-xs text-ink underline underline-offset-2">
              Search the GameDB instead
            </button>
          </div>
        ) : game ? (
          <div className="flex h-9 items-center gap-2 rounded-sm border border-ink bg-ink pr-1 pl-3 text-sm text-paper">
            <Check aria-hidden className="size-4 text-highlight" />
            <span className="min-w-0 flex-1 truncate font-semibold">{game.title}</span>
            <button
              type="button"
              aria-label="Change game"
              onClick={() => {
                setGame(null);
                setPickerKey((k) => k + 1);
              }}
              className="grid size-7 place-items-center rounded-sm text-paper-dim hover:bg-ink-3 hover:text-paper"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-1.5 [&_input]:border-ink [&_input]:bg-[#fff8cc] [&_input]:text-ink [&_input]:caret-ink [&_input]:placeholder:text-ink/55">
            <GamePicker key={pickerKey} compact onPick={setGame} placeholder="Search the GameDB…" />
            <button type="button" onClick={() => setTypedTitle("")} className="font-label text-xs text-ink underline underline-offset-2">
              Not in the GameDB? Type the title
            </button>
          </div>
        )}
      </div>

      <fieldset className="mb-4">
        <legend className={LABEL}>Platform</legend>
        <div className="flex flex-wrap gap-1.5">
          {[...DONATE_PLATFORMS, OTHER].map((p) => {
            const selected = platform === p;
            return (
              <button
                key={p}
                type="button"
                aria-pressed={selected}
                onClick={() => setPlatform(p)}
                className={cn(
                  "font-label h-7 rounded-xs px-2.5 text-[0.82rem] font-extrabold transition-colors focus-visible:ring-3 focus-visible:ring-ink/30 focus-visible:outline-none",
                  selected ? "bg-ink text-highlight" : "text-ink shadow-[inset_0_0_0_1.5px_var(--color-ink)] hover:bg-ink/10",
                )}
              >
                {p}
              </button>
            );
          })}
        </div>
        {platform === OTHER && (
          <Input
            aria-label="Platform name"
            value={otherPlatform}
            maxLength={MAX_PLATFORM}
            onChange={(e) => setOtherPlatform(e.target.value)}
            placeholder="e.g. itch.io, Humble"
            className={cn(FIELD, "mt-2")}
          />
        )}
      </fieldset>

      <div className="mb-4">
        <label htmlFor="donate-region" className={LABEL}>
          Region
        </label>
        <select
          id="donate-region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className={cn("h-9 w-full rounded-sm border px-3 text-sm outline-none focus-visible:ring-2", FIELD)}
        >
          {GAME_KEY_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r === "Global" ? "Global (redeems anywhere)" : r}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-1">
        <label htmlFor="donate-key" className={LABEL}>
          Key
        </label>
        <div className="relative">
          <Input
            id="donate-key"
            type={showKey ? "text" : "password"}
            autoComplete="off"
            spellCheck={false}
            value={keyValue}
            maxLength={MAX_KEY}
            onChange={(e) => setKeyValue(e.target.value)}
            placeholder="XXXXX-XXXXX-XXXXX"
            className={cn(FIELD, "pr-10 tracking-[0.2em]")}
          />
          <button
            type="button"
            onClick={() => setShowKey((s) => !s)}
            aria-label={showKey ? "Hide the key" : "Show the key"}
            className="absolute top-1/2 right-1 grid size-7 -translate-y-1/2 place-items-center rounded-sm text-ink hover:bg-ink/10"
          >
            {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-highlight-ink">Only you, the member who claims it, and Admins ever see the key.</p>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-sm bg-ink px-3 py-2 text-sm text-paper">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="mt-3 text-sm font-semibold text-ink">
          {done}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2.5">
        <button
          type="submit"
          disabled={isPending}
          className="font-label inline-flex h-9 items-center gap-2 rounded-sm bg-ink px-3.5 text-[0.95rem] font-extrabold text-paper transition-colors hover:bg-ink-3 focus-visible:ring-3 focus-visible:ring-ink/40 focus-visible:outline-none disabled:opacity-60"
        >
          <Gift aria-hidden className="size-4" />
          {isPending ? "Wrapping…" : "Put it on the shelf"}
        </button>
        <Link
          href="/giveaways"
          className="font-label inline-flex h-9 items-center rounded-sm px-3.5 text-[0.95rem] font-extrabold text-ink shadow-[inset_0_0_0_1.5px_var(--color-ink)] hover:bg-ink/10"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
