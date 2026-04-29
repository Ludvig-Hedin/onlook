export enum DynamicType {
    ARRAY = 'array',
    CONDITIONAL = 'conditional',
    UNKNOWN = 'unknown',
}

export enum CoreElementType {
    COMPONENT_ROOT = 'component-root',
    BODY_TAG = 'body-tag',
}

export interface LayerNode {
    domId: string;
    frameId: string;
    instanceId: string | null;
    oid: string | null;
    htmlId: string | null;
    textContent: string;
    tagName: string;
    isVisible: boolean;
    hasCustomAttributes: boolean;
    isInteractive: boolean;
    dynamicType: DynamicType | null;
    coreElementType: CoreElementType | null;
    component: string | null;
    children: string[] | null;
    parent: string | null;
}
