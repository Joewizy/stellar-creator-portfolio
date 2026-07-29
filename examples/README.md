# Examples

Standalone, illustrative code that demonstrates how to use patterns, hooks, or
components from this project. **Nothing in the app imports from here.**

This directory exists so example and demo code has a home **outside the
application source tree** (`app/`, `components/`, `lib/`). It is listed under
`exclude` in [`tsconfig.json`](../tsconfig.json), so files here:

- are **not** part of the production TypeScript build / type-check, and
- are **not** reachable by the app bundler through source globs.

## Guidelines

- Put runnable/reference snippets and demos here, not inside `app/` or
  `components/`. Live, maintained code lives in the app source tree; example
  code lives here so contributors don't mistake it for production code.
- Keep examples self-contained and clearly named (e.g.
  `infinite-scroll.example.tsx`).
- If an example only exists to demonstrate a utility that is already covered by
  the util's own tests or docs, prefer deleting it over letting it drift.
