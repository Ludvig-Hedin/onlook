import { describe, expect, test } from 'bun:test';

import {
    isFrameBridgeReady,
    shouldUnlockCodeSandboxPreview,
} from '@/app/project/[id]/_components/canvas/frame/frame-connection';

describe('isFrameBridgeReady', () => {
    test('returns true only when preload and Penpal are both ready', () => {
        expect(
            isFrameBridgeReady({
                preloadScriptReady: true,
                isConnecting: false,
                hasTimedOut: false,
                isPenpalConnected: true,
            }),
        ).toBe(true);
    });

    test('returns false while Penpal is still disconnected', () => {
        expect(
            isFrameBridgeReady({
                preloadScriptReady: true,
                isConnecting: false,
                hasTimedOut: false,
                isPenpalConnected: false,
            }),
        ).toBe(false);
    });

    test('returns false while the sandbox is still connecting', () => {
        expect(
            isFrameBridgeReady({
                preloadScriptReady: true,
                isConnecting: true,
                hasTimedOut: false,
                isPenpalConnected: true,
            }),
        ).toBe(false);
    });

    test('returns true after the slow-connect timeout has elapsed and Penpal is connected', () => {
        expect(
            isFrameBridgeReady({
                preloadScriptReady: true,
                isConnecting: true,
                hasTimedOut: true,
                isPenpalConnected: true,
            }),
        ).toBe(true);
    });
});

describe('shouldUnlockCodeSandboxPreview', () => {
    test('returns true for disconnected CodeSandbox previews', () => {
        expect(
            shouldUnlockCodeSandboxPreview({
                isCodeSandboxFrame: true,
                isPenpalConnected: false,
            }),
        ).toBe(true);
    });

    test('returns false once the CodeSandbox preview bridge is connected', () => {
        expect(
            shouldUnlockCodeSandboxPreview({
                isCodeSandboxFrame: true,
                isPenpalConnected: true,
            }),
        ).toBe(false);
    });

    test('returns false for non-CodeSandbox previews', () => {
        expect(
            shouldUnlockCodeSandboxPreview({
                isCodeSandboxFrame: false,
                isPenpalConnected: false,
            }),
        ).toBe(false);
    });
});
