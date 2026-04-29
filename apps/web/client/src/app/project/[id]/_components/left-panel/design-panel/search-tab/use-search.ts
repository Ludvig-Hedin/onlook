import { useCallback, useEffect, useMemo, useState } from 'react';

import { CoreElementType, type LayerNode } from '@onlook/models/element';

import { useEditorEngine } from '@/components/store/editor';

export type SearchFilter = 'all' | 'frames' | 'text' | 'images' | 'components';
export type SearchScope = 'page' | 'frame';

export type MatchField = 'tagName' | 'textContent' | 'htmlId' | 'component';

export interface MatchInfo {
    matchField: MatchField;
    matchSnippet: string;
    matchStart: number;
    matchEnd: number;
}

export interface SearchResult extends MatchInfo {
    id: string;
    frameId: string;
    frameName: string;
    layer: LayerNode;
}

const MAX_RESULTS = 500;
const DEBOUNCE_MS = 120;

const FIELD_PRIORITY: Record<MatchField, number> = {
    textContent: 0,
    component: 0,
    htmlId: 1,
    tagName: 2,
};

export const matchLayer = (
    node: LayerNode,
    query: string,
    filter: SearchFilter,
): MatchInfo | null => {
    const q = query.toLowerCase();
    const candidates: { field: MatchField; value: string }[] = [];

    const isFrame = node.coreElementType === CoreElementType.BODY_TAG || node.tagName === 'body';
    const isImage = node.tagName === 'img';

    if ((filter === 'frames' || filter === 'all') && isFrame) {
        candidates.push({ field: 'tagName', value: node.tagName });
    }
    if ((filter === 'images' || filter === 'all') && isImage) {
        if (node.htmlId) candidates.push({ field: 'htmlId', value: node.htmlId });
        candidates.push({ field: 'tagName', value: node.tagName });
    }
    if ((filter === 'components' || filter === 'all') && node.component) {
        candidates.push({ field: 'component', value: node.component });
    }
    if ((filter === 'text' || filter === 'all') && node.textContent?.trim()) {
        candidates.push({
            field: 'textContent',
            value: node.textContent.slice(0, 200),
        });
    }
    if (filter === 'all') {
        if (node.htmlId) candidates.push({ field: 'htmlId', value: node.htmlId });
        if (node.tagName && !isFrame && !isImage) {
            candidates.push({ field: 'tagName', value: node.tagName });
        }
    }

    let best: MatchInfo | null = null;
    for (const c of candidates) {
        const idx = c.value.toLowerCase().indexOf(q);
        if (idx < 0) continue;
        const info: MatchInfo = {
            matchField: c.field,
            matchSnippet: c.value,
            matchStart: idx,
            matchEnd: idx + q.length,
        };
        if (!best || FIELD_PRIORITY[info.matchField] < FIELD_PRIORITY[best.matchField]) {
            best = info;
        }
    }
    return best;
};

/**
 * Smart sort comparator for search results. Priorities (top wins):
 * 1. Exact equality of the match snippet against the query (case-insensitive).
 * 2. Field priority — textContent/component above htmlId above tagName.
 * 3. Earlier matchStart position first.
 * 4. Shorter matchSnippet length first.
 * 5. Stable original (frame, BFS) order via the seqIndex tiebreaker.
 */
const smartSortComparator = (query: string) => {
    const q = query.toLowerCase();
    return (a: SearchResult & { seqIndex: number }, b: SearchResult & { seqIndex: number }) => {
        const aExact = a.matchSnippet.toLowerCase() === q ? 0 : 1;
        const bExact = b.matchSnippet.toLowerCase() === q ? 0 : 1;
        if (aExact !== bExact) return aExact - bExact;

        const aField = FIELD_PRIORITY[a.matchField];
        const bField = FIELD_PRIORITY[b.matchField];
        if (aField !== bField) return aField - bField;

        if (a.matchStart !== b.matchStart) return a.matchStart - b.matchStart;
        if (a.matchSnippet.length !== b.matchSnippet.length) {
            return a.matchSnippet.length - b.matchSnippet.length;
        }
        return a.seqIndex - b.seqIndex;
    };
};

