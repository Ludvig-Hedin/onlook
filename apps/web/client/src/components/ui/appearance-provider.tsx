'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

import { api } from '@/trpc/react';
import { useStateManager } from '@/components/store/state';

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
    const { data: userSettings } = api.user.settings.get.useQuery();
    const { setTheme } = useTheme();
    const stateManager = useStateManager();

    useEffect(() => {
        if (!userSettings?.appearance) return;
        const { theme, accentColor, fontFamily, fontSize, uiDensity } = userSettings.appearance;

        if (theme) setTheme(theme);

        const html = document.documentElement;
        if (accentColor) html.setAttribute('data-accent', accentColor);
        if (uiDensity) html.setAttribute('data-density', uiDensity);
        if (fontSize) html.setAttribute('data-font-size', fontSize);
        if (fontFamily) html.setAttribute('data-font-family', fontFamily);
    }, [userSettings?.appearance, setTheme]);

    useEffect(() => {
        if (!userSettings?.customShortcuts) return;
        stateManager.hotkeys.loadFromSettings(
            userSettings.customShortcuts as Record<string, string>,
        );
    }, [userSettings?.customShortcuts, stateManager.hotkeys]);

    return <>{children}</>;
}
