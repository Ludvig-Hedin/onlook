import type { NodeApi, RowRendererProps, TreeApi } from 'react-arborist';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Tree } from 'react-arborist';
import useResizeObserver from 'use-resize-observer';

import { EditorMode } from '@onlook/models';
import { type DropElementProperties, type LayerNode } from '@onlook/models/element';
import { Button } from '@onlook/ui/button';
import { Icons } from '@onlook/ui/icons';
import { Input } from '@onlook/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@onlook/ui/popover';
import { toast } from '@onlook/ui/sonner';

import { useEditorEngine } from '@/components/store/editor';
import { RightClickMenu } from '../../../right-click-menu';
import { TreeNode } from './tree/tree-node';
import { TreeRow } from './tree/tree-row';

const getLayerTreeNodeId = (node: Pick<LayerNode, 'frameId' | 'domId'>) =>
    `${node.frameId}:${node.domId}`;

const PLACEHOLDER_IMAGE_SRC =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
            <rect width="640" height="400" fill="#E5E7EB" />
            <rect x="80" y="80" width="480" height="240" rx="24" fill="#CBD5E1" />
            <path d="M170 270 275 165l60 60 95-95 120 140H170Z" fill="#94A3B8" />
            <circle cx="255" cy="160" r="28" fill="#F8FAFC" />
        </svg>`,
    );

const ELEMENT_PRESETS: Array<{
    key: string;
    label: string;
    description: string;
    properties: DropElementProperties;
}> = [
    {
        key: 'heading',
        label: 'Heading',
        description: 'Large section heading',
        properties: {
            tagName: 'h2',
            textContent: 'Heading',
            styles: {
                fontSize: '40px',
                lineHeight: '1.1',
                fontWeight: '700',
                color: '#111827',
            },
        },
    },
    {
        key: 'paragraph',
        label: 'Paragraph',
        description: 'Body copy block',
        properties: {
            tagName: 'p',
            textContent: 'Add your paragraph text here.',
            styles: {
                fontSize: '18px',
                lineHeight: '1.6',
                color: '#374151',
                maxWidth: '560px',
            },
        },
    },
    {
        key: 'div',
        label: 'Div',
        description: 'Generic layout block',
        properties: {
            tagName: 'div',
            textContent: null,
            styles: {
                width: '220px',
                height: '140px',
                borderRadius: '20px',
                backgroundColor: '#E0F2FE',
                border: '1px solid #7DD3FC',
            },
        },
    },
    {
        key: 'section',
        label: 'Section',
        description: 'Full-width content section',
        properties: {
            tagName: 'section',
            textContent: null,
            styles: {
                width: '100%',
                minHeight: '220px',
                padding: '40px',
                borderRadius: '28px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
            },
        },
    },
    {
        key: 'button',
        label: 'Button',
        description: 'Clickable call to action',
        properties: {
            tagName: 'button',
            textContent: 'Button',
            styles: {
                padding: '14px 22px',
                borderRadius: '9999px',
                backgroundColor: '#111827',
                color: '#FFFFFF',
                fontWeight: '600',
            },
        },
    },
    {
        key: 'image',
        label: 'Image',
        description: 'Placeholder image block',
        properties: {
            tagName: 'img',
            textContent: null,
            styles: {
                width: '320px',
                height: '220px',
                objectFit: 'cover',
                borderRadius: '24px',
                backgroundColor: '#E5E7EB',
            },
            attributes: {
                src: PLACEHOLDER_IMAGE_SRC,
                alt: 'Placeholder image',
            },
        },
    },
];

export const LayersTab = observer(() => {
    const treeRef = useRef<TreeApi<LayerNode>>(null);
    const editorEngine = useEditorEngine();
    const [treeHovered, setTreeHovered] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [paletteOpen, setPaletteOpen] = useState(false);
    const { ref, width, height } = useResizeObserver();

    useEffect(handleSelectChange, [
        editorEngine.elements.selected,
        editorEngine.ast.mappings.filteredLayers,
    ]);

    const handleMouseLeaveTree = useCallback(() => {
        setTreeHovered(false);
        editorEngine.overlay.state.updateHoverRect(null);
    }, [editorEngine.overlay.state]);

    function handleSelectChange() {
        if (editorEngine.elements.selected.length > 0 && editorEngine.elements.selected[0]) {
            treeRef.current?.scrollTo(getLayerTreeNodeId(editorEngine.elements.selected[0]));
        }
    }

    const handleDragEnd = useCallback(
        async ({
            dragNodes,
            parentNode,
            index,
        }: {
            dragNodes: NodeApi<LayerNode>[];
            parentNode: NodeApi<LayerNode> | null;
            index: number;
        }) => {
            if (!parentNode) {
                console.error('No parent found');
                return;
            }
            if (dragNodes.length !== 1) {
                console.error('Only one element can be dragged at a time');
                return;
            }
            const dragNode = dragNodes[0];
            if (!dragNode) {
                console.error('No drag node found');
                return;
            }
            const frameData = editorEngine.frames.get(dragNode.data.frameId);
            if (!frameData) {
                console.error('No frame data found');
                return;
            }
            const { view } = frameData;

            if (!view) {
                console.error('No frame view found');
                return;
            }

            const originalIndex: number | undefined = await view.getElementIndex(
                dragNode.data.domId,
            );

            if (originalIndex === undefined) {
                console.error('No original index found');
                return;
            }

            const childEl = await view.getElementByDomId(dragNode.data.domId, false);
            if (!childEl) {
                console.error('Failed to get element');
                return;
            }
            const parentEl = await view.getElementByDomId(parentNode.data.domId, false);
            if (!parentEl) {
                console.error('Failed to get parent element');
                return;
            }

            const newIndex = index > originalIndex ? index - 1 : index;

            if (newIndex === originalIndex) {
                return;
            }

            const moveAction = editorEngine.move.createMoveAction(
                view.id,
                childEl,
                parentEl,
                newIndex,
                originalIndex,
            );
            editorEngine.action.run(moveAction);
        },
        [editorEngine.action, editorEngine.frames, editorEngine.move],
    );

    const disableDrop = useCallback(
        ({
            parentNode,
            dragNodes,
        }: {
            parentNode: NodeApi<LayerNode> | null;
            dragNodes: NodeApi<LayerNode>[];
        }) => {
            return !dragNodes.every((node) => node?.parent?.id === parentNode?.id);
        },
        [],
    );

    const layers = editorEngine.ast.mappings.filteredLayers;

    const filteredTree = useMemo(() => {
        if (!searchQuery.trim()) {
            return {
                roots: layers,
                clonedNodeMap: null as Map<string, LayerNode> | null,
            };
        }

        const query = searchQuery.toLowerCase();
        const clonedNodeMap = new Map<string, LayerNode>();

        const matchesNode = (node: LayerNode): boolean => {
            const searchBlob = [
                node.tagName,
                node.textContent,
                node.component ?? '',
                node.htmlId ?? '',
                node.hasCustomAttributes ? 'attribute attributes attr attrs' : '',
                node.isInteractive ? 'interactive interaction action button click' : '',
            ]
                .join(' ')
                .toLowerCase();

            return searchBlob.includes(query);
        };

        const filterNode = (node: LayerNode): LayerNode | null => {
            const childNodes = (node.children ?? [])
                .map((childId) => editorEngine.ast.mappings.getLayerNode(node.frameId, childId))
                .filter((child): child is LayerNode => Boolean(child));
            const filteredChildren = childNodes
                .map((child) => filterNode(child))
                .filter((child): child is LayerNode => Boolean(child));

            if (!matchesNode(node) && filteredChildren.length === 0) {
                return null;
            }

            const clone: LayerNode = {
                ...node,
                children:
                    filteredChildren.length > 0
                        ? filteredChildren.map((child) => child.domId)
                        : null,
            };
            clonedNodeMap.set(getLayerTreeNodeId(clone), clone);
            return clone;
        };

        return {
            roots: layers
                .map((layer) => filterNode(layer))
                .filter((layer): layer is LayerNode => Boolean(layer)),
            clonedNodeMap,
        };
    }, [editorEngine.ast.mappings, layers, searchQuery]);

    const childrenAccessor = useCallback(
        (node: LayerNode) => {
            const sourceMap = filteredTree.clonedNodeMap;
            const children = node.children
                ?.map((child) =>
                    sourceMap
                        ? sourceMap.get(getLayerTreeNodeId({ frameId: node.frameId, domId: child }))
                        : editorEngine.ast.mappings.getLayerNode(node.frameId, child),
                )
                .filter((child): child is LayerNode => child !== undefined && child !== null);

            return children?.length ? children : null;
        },
        [editorEngine.ast.mappings, filteredTree.clonedNodeMap],
    );

    const handlePresetDragStart = useCallback(
        (event: React.DragEvent<HTMLButtonElement>, properties: DropElementProperties) => {
            event.dataTransfer.setData('application/json', JSON.stringify(properties));
            event.dataTransfer.effectAllowed = 'copy';
            editorEngine.state.setPendingInsertElement(null);
            editorEngine.state.setEditorMode(EditorMode.DESIGN);
        },
        [editorEngine.state],
    );

    const handlePresetClick = useCallback(
        (properties: DropElementProperties) => {
            editorEngine.state.setPendingInsertElement(properties);
            editorEngine.state.setInsertMode(null);
            editorEngine.state.setEditorMode(EditorMode.DESIGN);
            setPaletteOpen(false);
            toast('Click on the canvas to place this element.');
        },
        [editorEngine.state],
    );

    return (
        <div
            id="layer-tab-id"
            ref={ref}
            className="text-active flex h-full w-full flex-col overflow-hidden p-3 text-xs"
            onMouseOver={() => setTreeHovered(true)}
            onMouseLeave={handleMouseLeaveTree}
        >
            <div className="mb-2 flex items-center gap-2">
                <div className="relative flex-1">
                    <Input
                        className="h-8 pr-8 text-xs"
                        placeholder="Search layers"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            className="group absolute top-[1px] right-[1px] bottom-[1px] flex aspect-square items-center justify-center rounded-r-[calc(theme(borderRadius.md)-1px)]"
                            onClick={() => setSearchQuery('')}
                        >
                            <Icons.CrossS className="text-foreground-primary/50 group-hover:text-foreground-primary h-3 w-3" />
                        </button>
                    )}
                </div>
                <Popover open={paletteOpen} onOpenChange={setPaletteOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="default"
                            size="icon"
                            className="border-border-primary bg-background-secondary text-foreground-primary hover:border-border-onlook hover:bg-background-onlook h-fit w-fit border p-2"
                        >
                            <Icons.Plus />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" side="bottom" className="w-72 p-2">
                        <div className="mb-2 px-1">
                            <p className="text-sm font-medium">Add Element</p>
                            <p className="text-muted-foreground text-xs">
                                Drag onto the canvas or click to place next.
                            </p>
                        </div>
                        <div className="grid gap-1">
                            {ELEMENT_PRESETS.map((preset) => (
                                <button
                                    key={preset.key}
                                    type="button"
                                    draggable
                                    onDragStart={(event) =>
                                        handlePresetDragStart(event, preset.properties)
                                    }
                                    onClick={() => handlePresetClick(preset.properties)}
                                    className="hover:bg-background-onlook flex items-start justify-between rounded-md border border-transparent px-3 py-2 text-left transition-colors"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-foreground-primary text-sm">
                                            {preset.label}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            {preset.description}
                                        </span>
                                    </div>
                                    <Icons.DragHandleDots className="text-foreground-secondary mt-0.5 h-4 w-4" />
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <RightClickMenu>
                {filteredTree.roots.length === 0 ? (
                    <div className="text-foreground-primary/50 flex h-full w-full items-center justify-center">
                        {searchQuery ? 'No matching layers' : 'No layers available yet'}
                    </div>
                ) : (
                    <Tree
                        idAccessor={getLayerTreeNodeId}
                        childrenAccessor={childrenAccessor}
                        ref={treeRef}
                        data={filteredTree.roots}
                        openByDefault={true}
                        overscanCount={0}
                        indent={8}
                        padding={0}
                        rowHeight={24}
                        height={Math.max((height ?? 8) - 40, 100)}
                        width={width ?? 365}
                        renderRow={(props: RowRendererProps<LayerNode>) => <TreeRow {...props} />}
                        onActivate={async (node) => {
                            const frameData = editorEngine.frames.get(node.data.frameId);
                            if (!frameData?.view) return;
                            const el = await frameData.view.getElementByDomId(
                                node.data.domId,
                                true,
                            );
                            if (el) {
                                editorEngine.elements.click([el]);
                            }
                        }}
                        onMove={handleDragEnd}
                        disableDrop={disableDrop}
                        className="overflow-auto"
                    >
                        {(props) => <TreeNode {...props} treeHovered={treeHovered} />}
                    </Tree>
                )}
            </RightClickMenu>
        </div>
    );
});
