import { CSB_DOMAIN } from '@onlook/constants';

export function isCodeSandboxPreviewUrl(url: string): boolean {
    try {
        return new URL(url).hostname.endsWith(CSB_DOMAIN);
    } catch {
        return false;
    }
}
