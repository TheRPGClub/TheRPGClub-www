"use client";

import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

// The formatting toolbar's buttons, on the project's own primitives rather
// than Plate's shadcn registry, which is Radix-based — this app is on
// @base-ui/react.

interface ToolbarButtonProps {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

export function ToolbarButton({
  label,
  pressed,
  disabled,
  onClick,
  onMouseDown,
  children,
}: ToolbarButtonProps) {
  // Without this the editor loses its selection the moment the button takes
  // focus, and the transform has nothing to act on.
  const keepSelection = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onMouseDown?.(e);
  };

  // A formatting state is a Toggle; an action with no state of its own
  // (remove a link) is a plain Button, so it announces no "not pressed".
  if (pressed === undefined) {
    return (
      <Button
        type="button"
        variant="subtle"
        size="icon-sm"
        onMouseDown={keepSelection}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        title={label}
      >
        {children}
      </Button>
    );
  }
  return (
    <Toggle
      variant="toolbar"
      size="sm"
      pressed={pressed}
      onMouseDown={keepSelection}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="size-7 px-0"
    >
      {children}
    </Toggle>
  );
}
