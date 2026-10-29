"use client";

import { useEffect, useState } from "react";
import { Check, Plus, RefreshCw, SkipForward, Undo2 } from "lucide-react";
import {
  addCompletionImportItemAction,
  matchImportItemAction,
  nowPlayingEntryIdsAction,
  skipImportItemAction,
  updateCompletionImportItemAction,
  type ImportSelection,
} from "@/app/actions/imports";
import type {
  CompletionatorImportItem,
  CompletionatorImportReview,
  CompletionatorUpdateField,
  Game,
} from "@/lib/api/types";
import {
  COMPLETION_TYPES,
  UPDATE_FIELD_LABELS,
  addCompletionPayload,
  completionDiffRows,
  completionatorReviewToShow,
  datePart,
  formatImportDate,
  todayDate,
  type DateChoice,
} from "@/lib/imports/completionator";
import { importItemTitle } from "@/lib/imports/kinds";
import type { ImportItemPanelProps } from "@/components/imports/import-item-panel";
import { ImportCandidateList } from "@/components/imports/import-candidate-list";
import { ImportIgdbSuggestions } from "@/components/imports/import-igdb-suggestions";
import { ImportItemDetails } from "@/components/imports/import-item-details";
import { GamePicker } from "@/components/member/game-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Review = CompletionatorImportReview & { item: CompletionatorImportItem };

const SELECT_CLASS =
  "h-8 w-full rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// Review of one Completionator row. The API's `next_step` drives it: choose
// the game (`match`), then add the completion, or, when the member already
// has one, confirm it's the same completion and pick what to update. Keyed on
// the step and game so a new `match` result starts from a clean form.
export function CompletionatorItemPanel(props: ImportItemPanelProps) {
  const review = props.review as Review;
  return (
    <CompletionatorStep
      key={`${review.next_step}-${review.game?.game_id ?? 0}`}
      {...props}
      review={review}
    />
  );
}

function CompletionatorStep({
  kind,
  userId,
  review,
  disabled,
  perform,
}: Omit<ImportItemPanelProps, "review"> & { review: Review }) {
  const { item, game } = review;
  const title = importItemTitle(kind, item);
  const [choosing, setChoosing] = useState(review.next_step === "choose_game" || !game);
  // confirm_same: null until the member answers.
  const [sameCompletion, setSameCompletion] = useState<boolean | null>(null);

  const match = (label: string, selection: ImportSelection) =>
    perform(
      label,
      () => matchImportItemAction(kind, userId, item.item_id, selection),
      (data) => completionatorReviewToShow(data as CompletionatorImportReview),
    );

  let step = review.next_step;
  if (step === "confirm_same" && sameCompletion !== null) {
    step = sameCompletion ? "update_completion" : "add_completion";
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Row {item.row_index}
          </p>
          <h2 className="text-xl font-semibold tracking-tight break-words">
            {title || <span className="text-muted-foreground">Untitled row</span>}
          </h2>
        </div>
        <ImportItemDetails kind={kind} item={item} />
      </div>

      {game && !choosing && (
        <MatchedGame game={game} disabled={disabled} onChange={() => setChoosing(true)} />
      )}

      {choosing ? (
        <ChooseGame
          kind={kind}
          review={review}
          title={title}
          disabled={disabled}
          onMatch={match}
          onCancel={game ? () => setChoosing(false) : undefined}
        />
      ) : step === "add_completion" ? (
        <AddCompletion
          key="add"
          kind={kind}
          userId={userId}
          review={review}
          disabled={disabled}
          perform={perform}
          onBack={sameCompletion === false ? () => setSameCompletion(null) : undefined}
        />
      ) : step === "confirm_same" ? (
        <ConfirmSame review={review} disabled={disabled} onAnswer={setSameCompletion} />
      ) : step === "update_completion" ? (
        <UpdateCompletion
          kind={kind}
          userId={userId}
          review={review}
          disabled={disabled}
          perform={perform}
          onBack={sameCompletion === true ? () => setSameCompletion(null) : undefined}
        />
      ) : null}

      <div className="flex justify-end border-t pt-4">
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          onClick={() =>
            perform("Skipping…", () => skipImportItemAction(kind, userId, item.item_id))
          }
        >
          <SkipForward /> Skip this row
        </Button>
      </div>
    </div>
  );
}

