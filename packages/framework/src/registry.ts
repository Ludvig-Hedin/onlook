import type { FrameworkAdapter, FrameworkId } from './types';
import { astroAdapter } from './adapters/astro';
import { nextjsAdapter } from './adapters/nextjs';
import { remixAdapter } from './adapters/remix';
import { staticHtmlAdapter } from './adapters/static-html';
import { tanstackStartAdapter } from './adapters/tanstack-start';
import { viteReactAdapter } from './adapters/vite-react';

/**
 * Registry of all supported framework adapters. New adapters added in later
 * phases register here.
 *
 * Order matters for UI listings — the framework picker renders in this
 * order, with `nextjsAdapter` first as the default. Adapters whose
 * `template.codesandboxId` is still a TODO_* placeholder are present so the
 * abstraction is exercised, but the picker UI gates them behind the
 * `NEXT_PUBLIC_MULTI_FRAMEWORK_ENABLED` feature flag (see
 * `apps/web/client/src/env.ts`).
 */
const ADAPTERS: ReadonlyArray<FrameworkAdapter> = [
    nextjsAdapter,
    viteReactAdapter,
    remixAdapter,
    astroAdapter,
    tanstackStartAdapter,
    staticHtmlAdapter,
];

const ADAPTER_BY_ID = new Map<FrameworkId, FrameworkAdapter>(
    ADAPTERS.map((adapter) => [adapter.id, adapter]),
);

/**
 * Returns the adapter for the given framework id, or the Next.js adapter as
 * a safe fallback. Falling back rather than throwing keeps the editor open
 * for projects whose framework column was written by a future version of
 * the app or has been corrupted.
 */
export function getFrameworkAdapter(id: string | null | undefined): FrameworkAdapter {
    if (!id) return nextjsAdapter;
    return ADAPTER_BY_ID.get(id as FrameworkId) ?? nextjsAdapter;
}

/**
 * The default adapter used when creating a new project without an explicit
 * framework choice (preserves pre-multi-framework behavior).
 */
export const DEFAULT_FRAMEWORK_ADAPTER: FrameworkAdapter = nextjsAdapter;

/**
 * All registered adapters in display order. Use for rendering pickers.
 */
export function listFrameworkAdapters(): ReadonlyArray<FrameworkAdapter> {
    return ADAPTERS;
}

/**
 * True if more than one adapter is registered. Used to decide whether the
 * framework picker UI should render at all (vs. hidden because there's
 * nothing to pick).
 */
export function hasMultipleFrameworks(): boolean {
    return ADAPTERS.length > 1;
}

/**
 * True if the adapter is "production-ready" — its CodeSandbox template id
 * is real, not a placeholder. The picker uses this to hide adapters that
 * are wired up in code but haven't been finished operationally.
 */
export function isFrameworkReady(adapter: FrameworkAdapter): boolean {
    return !adapter.template.codesandboxId.startsWith('TODO_');
}

/** Convenience: all adapters whose CodeSandbox template is real. */
export function listReadyFrameworkAdapters(): ReadonlyArray<FrameworkAdapter> {
    return ADAPTERS.filter(isFrameworkReady);
}
