import type { FrameworkAdapter, ProjectFiles, ValidationResult } from '../types';

/**
 * Adapter for plain static HTML websites. Unlike the React framework
 * adapters this does NOT require a `package.json` — users can drop a folder
 * containing `index.html` (and optional CSS/JS/asset files) and get a
 * working preview.
 *
 * Visual editing for this framework requires the HTML editor pipeline
 * (Phase 4); validation alone is sufficient for upload + preview to work.
 *
 * NOTE: `template.codesandboxId` is a placeholder. Author a CodeSandbox
 * template "Static HTML site" that runs `npx serve .` (or similar) as the
 * `dev` task on a known port and replace the id below.
 */
export const staticHtmlAdapter: FrameworkAdapter = {
    id: 'static-html',
    displayName: 'Static HTML',
    template: {
        // TODO(framework): replace with real static-HTML CodeSandbox template id
        codesandboxId: 'TODO_STATIC_HTML_TEMPLATE_ID',
        port: 3000,
        devTask: 'dev',
        staticHosting: true,
    },
    pipelines: ['html'],
    validate(files: ProjectFiles): ValidationResult {
        // Match index.html case-insensitively so projects authored on
        // case-insensitive filesystems (Windows/macOS) with `Index.html` or
        // `INDEX.HTML` validate correctly.
        const hasIndexHtml = files.some((f) => f.path.toLowerCase() === 'index.html');
        if (!hasIndexHtml) {
            return {
                isValid: false,
                error: 'No index.html found at the project root. Static HTML projects require an index.html file.',
            };
        }
        return { isValid: true };
    },
};
