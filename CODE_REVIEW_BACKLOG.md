# Code Review Backlog — 2026-04-29

Review of all local changes (uncommitted + last 3 commits) at HEAD `5d364cf1`.
Scope: ~2.5k diff lines + 11 new files spanning UI library, editor canvas/hotkeys,
chat input, comments, projects/select, stores, tRPC, desktop release workflow.

| ID | Status |
|----|--------|
| CR-001 | auto-fixed |
| CR-002 | open |
| CR-003 | open |
| CR-004 | open |
| CR-005 | open |
| CR-006 | open |
| CR-007 | open |
| CR-008 | open |
| CR-009 | open |
| CR-010 | open |
| CR-011 | open |
| CR-012 | open |
| CR-013 | open |
| CR-014 | open |

---

## CR-001 — `SIDEBAR_INSERT` hotkey advertised but unbound  *(auto-fixed)*

- **Area:** [canvas/hotkeys/index.tsx](apps/web/client/src/app/project/[id]/_components/canvas/hotkeys/index.tsx), [hotkey.ts](apps/web/client/src/components/hotkey.ts), [design-panel/index.tsx](apps/web/client/src/app/project/[id]/_components/left-panel/design-panel/index.tsx)
- **Type:** bug
- **Impact:** user-facing
- **Risk:** low
- **Summary:** `Hotkey.SIDEBAR_INSERT` (alt+a) was added and exposed as the keyboard shortcut for the new Insert tab in the left-panel tab list and tooltip, but no `useHotkeys` registration existed for it. Pressing alt+a did nothing. All siblings (`SIDEBAR_LAYERS`/`BRAND`/`PAGES`/`IMAGES`/`BRANCHES`/`SEARCH`) are wired.
- **Fix applied:** added `useHotkeys(Hotkey.SIDEBAR_INSERT.command, () => toggleLeftPanelTab(LeftPanelTabValue.INSERT), { preventDefault: true })` next to the other sidebar bindings. Pattern matches existing wirings exactly.

---

## CR-002 — UI focus-ring refactor leaves inconsistent ring widths across components

- **Area:** [packages/ui/src/globals.css](packages/ui/src/globals.css), [packages/ui/src/components/](packages/ui/src/components/) (badge, button, checkbox, dialog, input, navigation-menu, radio-group, scroll-area, select, sheet, sidebar, slider, switch, tabs, toggle, accordion, color-picker)
- **Type:** design debt / a11y
- **Impact:** user-facing (focus-visible appearance)
- **Risk:** low
- **Summary:** Global rule was added to `globals.css` (`button/[role=button]/a/input/select/textarea/summary:focus-visible` → `outline-hidden ring-2 ring-ring ring-offset-2`). At the same time many per-component `focus-visible:ring-[3px]` and `focus-visible:border-ring` classes were *removed* from some components (Accordion, Badge, NavigationMenu, ScrollArea, Select, Sheet) but *kept* on others (Switch, Toggle, RadioGroupItem, Checkbox, Input, Tabs, Slider). The result is that some focusable controls now show a `ring-2` focus ring (from global) while others compose `ring-2` + `ring-[3px]` (from class) producing a thicker ring. Visually inconsistent.
- **Suggested approach:** pick one source of truth. Either remove the remaining per-component `focus-visible:*` classes and rely entirely on the global rule, or keep per-component classes and remove the global rule. Audit Storybook/dev to confirm.

---

## CR-003 — ColorPicker `Input` lost inset focus ring; global focus rule will overflow tight UI

- **Area:** [color-picker/ColorPicker.tsx:13](packages/ui/src/components/color-picker/ColorPicker.tsx)
- **Type:** bug (regression)
- **Impact:** user-facing
- **Risk:** medium
- **Summary:** Removed `outline-0 focus:ring-1 ring-inset ring-foreground-active` from the `tw\`...\`` input styling. The input is still an `<input>` element so the new global rule (`input:focus-visible { ring-2 ring-ring ring-offset-2 }`) applies an *offset* ring that protrudes outside the picker chrome. Inset ring was deliberate.
- **Suggested approach:** restore an inset ring locally, e.g. `focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-foreground-active focus-visible:ring-offset-0`, and override the offset from the global. Verify in the live picker.

---

## CR-004 — Search `useMemo` deps invalidate on every render; BFS uses `Array.shift()`

