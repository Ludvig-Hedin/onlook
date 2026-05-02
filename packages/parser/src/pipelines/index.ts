import type { EditorPipeline, EditorPipelineId } from './types';
import { htmlPipeline } from './html';
import { jsxPipeline } from './jsx';

export type { EditorPipeline, EditorPipelineId, OidInjectionResult } from './types';
export { htmlPipeline, type HtmlAst } from './html';
export { injectPreloadScriptIntoHtml } from './html/inject-preload';
export { jsxPipeline } from './jsx';

/**
 * Pipeline list and lookup map are built lazily on first access. This
 * avoids a TDZ pitfall: the parser barrel `src/index.ts` re-exports both
 * `./pipelines` and the underlying modules (`./code-edit`, `./ids`, etc.)
 * that the JSX pipeline depends on. Building the array eagerly at module
 * scope can race against partially-initialized circular re-exports under
 * Bun's ESM loader.
 *
 * Order matters: the first matching pipeline wins. JSX runs first as it's
 * the most common case; HTML handles `.html`/`.htm`.
 */
function buildPipelines(): ReadonlyArray<EditorPipeline> {
    return [jsxPipeline, htmlPipeline];
}

let cachedPipelines: ReadonlyArray<EditorPipeline> | null = null;
let cachedById: Map<EditorPipelineId, EditorPipeline> | null = null;

function getCachedPipelines(): ReadonlyArray<EditorPipeline> {
    cachedPipelines ??= buildPipelines();
    return cachedPipelines;
}

function getCachedById(): Map<EditorPipelineId, EditorPipeline> {
    cachedById ??= new Map(getCachedPipelines().map((p) => [p.id, p]));
    return cachedById;
}

/**
 * Returns the first pipeline whose `fileMatcher` matches `path`, or null if
 * no pipeline applies (binary file, unknown extension, etc.).
 */
export function selectPipeline(path: string): EditorPipeline | null {
    for (const pipeline of getCachedPipelines()) {
        if (pipeline.fileMatcher.test(path)) return pipeline;
    }
    return null;
}

/**
 * Direct lookup by id. Useful for adapters that want to assert a specific
 * pipeline is present in the registry.
 */
export function getPipeline(id: EditorPipelineId): EditorPipeline | null {
    return getCachedById().get(id) ?? null;
}

/** All registered pipelines. */
export function listPipelines(): ReadonlyArray<EditorPipeline> {
    return getCachedPipelines();
}
