# UX + QA Fixes - 2026-04-29

This note tracks the implementation work completed from the UX + QA audit.

## Completed

- Replaced broken client-side `redirect()` usage in project open and project-exit flows with client navigation.
- Restored access to template-only accounts on the projects page by removing the false empty-state dead end.
- Added a clearer first-run path from the landing hero into the product and re-enabled the GitHub import entry point.
- Tightened local import validation so the supported stack claim matches the actual checks more closely.
- Added visible inline import error feedback and a direct folder-selection recovery action.
- Shipped a real keyboard shortcuts modal for the editor and connected it to the existing `Cmd/Ctrl + K` shortcut.
- Turned Preferences into an actual settings surface by exposing chat visibility controls and a shortcuts entry point.
- Repaired the branch so `bun run typecheck` passes again.

## Verification

- `bun run typecheck`
- Targeted ESLint run on the changed files completed without errors. Remaining output was formatting-only warnings in files that already carry broader in-progress edits.
