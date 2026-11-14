"use client";

// A select that submits its form as soon as it changes, for filters where
// a separate Apply step is friction (the archive's sort).
export function SubmitOnChangeSelect({
  options,
  ...props
}: Omit<React.ComponentProps<"select">, "onChange" | "children"> & {
  options: { value: string; label: string }[];
}) {
  return (
    <select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
