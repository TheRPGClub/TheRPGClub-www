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
import { IMPORT_KINDS, importItemLabel, importItemTitle } from "@/lib/imports/kinds";
import type { ImportItemPanelProps } from "@/components/imports/import-item-panel";
import { ImportCandidateList } from "@/components/imports/import-candidate-list";
import { ImportIgdbSuggestions } from "@/components/imports/import-igdb-suggestions";
import { ImportItemDetails } from "@/components/imports/import-item-details";
import { GamePicker } from "@/components/member/game-picker";
import { ImportItemLayout, ImportRoute, ImportSubhead } from "@/components/issue/import-item-layout";
import { EDIT_SELECT_CLASS } from "@/components/member/game-list-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Review = CompletionatorImportReview & { item: CompletionatorImportItem };

const SELECT_CLASS = EDIT_SELECT_CLASS;

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

  const noun = IMPORT_KINDS[kind].itemNoun.one;
  const skip = (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={() =>
        perform("Skipping…", () => skipImportItemAction(kind, userId, item.item_id))
      }
    >
      <SkipForward data-icon="inline-start" /> Skip this {noun}
    </Button>
  );

  return (
    <ImportItemLayout
      label={`${importItemLabel(kind)} ${item.row_index}`}
      title={title || <span className="text-paper-mute">Untitled {noun}</span>}
      facts={<ImportItemDetails kind={kind} item={item} />}
      routes={
        choosing ? (
          <ChooseRoutes
            kind={kind}
            review={review}
            title={title}
            disabled={disabled}
            onMatch={match}
          />
        ) : undefined
      }
    >
      <div className="space-y-6">
        {game && !choosing && (
          <MatchedGame game={game} disabled={disabled} onChange={() => setChoosing(true)} />
        )}

        {choosing ? (
          game ? (
            <div className="space-y-3">
              <p className="text-sm text-paper-dim">
                Pick the right game from GameDB or IGDB, or keep the one it
                was matched to.
              </p>
              <div className="flex flex-wrap gap-2 border-t border-rule pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  onClick={() => setChoosing(false)}
                >
                  <Undo2 data-icon="inline-start" /> Keep the matched game
                </Button>
                {skip}
              </div>
            </div>
          ) : (
            <ImportCandidateList
              key={review.candidates.map((c) => c.game_id).join("-")}
              candidates={review.candidates}
              confidence={review.match_confidence}
              disabled={disabled}
              chooseLabel="Match this game"
              onChoose={(c) => match(`Matching ${c.title}…`, { game_id: c.game_id })}
              footer={skip}
            />
          )
        ) : (
          <>
            {step === "add_completion" ? (
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
            <div className="flex justify-end border-t border-rule pt-4">{skip}</div>
          </>
        )}
      </div>
    </ImportItemLayout>
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
    <div className="flex items-center gap-3.5 rounded-sm px-3 py-2.5 shadow-[inset_0_0_0_2px_var(--color-highlight)]">
      <span className="block h-[3.8rem] w-[2.9rem] shrink-0 overflow-hidden rounded-[2px] bg-ink">
        {game.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={game.cover_url} alt="" className="size-full object-cover" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.8rem] text-paper-mute">Matched to</p>
        <p className="font-label line-clamp-2 text-[1.1rem] leading-[1.05] font-extrabold tracking-[0.02em]">
          {game.title}
        </p>
      </div>
      <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={onChange}>
        <RefreshCw /> Wrong game?
      </Button>
    </div>
  );
}

// The search routes beside the item while the member is choosing its game.
function ChooseRoutes({
  kind,
  review,
  title,
  disabled,
  onMatch,
}: {
  kind: ImportItemPanelProps["kind"];
  review: Review;
  title: string;
  disabled: boolean;
  onMatch: (label: string, selection: ImportSelection) => void;
}) {
  const [picked, setPicked] = useState<Game | null>(null);

  return (
    <>
      <ImportRoute title="Pick from GameDB" defaultOpen={review.candidates.length === 0}>
        <div className="flex flex-col gap-2">
          <GamePicker compact placeholder="Search GameDB…" onPick={setPicked} />
          <Button
            type="button"
            variant="highlight"
            disabled={disabled || !picked}
            onClick={() =>
              picked && onMatch(`Matching ${picked.title}…`, { game_id: picked.game_id })
            }
          >
            <Check data-icon="inline-start" /> Use this game
          </Button>
        </div>
      </ImportRoute>
      <ImportRoute title="Not in GameDB? Try IGDB">
        <ImportIgdbSuggestions
          kind={kind}
          itemId={review.item.item_id}
          initialQuery={title}
          disabled={disabled}
          onChoose={(hit) => onMatch(`Importing ${hit.name}…`, { igdb_id: hit.igdb_id })}
        />
      </ImportRoute>
    </>
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
        <ImportSubhead>Add the completion</ImportSubhead>
        <p className="mt-1 text-sm text-paper-mute">
          {review.existing_completion
            ? "This is added as a separate completion; your existing one stays as it is."
            : "Check the details and add it to your completed games."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="font-label font-extrabold tracking-[0.06em] text-paper-dim">Completion type</span>
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
          <span className="font-label font-extrabold tracking-[0.06em] text-paper-dim">Platform</span>
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
            <span className="block text-xs text-paper-mute">
              This platform isn&apos;t listed for the game yet; adding it records a release.
            </span>
          )}
        </label>

        <fieldset className="space-y-1.5 text-sm sm:col-span-2">
          <legend className="font-label font-extrabold tracking-[0.06em] text-paper-dim">Date finished</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
            {dateOptions.map(([value, label]) => (
              <label key={value} className="inline-flex items-center gap-1.5">
                <input
                  type="radio"
                  className="accent-highlight"
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
          <span className="font-label font-extrabold tracking-[0.06em] text-paper-dim">Playtime (hours)</span>
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
            className="accent-highlight"
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
        <Button type="submit" variant="highlight" disabled={disabled}>
          <Plus data-icon="inline-start" /> Add completion
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
      <thead className="font-label text-[0.78rem] tracking-[0.08em] text-paper-mute">
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
            <tr key={field} className="border-t border-rule align-top">
              <th scope="row" className="py-1.5 pr-3 font-normal text-paper-mute">
                {UPDATE_FIELD_LABELS[field]}
              </th>
              <td className="py-1.5 pr-3">{current}</td>
              <td className={differs ? "py-1.5 font-semibold text-highlight" : "py-1.5"}>{incoming}</td>
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
        <ImportSubhead>Is this the same completion?</ImportSubhead>
        <p className="mt-1 text-sm text-paper-mute">
          You already finished this game, on a different date. Update that
          completion, or add this one as a separate playthrough.
        </p>
      </div>
      <CompletionDiff review={review} highlight={review.diff?.fields ?? []} />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="highlight" disabled={disabled} onClick={() => onAnswer(true)}>
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
        <ImportSubhead>Update your completion</ImportSubhead>
        <p className="mt-1 text-sm text-paper-mute">
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
            className="accent-highlight"
              checked={selected.includes(field)}
              onChange={(e) => toggle(field, e.target.checked)}
            />
            {UPDATE_FIELD_LABELS[field]}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="highlight" disabled={disabled || selected.length === 0}>
          <Check data-icon="inline-start" /> Update completion
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