const frameDisplayName = (url: string, fallback: string): string => {
    try {
        const u = new URL(url);
        const path = u.pathname === '/' ? '/' : u.pathname.replace(/\/$/, '');
        return path || fallback;
    } catch {
        return fallback;
    }
};

export const useSearch = (query: string, filter: SearchFilter, scope: SearchScope) => {
    const editorEngine = useEditorEngine();
    const [debounced, setDebounced] = useState(query);
    const [activeIndex, setActiveIndex] = useState(0);
    const allFrames = editorEngine.frames.getAll();
    const selectedFrameIds = allFrames
        .filter((frameData) => frameData.selected)
        .map((frameData) => frameData.frame.id);
    const layerRoots = allFrames.map((frameData) => {
        const metadata = editorEngine.ast.mappings.getMetadata(frameData.frame.id);
        return metadata?.rootNode ?? null;
    });
    const layerSizes = allFrames.map((frameData) => {
        const metadata = editorEngine.ast.mappings.getMetadata(frameData.frame.id);
        return metadata?.domIdToLayerNode.size ?? 0;
    });

    useEffect(() => {
        const handle = setTimeout(() => setDebounced(query), DEBOUNCE_MS);
        return () => clearTimeout(handle);
    }, [query]);

    const { results, totalCount, truncated } = useMemo(() => {
        if (!debounced.trim()) {
            return { results: [] as SearchResult[], totalCount: 0, truncated: false };
        }

        const frames =
            scope === 'frame'
                ? allFrames.filter((frameData) => selectedFrameIds.includes(frameData.frame.id))
                : allFrames;

        const out: (SearchResult & { seqIndex: number })[] = [];
        let total = 0;
        let seq = 0;

        for (const frameData of frames) {
            const frameId = frameData.frame.id;
            const root = editorEngine.ast.mappings.getRootLayer(frameId);
            if (!root) continue;

            const frameName = frameDisplayName(frameData.frame.url, 'Frame');
            const stack: LayerNode[] = [root];
            while (stack.length) {
                const node = stack.shift()!;
                const m = matchLayer(node, debounced, filter);
                if (m) {
                    total++;
                    if (out.length < MAX_RESULTS) {
                        out.push({
                            id: `${frameId}:${node.domId}`,
                            frameId,
                            frameName,
                            layer: node,
                            seqIndex: seq++,
                            ...m,
                        });
                    }
                }
                if (node.children) {
                    for (const childId of node.children) {
                        const child = editorEngine.ast.mappings.getLayerNode(frameId, childId);
                        if (child) stack.push(child);
                    }
                }
            }
        }

        out.sort(smartSortComparator(debounced));
        const stripped: SearchResult[] = out.map(({ seqIndex: _seq, ...r }) => r);
        return { results: stripped, totalCount: total, truncated: total > MAX_RESULTS };
    }, [allFrames, debounced, editorEngine, filter, layerRoots, layerSizes, scope, selectedFrameIds]);

    useEffect(() => {
        setActiveIndex(0);
    }, [debounced, filter, scope]);

    const selectResult = useCallback(
        async (r: SearchResult) => {
            const frameData = editorEngine.frames.get(r.frameId);
            if (!frameData?.view) return;
            if (!frameData.selected) {
                editorEngine.frames.select([frameData.frame], false);
            }
            const el = await frameData.view.getElementByDomId(r.layer.domId, true);
            if (el) {
                editorEngine.elements.click([el]);
            }
        },
        [editorEngine],
    );

    const next = useCallback(() => {
        if (!results.length) return;
        const i = (activeIndex + 1) % results.length;
        setActiveIndex(i);
        const target = results[i];
        if (target) void selectResult(target);
    }, [results, activeIndex, selectResult]);

    const prev = useCallback(() => {
        if (!results.length) return;
        const i = (activeIndex - 1 + results.length) % results.length;
        setActiveIndex(i);
        const target = results[i];
        if (target) void selectResult(target);
    }, [results, activeIndex, selectResult]);

    const jumpTo = useCallback(
        (id: string) => {
            const i = results.findIndex((r) => r.id === id);
            if (i < 0) return;
            setActiveIndex(i);
            const target = results[i];
            if (target) void selectResult(target);
        },
        [results, selectResult],
    );

    return {
        results,
        totalCount,
        truncated,
        activeIndex,
        next,
        prev,
        jumpTo,
    };
};