- **Area:** [search-tab/use-search.ts:128-195](apps/web/client/src/app/project/[id]/_components/left-panel/design-panel/search-tab/use-search.ts)
- **Type:** performance
- **Impact:** internal
- **Risk:** low
- **Summary:** `allFrames`, `selectedFrameIds`, `layerRoots`, `layerSizes` are recomputed each render (each `.filter`/`.map` returns a new array reference), so the result `useMemo` recomputes the entire BFS on every render even when `debounced`/`filter`/`scope` haven't changed. Additionally, the traversal uses `stack.shift()` which is O(n²) on large element trees (a queue should use a write-only index, or DFS via `pop()`).
- **Suggested approach:** stabilize deps with `useMemo`/`useCallback` or use a content key (e.g. concat of `frameId:rootDomId` plus a layer-mapping version counter). Switch traversal to `stack.pop()` for DFS, or use a dedicated queue. Worth measuring on a large frame.

---

## CR-005 — Reasoning content disappears as soon as streaming ends

- **Area:** [chat-messages/message-content/index.tsx:52-66](apps/web/client/src/app/project/[id]/_components/right-panel/chat-tab/chat-messages/message-content/index.tsx)
- **Type:** UX regression
- **Impact:** user-facing
- **Risk:** medium
- **Summary:** Previously `Reasoning` was always rendered (with shimmer styles only while streaming). Now it returns `null` unless `isStream && isLastPart`. Once the assistant finishes, the user can no longer expand/inspect what the model was thinking — the reasoning content vanishes from the conversation. Search/audit/debug becomes harder.
- **Suggested approach:** confirm intent with PM/design. If the goal was just to stop the shimmer post-stream, keep rendering `Reasoning` but only apply the shimmer/animate classes while `isStream && isLastPart`. Avoid hiding the content entirely.

---

## CR-006 — Iframe live preview no longer sets `referrerPolicy="no-referrer"`

- **Area:** [project-preview-surface.tsx:97-110](apps/web/client/src/app/projects/_components/select/project-preview-surface.tsx)
- **Type:** privacy / security
- **Impact:** user-facing
- **Risk:** low
- **Summary:** The redesigned project tile iframe dropped `referrerPolicy="no-referrer"`. Each project tile now leaks the projects-page Referer to the embedded site on load. Minor but cheap to restore.
- **Suggested approach:** re-add `referrerPolicy="no-referrer"` (and consider `sandbox` to prevent third-party JS in the previewed site from running freely against an iframe context attached to onlook.com).

---

## CR-007 — `WRAP_IN_DIV` (cmd+alt+g) is identical to `GROUP` (cmd+g)

- **Area:** [hotkey.ts:43-44](apps/web/client/src/components/hotkey.ts), [canvas/hotkeys/index.tsx:185-191](apps/web/client/src/app/project/[id]/_components/canvas/hotkeys/index.tsx)
- **Type:** UX / inconsistency
- **Impact:** user-facing
- **Risk:** low
- **Summary:** `Hotkey.WRAP_IN_DIV` was added as `mod+alt+g` with the label "Wrap in Div", and `UNGROUP` was renamed to "Unwrap parent". Both `GROUP` and `WRAP_IN_DIV` are routed to the same `editorEngine.group.groupSelectedElements()`, so they behave identically despite the different label. If "Wrap in Div" is intended to behave differently (e.g. always wrap a single element in a fresh div regardless of selection count), the handler needs to diverge.
- **Suggested approach:** decide whether `WRAP_IN_DIV` is just a marketing label for `GROUP` or a separate operation, then either drop the duplicate hotkey or implement a distinct `wrapInDiv` action.

---

## CR-008 — Default chat model hardcoded to `OPENROUTER_MODELS.KIMI_K2_6`

- **Area:** [chat-tab-content/index.tsx:19](apps/web/client/src/app/project/[id]/_components/right-panel/chat-tab/chat-tab-content/index.tsx)
- **Type:** maintainability
- **Impact:** user-facing
- **Risk:** medium
- **Summary:** Default state is now `OPENROUTER_MODELS.KIMI_K2_6` instead of `CHAT_MODEL_OPTIONS[0]!.model`. If KIMI_K2_6 is removed from `CHAT_MODEL_OPTIONS`, the dropdown will show "Model" with no current option but the request will still be sent against a model that may be unsupported on the backend (or the Select shows blank). Coupling the default to the canonical option list is safer.
- **Suggested approach:** route the default through `CHAT_MODEL_OPTIONS` (e.g. find the entry whose `.model === OPENROUTER_MODELS.KIMI_K2_6` and fall back to `[0]`), or persist the user's last choice and use that.

---

## CR-009 — Model selector hides label under 260px container

- **Area:** [chat-input/model-selector.tsx:42](apps/web/client/src/app/project/[id]/_components/right-panel/chat-tab/chat-input/model-selector.tsx)
- **Type:** UX
- **Impact:** user-facing
- **Risk:** low
- **Summary:** `<span className="@[260px]:inline hidden ...">` only shows the model label when the container is ≥260px wide. On a narrow chat panel the user sees only a chevron — no indication of which model is active.
- **Suggested approach:** keep a short truncated form (e.g. icon + first letters) below the breakpoint, or render a tooltip on hover that always shows the current model.

