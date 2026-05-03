---
name: weblab
description: Activate Weblab MCP mode — gives you file, bash, search, and project-info tools to build and edit Next.js + TailwindCSS projects within the Weblab editor environment.
---

# Weblab MCP

You now have access to the **weblab** MCP server. Use its tools to read, edit, and run code in the current project.

## Available Tools

| Tool | When to use |
|------|------------|
| `read_file` | Read any file with line numbers. Supports offset/limit for large files. |
| `write_file` | Create or overwrite a file. Parent dirs are created automatically. |
| `search_replace` | Targeted in-file edit: find an exact string and replace it. Use when you know the exact text to change. `old_string` must be unique unless `replace_all=true`. |
| `list_files` | List a directory's immediate children (dirs first). |
| `glob` | Find files matching a pattern, e.g. `**/*.tsx`, `src/**/*.ts`. |
| `grep` | Regex search across a file or tree. Returns `file:line: content`. |
| `bash` | Run any shell command. Defaults to the project root. Use for `git`, `bun`, `npm`, etc. |
| `typecheck` | Run `bun typecheck` and see TypeScript errors. |

## MCP Resource

`weblab://project` — project name, root path, current git branch, and top-level file tree. Read it first when you need project orientation.

## Conventions for this codebase (Weblab / @onlook)

- **Brand**: product is **Weblab** (weblab.build). Always use `APP_NAME` from `packages/constants/src/editor.ts` in user-facing strings — never hardcode "Onlook" or "Weblab".
- **Package scope**: `@onlook/*` — do not rename.
- **Package manager**: Bun only (`bun add`, `bun run`). Never npm/yarn/pnpm.
- **Stack**: Next.js App Router + TailwindCSS 4 + tRPC + Supabase + MobX + Radix UI.
- **Path aliases**: `@/*` and `~/*` → `apps/web/client/src/*`.
- **UI components**: prefer `@onlook/ui` over custom; use `dark` theme by default.
- **i18n**: all user-facing strings go in `apps/web/client/messages/*`, not hardcoded.
- **Server vs client**: default to Server Components; add `'use client'` only for events, state, browser APIs.
- **MobX stores**: create with `useState(() => new Store())`, never `useMemo`.

## Workflow

1. Read `weblab://project` (or `read_file` a key file) to orient yourself.
2. Use `glob` / `grep` to find relevant files before editing.
3. Prefer `search_replace` over `write_file` for targeted edits — smaller diff, less risk.
4. Run `typecheck` after edits to confirm no type regressions.
5. Use `bash` for `bun lint`, `git status`, `git diff`, or running tests.

## Roadmap tools (not yet implemented)

These are planned for future MCP versions:
- `create_branch` / `switch_branch` — git branch management via tRPC
- `deploy` — trigger a Vercel deployment
- `visual_edit` — apply Tailwind changes to a DOM element via Weblab's penpal bridge
- `mcp_in_project` — read/write MCP configs for a user's Weblab project
