import { SlateElement, type SlateElementProps } from "platejs/static";

import { cn } from "@/lib/utils";

// The lists of a read-only review body (ReviewBodyContent in review-body.tsx),
// in the compact or the article voice.

export function makeBulletedList(article: boolean) {
  return function BulletedList(props: SlateElementProps) {
    return (
      <SlateElement
        {...props}
        as="ul"
        className={cn(
          "my-2 ml-5 list-disc marker:text-faint-foreground [&_ul]:my-0 [&_ul]:list-[circle] [&_ol]:my-0",
          article && "my-[1em] text-[1.09rem] leading-[1.8] text-foreground/90",
        )}
      >
        {props.children}
      </SlateElement>
    );
  };
}

export function makeNumberedList(article: boolean) {
  return function NumberedList(props: SlateElementProps) {
    return (
      <SlateElement
        {...props}
        as="ol"
        className={cn(
          "my-2 ml-5 list-decimal marker:text-faint-foreground [&_ol]:my-0 [&_ol]:list-[lower-alpha] [&_ul]:my-0",
          article && "my-[1em] text-[1.09rem] leading-[1.8] text-foreground/90",
        )}
      >
        {props.children}
      </SlateElement>
    );
  };
}

export function ListItem(props: SlateElementProps) {
  return (
    <SlateElement {...props} as="li" className="my-0.5">
      {props.children}
    </SlateElement>
  );
}

// List item content is the text row of an `li`. It has to stay inline or the
// marker sits on its own line.
export function ListItemContent(props: SlateElementProps) {
  return (
    <SlateElement {...props} as="span" className="whitespace-pre-wrap">
      {props.children}
    </SlateElement>
  );
}
