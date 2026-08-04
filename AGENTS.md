# AGENTS.md

UniGlyphs is a pnpm/Turborepo monorepo: a WXT-based browser extension
(`apps/web-extension`) and a Next.js marketing/download site (`apps/web`),
sharing UI/logic through `packages/ui`.

## Repo layout

- `apps/web-extension`: WXT extension (Chrome + Firefox). Entrypoints in
  `entrypoints/` (`content/` injects the toolbar into pages, `popup/` is the
  toolbar UI shown from the browser action).
- `apps/web`: Next.js app (marketing site + `/downloads` page).
- `packages/ui`: shared React components, hooks, and text-processing logic
  (`src/lib/textTools`, `caretPosition.ts`, `textboxState.ts`,
  `getUnicodeInfo.ts`). Both apps import from here via `@workspace/ui/*`
  path exports (see `packages/ui/package.json` `exports` map). Don't
  duplicate glyph/formatting logic in either app.
- `packages/eslint-config`, `packages/typescript-config`: shared configs;
  extend these rather than hand-rolling per-package lint/tsconfig rules.

## Versioning

- Versions are **fixed** across `uniglyphs`, `UniGlyphs` (web-extension), and
  `UniGlyphsWeb` (web) (see `pnpm-workspace.yaml` `versioning.fixed`). Bump
  with `pnpm version:sync` from the repo root (bumps root `package.json` then
  syncs all workspace packages), not by hand-editing individual
  `package.json` files.

## Environment variables

- Extension vars must be prefixed `WXT_` (e.g. `WXT_UNIGLYPHS_WEBSITE_URL`);
  web vars must be prefixed `NEXT_` (e.g. `NEXT_UNIGLYPHS_WEBSITE_URL`). WXT
  and Next.js both only inline env vars matching their required prefix.
  Anything else silently resolves to `undefined` at runtime instead of erroring.
- New env vars must be added to `turbo.json`'s `globalEnv` array or
  Turbo won't bust the build cache when they change.
  local dev.

## WXT-specific notes

- When working on the extension, load WXT's own docs instead of guessing at
  its API. LLM-oriented knowledge files are hosted at
  https://wxt.dev/knowledge/index.json (index of docs prepared for LLM
  consumption; no need to crawl the whole site).
- `wxt.config.ts` sets Firefox-specific manifest fields
  (`browser_specific_settings.gecko.data_collection_permissions`) via the
  `manifest: ({ browser }) => ...` callback. Firefox submissions fail
  validation without this, so don't strip it out when touching manifest
  config.
- Firefox builds/dev/zip use separate scripts (`dev:firefox`,
  `build:firefox`, `zip:firefox` — all pass `-b firefox` to `wxt`). Running
  the plain `build`/`dev`/`zip` scripts only targets Chrome.
- `postinstall` runs `wxt prepare` (generates `.wxt/` types). If TS can't
  resolve `wxt/*` types or auto-generated route/manifest types after a fresh
  clone, rerun `pnpm install` (not just `wxt dev`) so `postinstall` fires.
- Path aliases in the extension rely on `vite-tsconfig-paths` (wired in
  `wxt.config.ts`). New path aliases must be added to
  `apps/web-extension/tsconfig.json`, not `wxt.config.ts`.

## Workflow

- Use `turbo` scripts from the repo root (`pnpm dev`, `pnpm build`,
  `pnpm lint`) rather than `cd`-ing into an app; Turbo handles the
  `packages/ui` → app build order via `dependsOn: ["^build"]`. Running
  `next build` or `wxt build` directly inside an app skips that ordering.
- Commit messages are enforced by commitlint (`@commitlint/config-conventional`,
  via a Husky `commit-msg` hook). Use Conventional Commits format.
- A Husky `pre-commit` hook runs `lint-staged` (Prettier on staged
  `*.{js,ts,jsx,tsx}`). Don't bypass with `--no-verify` to "fix" formatting
  failures; fix the formatting instead.
- Each app has its own `lint` script (ESLint, `--max-warnings 0`).
  The extension also has a standalone
  `typecheck` script (`tsc --noEmit`) since WXT doesn't type-check on save.
