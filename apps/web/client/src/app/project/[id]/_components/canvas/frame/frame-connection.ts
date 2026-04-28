interface FrameConnectionState {
    preloadScriptReady: boolean;
    isConnecting: boolean;
    hasTimedOut: boolean;
    isPenpalConnected: boolean;
}

interface CodeSandboxPreviewState {
    isCodeSandboxFrame: boolean;
    isPenpalConnected: boolean;
}

export function isFrameBridgeReady({
    preloadScriptReady,
    isConnecting,
    hasTimedOut,
    isPenpalConnected,
}: FrameConnectionState): boolean {
    return preloadScriptReady && isPenpalConnected && !(isConnecting && !hasTimedOut);
}

export function shouldUnlockCodeSandboxPreview({
    isCodeSandboxFrame,
    isPenpalConnected,
}: CodeSandboxPreviewState): boolean {
    return isCodeSandboxFrame && !isPenpalConnected;
}
