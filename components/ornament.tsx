// A decorative slot a Theme may draw into where CSS on the real elements
// can't (api ADR-0008, spec api#523): an empty, aria-hidden span named by
// what it is, never by a Theme. No Theme draws it unless it says so:
// app/globals.css hides every ornament (a logo-halo shows only its child),
// and a Theme turns one on with [data-theme="<name>"] [data-ornament="…"].
//
//   backdrop   the app shell's scene, behind the page
//   logo-halo  around the club's logo in the sidebar (wraps the image)
//   glare      over a cover story's key art (the Cover Story, a game hero);
//              `motion="sweep"` asks for the Cover Story's gloss sweep
export type OrnamentRole = "backdrop" | "logo-halo" | "glare";

export function Ornament({
  role,
  motion,
  children,
}: {
  role: OrnamentRole;
  motion?: "sweep";
  // Only a logo-halo wraps something: the logo it frames.
  children?: React.ReactNode;
}) {
  return (
    <span data-slot="ornament" data-ornament={role} data-motion={motion} aria-hidden>
      {children}
    </span>
  );
}
