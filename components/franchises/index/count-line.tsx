import { Fragment } from "react";

// A label-caps line of counts ("16 Mainline · 31 Games · 8 Add-ons") that
// wraps between its parts (after a dot), never inside one.
export function CountLine({ parts }: { parts: string[] }) {
  return parts.map((part, i) => (
    <Fragment key={part}>
      <span className="whitespace-nowrap">{part}</span>
      {i < parts.length - 1 && " · "}
    </Fragment>
  ));
}
