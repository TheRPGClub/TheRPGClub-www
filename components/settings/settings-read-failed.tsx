// A /settings section whose read failed: a dashed box with one line.
export function SettingsReadFailed({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="mt-5 rounded-md border border-dashed border-border-strong px-4 py-5 text-sm text-dim-foreground"
    >
      {children}
    </p>
  );
}
