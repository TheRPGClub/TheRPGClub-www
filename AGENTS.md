<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Structure rules

These keep the site readable and themeable (spec www#80). Lint checks them: `eslint/structure.mjs`, tests in `eslint/structure.test.ts`. They warn today and become errors once the codebase is clean.

- **Aim for about 100 lines of code per file.** Lint warns past 120 (`max-lines`; blank lines and comments do not count) in route files and components. Primitives (`components/ui`), server actions (`app/actions`), `lib/` and `hooks/` are exempt.
- **Use the shadcn primitive, never a hand-made one.** No raw `<button>`, `<input>`, `<select>`, `<textarea>` or `<table>` outside `components/ui` (`structure/no-raw-controls`). Missing primitive? Add it with the shadcn CLI. A real exception takes an inline disable comment with a reason: `// eslint-disable-next-line structure/no-raw-controls -- native file picker` (`structure/disable-needs-reason` flags one without).
- **Pass only layout classes to primitives** (spacing, size, placement, flex, grid). No background, text colour, radius, shadow or border colour (`structure/no-look-classes-on-primitives`). A different look is a named, semantic variant on the primitive (`tone="gotm"`, `variant="inverse"`), not a class.
- **Components never live beside routes.** `app/` holds route files only; components go under `components/`.
- **Themes are CSS only** (api ADR-0008). A Theme sets tokens and styles primitives by `data-slot` and `data-variant`; it never swaps a React component. Use role-based and club-colour tokens, never the Monthly Issue palette names `ink`, `paper`, `rule` and their steps (`structure/no-palette-colors`).
- **Checks before a pull request:** `npm run lint`, `npm run typecheck`, `npm test` (Vitest). CI runs the same on every pull request.
