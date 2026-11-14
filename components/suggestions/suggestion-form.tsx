"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import {
  SUGGESTION_DETAILS_MAX,
  SUGGESTION_TITLE_MAX,
  type SuggestionType,
} from "@/lib/suggestions";
import { previewSuggestion } from "@/lib/suggestions-preview";
import { createSuggestionAction } from "@/app/actions/suggestions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SuggestionField } from "./suggestion-field";
import { SuggestionPreview } from "./suggestion-preview";
import { SuggestionTypePicker } from "./suggestion-type-picker";

// The Suggest something form, with a live preview of the card it will pin to
// the board and what happens after.
export function SuggestionForm({ authorId, authorName }: { authorId: string; authorName: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [types, setTypes] = useState<SuggestionType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(type: SuggestionType) {
    setError(null);
    setTypes((current) =>
      current.includes(type) ? current.filter((t) => t !== type) : [...current, type],
    );
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createSuggestionAction({ title, details, types });
      if (res.ok && res.data) {
        router.push(`/suggestions?pinned=${res.data.suggestion_id}`);
      } else {
        setError(res.error ?? "Couldn't submit it. Try again.");
      }
    });
  }

  return (
    <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,640px)_minmax(0,400px)]">
      <form onSubmit={submit} noValidate className="min-w-0">
        <SuggestionField
          id="suggestion-title"
          label="Title"
          hint="One line that says what should change."
          length={title.length}
          max={SUGGESTION_TITLE_MAX}
        >
          <Input
            id="suggestion-title"
            variant="compose"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(null);
            }}
            maxLength={SUGGESTION_TITLE_MAX}
            required
            disabled={pending}
            aria-describedby="suggestion-title-hint"
            className="mt-1.5 h-9 py-0 text-base md:text-base"
          />
        </SuggestionField>

        <SuggestionField
          id="suggestion-details"
          label="Details"
          hint="What it should do, and why it would help."
          length={details.length}
          max={SUGGESTION_DETAILS_MAX}
        >
          <Textarea
            id="suggestion-details"
            variant="compose"
            value={details}
            onChange={(e) => {
              setDetails(e.target.value);
              setError(null);
            }}
            maxLength={SUGGESTION_DETAILS_MAX}
            required
            rows={7}
            disabled={pending}
            aria-describedby="suggestion-details-hint"
            className="mt-1.5 inline-block min-h-[150px] px-3 py-2 text-base leading-normal field-sizing-fixed md:text-base"
          />
        </SuggestionField>

        <SuggestionTypePicker types={types} onToggle={toggle} disabled={pending} />

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-7 flex gap-2.5 border-t border-border pt-5">
          <Button type="submit" variant="highlight" disabled={pending}>
            <Send aria-hidden />
            {pending ? "Submitting" : "Submit Suggestion"}
          </Button>
          <ButtonLink href="/suggestions" variant="outline">
            Cancel
          </ButtonLink>
        </div>
      </form>

      <SuggestionPreview
        suggestion={previewSuggestion({ title, details, types, authorId, authorName })}
      />
    </div>
  );
}
