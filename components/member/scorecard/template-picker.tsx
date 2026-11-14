"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { REVIEW_TEMPLATES, type ReviewTemplateChoice } from "@/lib/reviews/facets";

// Switching is not destructive: a category the new template also carries
// keeps its score and its name, and Custom keeps the card exactly as it
// stands. What each template holds is in the explainer.
export function TemplatePicker({
  choice,
  disabled,
  onPick,
}: {
  choice: ReviewTemplateChoice;
  disabled?: boolean;
  onPick: (template: ReviewTemplateChoice) => void;
}) {
  return (
    <DropdownMenu>
      {/* Children outside the render element, matching how every other
          trigger in the app is written. */}
      <DropdownMenuTrigger
        disabled={disabled}
        render={<Button type="button" variant="outline" size="xs" />}
      >
        {REVIEW_TEMPLATES.find((template) => template.key === choice)?.label}
        <ChevronDown className="text-muted-foreground motion-safe:transition-transform group-aria-expanded/button:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-w-72">
        {/* Radio items, because exactly one template is applied at a time —
            checkboxes would announce four independent on/off states to a
            screen reader. The apply hangs off `onClick` rather than the
            group's `onValueChange`, so picking the template already showing
            still fires: re-applying a preset is how an over-edited card gets
            back to a known shape, and a change-only handler would make that
            click do nothing. */}
        <DropdownMenuRadioGroup value={choice}>
          {REVIEW_TEMPLATES.map((template) => (
            <DropdownMenuRadioItem
              key={template.key}
              value={template.key}
              onClick={() => onPick(template.key)}
              closeOnClick
            >
              <span className="block">
                <span className="block">{template.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {template.blurb}
                </span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
