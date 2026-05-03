import type { UserCanvas as DbUserCanvas } from '@onlook/db';
import { DefaultSettings } from '@onlook/constants';

export const createDefaultUserCanvas = (
    userId: string,
    canvasId: string,
    overrides: Partial<DbUserCanvas> = {},
): DbUserCanvas => {
    return {
        userId,
        canvasId,
        scale: DefaultSettings.SCALE.toString(),
        x: DefaultSettings.PAN_POSITION.x.toString(),
        y: DefaultSettings.PAN_POSITION.y.toString(),
        ...overrides,
    };
};