function MatchedGame({
  game,
  disabled,
  onChange,
}: {
  game: NonNullable<Review["game"]>;
  disabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2">
      {game.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={game.cover_url} alt="" className="h-16 w-12 shrink-0 rounded object-cover" />
      ) : (
        <div className="h-16 w-12 shrink-0 rounded bg-muted" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">Matched to</p>
        <p className="line-clamp-2 font-medium">{game.title}</p>
      </div>
      <Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={onChange}>
        <RefreshCw /> Wrong game?
      </Button>
    </div>
  );
}

function ChooseGame({
  kind,
  review,
  title,
  disabled,
  onMatch,
  onCancel,
}: {
  kind: ImportItemPanelProps["kind"];
  review: Review;
  title: string;
  disabled: boolean;
  onMatch: (label: string, selection: ImportSelection) => void;
  onCancel?: () => void;
}) {
  const [picked, setPicked] = useState<Game | null>(null);

  return (
    <div className="space-y-6">
      {!onCancel && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Matches in GameDB</h3>
          <ImportCandidateList
            candidates={review.candidates}
            confidence={review.match_confidence}
            disabled={disabled}
            onChoose={(c) => onMatch(`Matching ${c.title}…`, { game_id: c.game_id })}
          />
        </section>
      )}

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Pick a game from GameDB</h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <GamePicker
            className="flex-1"
            compact
            placeholder="Search GameDB…"
            onPick={setPicked}
          />
          <Button
            type="button"
            disabled={disabled || !picked}
            onClick={() =>
              picked && onMatch(`Matching ${picked.title}…`, { game_id: picked.game_id })
            }
          >
            <Check /> Use this game
          </Button>
        </div>
      </section>

      <details className="group space-y-2 rounded-lg border px-3 py-2">
        <summary className="cursor-pointer text-sm font-semibold">
          Not in GameDB? Look it up on IGDB
        </summary>
        <div className="pt-3">
          <ImportIgdbSuggestions
            kind={kind}
            itemId={review.item.item_id}
            initialQuery={title}
            disabled={disabled}
            onChoose={(hit) => onMatch(`Importing ${hit.name}…`, { igdb_id: hit.igdb_id })}
          />
        </div>
      </details>

      {onCancel && (
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={onCancel}>
          <Undo2 /> Keep the matched game
        </Button>
      )}
    </div>
  );
}

