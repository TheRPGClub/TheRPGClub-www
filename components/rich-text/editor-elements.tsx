"use client";

import { PlateElement, type PlateElementProps } from "platejs/react";

// How the rich-text editor draws its text blocks. Node types match
// ./static-elements.tsx, which reads back what the editor writes.

export function Paragraph(props: PlateElementProps) {
  return (
    // Matches the published paragraph rhythm, so what you write looks like
    // what everyone else reads.
    <PlateElement {...props} as="p" className="mt-[0.85em] first:mt-0">
      {props.children}
    </PlateElement>
  );
}

export function Heading1(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      as="h1"
      className="mt-5 mb-1.5 text-lg font-semibold first:mt-0"
    >
      {props.children}
    </PlateElement>
  );
}

export function Heading2(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      as="h2"
      className="mt-4 mb-1 text-base font-semibold first:mt-0"
    >
      {props.children}
    </PlateElement>
  );
}

export function Heading3(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      as="h3"
      className="mt-3 mb-1 text-sm font-semibold first:mt-0"
    >
      {props.children}
    </PlateElement>
  );
}

export function Blockquote(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      as="blockquote"
      className="my-2 border-l-2 border-muted-foreground/30 pl-3 text-muted-foreground italic"
    >
      {props.children}
    </PlateElement>
  );
}

export function Link(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      as="a"
      className="underline decoration-muted-foreground/50 underline-offset-2"
    >
      {props.children}
    </PlateElement>
  );
}
