"use client";

import { PlateElement, type PlateElementProps } from "platejs/react";

// How the rich-text editor draws its lists, nested lists stepping to a
// different marker.

export function BulletedList(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      as="ul"
      className="my-2 ml-5 list-disc [&_ul]:my-0 [&_ul]:list-[circle] [&_ol]:my-0"
    >
      {props.children}
    </PlateElement>
  );
}

export function NumberedList(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      as="ol"
      className="my-2 ml-5 list-decimal [&_ol]:my-0 [&_ol]:list-[lower-alpha] [&_ul]:my-0"
    >
      {props.children}
    </PlateElement>
  );
}

export function ListItem(props: PlateElementProps) {
  return (
    <PlateElement {...props} as="li" className="my-0.5">
      {props.children}
    </PlateElement>
  );
}

export function ListItemContent(props: PlateElementProps) {
  return (
    <PlateElement {...props} as="span">
      {props.children}
    </PlateElement>
  );
}