---

## CR-010 — Mobile/desktop layout swap may flicker and drop unmounted state

- **Area:** [main.tsx:36-130](apps/web/client/src/app/project/[id]/_components/main.tsx)
- **Type:** UX / refactor
- **Impact:** user-facing
- **Risk:** low
- **Summary:** Renders `null` until `useEffect` measures `window.innerWidth`, then conditionally renders `<MobileLayout/>` vs the desktop tree. On viewport resize across the 768px breakpoint the entire editor (Canvas, ChatTab, modals) unmounts and remounts. Brief blank flash on first paint, plus loss of any local component state at the boundary.
- **Suggested approach:** prefer CSS-driven hide/show with both layouts in the DOM at all times, OR use `matchMedia` and an SSR-aware default to avoid the `null` first paint. Only swap the tree if there's strong reason (e.g. touch vs pointer event handling).

---

## CR-011 — Comments router writes user metadata as `authorName` without sanitation

- **Area:** [routers/comment/comment.ts:43-46](apps/web/client/src/server/api/routers/comment/comment.ts), [routers/comment/reply.ts:30-33](apps/web/client/src/server/api/routers/comment/reply.ts)
- **Type:** privacy / display safety
- **Impact:** user-facing
- **Risk:** low/medium
- **Summary:** `authorName` now falls back to `ctx.user.user_metadata?.name ?? ctx.user.user_metadata?.full_name ?? ctx.user.email`. Supabase user_metadata is user-controllable (set during signup or via update profile) — an author can put arbitrary content (including emoji, RTL, or impersonation strings) into it and it will be displayed verbatim everywhere. Also reveals the user's real name on what was previously an email-only display, which is a small privacy shift.
- **Suggested approach:** decide whether you want to (a) display real names (then add length/character validation server-side, and consider a separate `display_name` field) or (b) keep email-only. If displaying name, render with explicit text node only (not innerHTML) — confirm the comments-tab/popover rendering escapes properly.

---

## CR-012 — Desktop release uses `npm install` in a Bun monorepo

- **Area:** [.github/workflows/desktop-release.yml](.github/workflows/desktop-release.yml), [apps/desktop/RELEASES.md](apps/desktop/RELEASES.md)
- **Type:** DX / build correctness
- **Impact:** infra
- **Risk:** medium
- **Summary:** CLAUDE.md states "Use Bun for all installs and scripts; do not use npm, yarn, or pnpm." The new workflow runs `npm install` in `apps/desktop/`. If the Electron app shares any workspace deps with the monorepo, the npm-resolved tree may differ from the Bun lockfile and ship a different version of a transitive dep than what local devs/CI test. Also there's no lockfile commit produced — `npm install` creates a `package-lock.json` that is not tracked, so installs are non-deterministic.
- **Suggested approach:** switch to `bun install --frozen-lockfile` (matching the rest of the monorepo) or commit a `package-lock.json` in `apps/desktop` and use `npm ci`. Either way, lock the install for reproducibility.

---

## CR-013 — `parseRepoUrl` regex matches any host containing the substring "github.com/"

- **Area:** [routers/github.ts:11-23](apps/web/client/src/server/api/routers/github.ts)
- **Type:** security (low blast radius)
- **Impact:** internal
- **Risk:** low
- **Summary:** Regex `github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$` will accept `https://evilgithub.com/owner/repo` (subdomain attack: substring still matches). The mutation runs against the user's authenticated Octokit, so an attacker-controlled `repoUrl` could only cause API calls against `owner/repo` on the real GitHub anyway (Octokit ignores the host string), so the practical impact is limited — but the validation gives a false sense of safety.
- **Suggested approach:** parse with `new URL(repoUrl)` and assert `u.hostname === 'github.com' || u.hostname === 'www.github.com'`. Then take the first two path segments.

---

## CR-014 — `static-templates.tsx` `id: string` decouples from alias map keys

- **Area:** [static-templates.tsx:9](apps/web/client/src/app/projects/_components/templates/static-templates.tsx), [select/index.tsx:48-90](apps/web/client/src/app/projects/_components/select/index.tsx)
- **Type:** maintainability
- **Impact:** internal
- **Risk:** low
- **Summary:** `StaticTemplate.id` is typed as `string`. `STATIC_TEMPLATE_ALIASES` and the `templateNames` map in `select/index.tsx` use `Record<StaticTemplate['id'], …>` which collapses to `Record<string, …>` — adding a new TEMPLATES entry will not produce a TS error if its alias entry is missing, and `availableStaticTemplateIds` will silently drop it.
- **Suggested approach:** narrow the id with a literal-union type (`'portfolio' | 'saas' | …`) and reuse it across both files. Then missing aliases become compile errors.

