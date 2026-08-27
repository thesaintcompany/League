# AGENTS.md — Kilo agent guidance

## Project: sport-league-organizer (Next.js 14 / Prisma 5.22 / NextAuth)

## Build & typecheck (Windows host — PowerShell)
- PowerShell restricts `npm`, `npx`, `curl` and corrupts inline `node -e` JS. Wrap shell commands so they work:
  - Build: run via `node "F:/tmp/Rep/League/node_modules/next/dist/bin/next" build`
  - Typecheck: run via `node "F:/tmp/Rep/League/node_modules/typescript/bin/tsc" --noEmit` (use `tsconfig.json`; do NOT pass individual files because `@/` path aliases and `jsx: react-jsx` are required)
  - Install deps (when a new package is required): `cmd /c "cd /d F:\tmp\Rep\League && npm install --legacy-peer-deps"`
  - Run Next dev server: `node "F:/tmp/Rep/League/node_modules/next/dist/bin/next" dev`
- Docker build uses `npm run build` (Node 20 Alpine) — `package.json` scripts are the source of truth:
  - `"build": "prisma generate && next build"`
  - `"start": "node prisma/bootstrap.js && node scripts/start.js"`
  - `"postinstall": "prisma generate"`

## Common gotchas (from this session)
- `material-symbols-outlined` has NO `padel` glyph → use `sports_tennis`; `pingpong`/`ballot_panel` → `circle`.
- NEVER drop a `<span className="material-symbols-outlined">…</span>` INSIDE a JS string literal (e.g. `badge: "…<span>…</span>…"`) — it breaks JSX parsing with `Unexpected token div`. Use plain text or a `<>` fragment in JSX.
- NEVER leave `<span>` opening tag unclosed in JSX. After emoji→icon replacement, re-run `node tools/jsx-tagstack.js` and a `tsc`/`next build`.
- `nodemailer` must be in `dependencies`; `@types/nodemailer` in `devDependencies`; install with `--legacy-peer-deps` (next-auth v4 peer range).
- `signup` role-selector `: (...)` JSX must have balanced parens/braces.

## Validation checklist
1. `node tools/scan-emoji.js` → 0 emoji in `src/`.
2. `node "F:/tmp/Rep/League/node_modules/next/dist/bin/next" build` → `✓ Compiled successfully` with no type errors.
3. (Optional) `cmd /c "cd /d F:\tmp\Rep\League && npm test"` if a test script exists.
