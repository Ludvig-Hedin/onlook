import type { DefaultTreeAdapterMap } from 'parse5';
import { parse, serialize } from 'parse5';

type Element = DefaultTreeAdapterMap['element'];
type Node = DefaultTreeAdapterMap['node'];

function isElement(node: Node): node is Element {
    return 'tagName' in node && Array.isArray((node as Element).attrs);
}

function findElement(root: Node, tagName: string): Element | null {
    if (isElement(root) && root.tagName === tagName) return root;
    if ('childNodes' in root) {
        for (const child of root.childNodes) {
            const found = findElement(child as Node, tagName);
            if (found) return found;
        }
    }
    return null;
}

function buildScriptElement(parent: Element, src: string): Element {
    return {
        nodeName: 'script',
        tagName: 'script',
        attrs: [
            { name: 'src', value: src },
            // Defer so the editor's preload runs after document parse, matching
            // the JSX equivalent which is injected as a Next.js <Script
            // strategy="beforeInteractive">.
            { name: 'defer', value: '' },
        ],
        namespaceURI: 'http://www.w3.org/1999/xhtml',
        childNodes: [],
        parentNode: parent,
    } as Element;
}

/**
 * Idempotently inject a `<script src="...">` tag into the `<head>` of an
 * HTML document. Used for static-HTML projects so the editor preload
 * script (which sets up the Penpal RPC channel between the iframe and the
 * editor) loads alongside the page.
 *
 * If the document has no `<head>` (rare; parse5 usually synthesizes one),
 * the script is appended to `<html>`. Returns the original content
 * unchanged if a script tag with the same `src` already exists, so it's
 * safe to call this on every upload.
 */
export function injectPreloadScriptIntoHtml(content: string, scriptSrc: string): string {
    const ast = parse(content);
    const html = findElement(ast, 'html');
    const head = findElement(ast, 'head') ?? html;
    if (!head) {
        // No html/head — the document is too malformed to mutate safely.
        return content;
    }
    const existing = head.childNodes.find(
        (node) =>
            isElement(node as Node) &&
            (node as Element).tagName === 'script' &&
            (node as Element).attrs.some((a) => a.name === 'src' && a.value === scriptSrc),
    );
    if (existing) return content;

    const script = buildScriptElement(head, scriptSrc);
    // Prepend so the script runs before any inline page scripts; this
    // matches Next.js's `beforeInteractive` strategy.
    head.childNodes.unshift(script);
    return serialize(ast);
}