function AddCompletion({
  kind,
  userId,
  review,
  disabled,
  perform,
  onBack,
}: Omit<ImportItemPanelProps, "review"> & { review: Review; onBack?: () => void }) {
  const { item, form, game } = review;
  const rowDate = form?.completed_at ?? item.completed_at;
  const hasRowDate = datePart(rowDate) !== null;

  const [completionType, setCompletionType] = useState(form?.completion_type ?? COMPLETION_TYPES[0]);
  const [platformId, setPlatformId] = useState(form?.platform_id ? String(form.platform_id) : "");
  const [dateChoice, setDateChoice] = useState<DateChoice>(
    form?.date_choice === "csv" && hasRowDate ? "csv" : "unknown",
  );
  const [customDate, setCustomDate] = useState("");
  const [playtime, setPlaytime] = useState(
    form?.final_playtime_hours != null ? String(form.final_playtime_hours) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [nowPlayingIds, setNowPlayingIds] = useState<number[]>([]);
  const [removeNowPlaying, setRemoveNowPlaying] = useState(true);

  // Offer to take the game off Now Playing, as the bot does.
  const gameId = game?.game_id;
  useEffect(() => {
    if (!gameId) return;
    let live = true;
    nowPlayingEntryIdsAction(userId, gameId).then((res) => {
      if (live && res.ok && res.data) setNowPlayingIds(res.data);
    });
    return () => {
      live = false;
    };
  }, [userId, gameId]);

  const platforms = form?.platforms ?? [];
  const createsRelease =
    !!form?.creates_release && !!form.platform_id && platformId === String(form.platform_id);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const built = addCompletionPayload(
      { completionType, platformId, dateChoice, customDate, playtime },
      rowDate,
    );
    if (!built.ok) {
      setError(built.error);
      return;
    }
    setError(null);
    const removeIds = removeNowPlaying ? nowPlayingIds : [];
    perform("Adding the completion…", () =>
      addCompletionImportItemAction(kind, userId, item.item_id, built.payload, removeIds),
    );
  }

  const dateOptions: [DateChoice, string][] = [
    ...(hasRowDate
      ? ([["csv", `From the file (${formatImportDate(rowDate)})`]] as [DateChoice, string][])
      : []),
    ["today", "Today"],
    ["unknown", "I don't know"],
    ["custom", "Pick a date"],
  ];

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Add the completion</h3>
        <p className="text-sm text-muted-foreground">
          {review.existing_completion
            ? "This is added as a separate completion; your existing one stays as it is."
            : "Check the details and add it to your completed games."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Completion type</span>
          <select
            value={completionType}
            onChange={(e) => setCompletionType(e.target.value)}
            className={SELECT_CLASS}
          >
            {COMPLETION_TYPES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Platform</span>
          <select
            value={platformId}
            onChange={(e) => setPlatformId(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">Other / not listed</option>
            {platforms.map((p) => (
              <option key={p.platform_id} value={String(p.platform_id)}>
                {p.platform_name}
              </option>
            ))}
          </select>
          {createsRelease && (
            <span className="block text-xs text-muted-foreground">
              This platform isn&apos;t listed for the game yet; adding it records a release.
            </span>
          )}
        </label>

        <fieldset className="space-y-1.5 text-sm sm:col-span-2">
          <legend className="font-medium">Date finished</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
            {dateOptions.map(([value, label]) => (
              <label key={value} className="inline-flex items-center gap-1.5">
                <input
                  type="radio"
                  name={`date-choice-${item.item_id}`}
                  value={value}
                  checked={dateChoice === value}
                  onChange={() => setDateChoice(value)}
                />
                {label}
              </label>
            ))}
          </div>
          {dateChoice === "custom" && (
            <Input
              type="date"
              value={customDate}
              max={todayDate()}
              onChange={(e) => setCustomDate(e.target.value)}
              aria-label="Date finished"
              className="mt-1 w-auto"
            />
          )}
        </fieldset>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Playtime (hours)</span>
          <Input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={playtime}
            onChange={(e) => setPlaytime(e.target.value)}
            placeholder="Unknown"
          />
        </label>
      </div>

      {nowPlayingIds.length > 0 && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={removeNowPlaying}
            onChange={(e) => setRemoveNowPlaying(e.target.checked)}
          />
          Also remove it from Now Playing
        </label>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={disabled}>
          <Plus /> Add completion
        </Button>
        {onBack && (
          <Button type="button" variant="ghost" disabled={disabled} onClick={onBack}>
            <Undo2 /> Back
          </Button>
        )}
      </div>
    </form>
  );
}

function CompletionDiff({
  review,
  highlight,
}: {
  review: Review;
  highlight: CompletionatorUpdateField[];
}) {
  if (!review.existing_completion) return null;
  const rows = completionDiffRows(review.existing_completion, review.item);
  return (
    <table className="w-full text-left text-sm">
      <thead className="text-xs text-muted-foreground">
        <tr>
          <th className="py-1 pr-3 font-medium" />
          <th className="py-1 pr-3 font-medium">Your completion</th>
          <th className="py-1 font-medium">In the file</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([field, current, incoming]) => {
          const differs = highlight.includes(field);
          return (
            <tr key={field} className="border-t align-top">
              <th scope="row" className="py-1.5 pr-3 font-normal text-muted-foreground">
                {UPDATE_FIELD_LABELS[field]}
              </th>
              <td className="py-1.5 pr-3">{current}</td>
              <td className={differs ? "py-1.5 font-medium text-primary" : "py-1.5"}>{incoming}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ConfirmSame({
  review,
  disabled,
  onAnswer,
}: {
  review: Review;
  disabled: boolean;
  onAnswer: (same: boolean) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Is this the same completion?</h3>
        <p className="text-sm text-muted-foreground">
          You already finished this game, on a different date. Update that
          completion, or add this one as a separate playthrough.
        </p>
      </div>
      <CompletionDiff review={review} highlight={review.diff?.fields ?? []} />
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={disabled} onClick={() => onAnswer(true)}>
          Yes, update it
        </Button>
        <Button type="button" variant="outline" disabled={disabled} onClick={() => onAnswer(false)}>
          No, add a separate completion
        </Button>
      </div>
    </section>
  );
}

function UpdateCompletion({
  kind,
  userId,
  review,
  disabled,
  perform,
  onBack,
}: Omit<ImportItemPanelProps, "review"> & { review: Review; onBack?: () => void }) {
  const options = review.diff?.fields ?? [];
  const [selected, setSelected] = useState<CompletionatorUpdateField[]>(options);

  const toggle = (field: CompletionatorUpdateField, on: boolean) =>
    setSelected((prev) => (on ? [...prev, field] : prev.filter((f) => f !== field)));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        perform("Updating the completion…", () =>
          updateCompletionImportItemAction(kind, userId, review.item.item_id, selected),
        );
      }}
    >
      <div>
        <h3 className="text-sm font-semibold">Update your completion</h3>
        <p className="text-sm text-muted-foreground">
          You already finished this game. Choose which values from the file to
          copy onto it.
        </p>
      </div>
      <CompletionDiff review={review} highlight={options} />
      <fieldset className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
        <legend className="sr-only">Values to update</legend>
        {options.map((field) => (
          <label key={field} className="inline-flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={selected.includes(field)}
              onChange={(e) => toggle(field, e.target.checked)}
            />
            {UPDATE_FIELD_LABELS[field]}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={disabled || selected.length === 0}>
          <Check /> Update completion
        </Button>
        {onBack && (
          <Button type="button" variant="ghost" disabled={disabled} onClick={onBack}>
            <Undo2 /> Back
          </Button>
        )}
      </div>
    </form>
  );
}
