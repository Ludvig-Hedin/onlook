import type { NodeApi, RowRendererProps, TreeApi } from 'react-arborist';
import { useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Tree } from 'react-arborist';
import useResizeObserver from 'use-resize-observer';

import type { LayerNode } from '@onlook/models/element';

import { useEditorEngine } from '@/components/store/editor';
import { RightClickMenu } from '../../../right-click-menu';
import { TreeNode } from './tree/tree-node';
import { TreeRow } from './tree/tree-row';

const getLayerTreeNodeId = (node: Pick<LayerNode, 'frameId' | 'domId'>) =>
    `${node.frameId}:${node.domId}`;

export const LayersTab = observer(() => {
    const treeRef = useRef<TreeApi<LayerNode>>(null);
    const editorEngine = useEditorEngine();
    const [treeHovered, setTreeHovered] = useState(false);
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
                console.log('No index change');
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
        [],
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

    const childrenAccessor = useCallback(
        (node: LayerNode) => {
            const children = node.children
                ?.map((child) => editorEngine.ast.mappings.getLayerNode(node.frameId, child))
                .filter((child) => child !== undefined)!;

            return children?.length ? children : null;
        },
        [editorEngine.ast.mappings],
    );

    const layers = editorEngine.ast.mappings.filteredLayers;

    return (
        <div
            id="layer-tab-id"
            ref={ref}
            className="text-active flex h-full w-full overflow-hidden p-3 text-xs"
            onMouseOver={() => setTreeHovered(true)}
            onMouseLeave={handleMouseLeaveTree}
        >
            <RightClickMenu>
                {layers.length === 0 ? (
                    <div className="text-foreground-primary/50 flex h-full w-full items-center justify-center">
                        No layers available yet
                    </div>
                ) : (
                    <Tree
                        idAccessor={getLayerTreeNodeId}
                        childrenAccessor={childrenAccessor}
                        ref={treeRef}
                        data={layers}
                        openByDefault={true}
                        overscanCount={0}
                        indent={8}
                        padding={0}
                        rowHeight={24}
                        height={Math.max((height ?? 8) - 8, 100)}
                        width={width ?? 365}
                        renderRow={(props: RowRendererProps<LayerNode>) => (
                            <TreeRow {...props} />
                        )}
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
