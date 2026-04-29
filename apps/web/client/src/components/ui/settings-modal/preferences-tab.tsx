import { api } from '@/trpc/react';
import { Button } from '@onlook/ui/button';
import { Switch } from '@onlook/ui/switch';
import { toast } from '@onlook/ui/sonner';
import { debounce } from 'lodash';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef } from 'react';
import { UserDeleteSection } from './user-delete-section';

export const PreferencesTab = observer(({ onOpenShortcuts }: { onOpenShortcuts?: () => void }) => {
    const apiUtils = api.useUtils();
    const { data: userSettings } = api.user.settings.get.useQuery();
    const { mutate: updateSettings } = api.user.settings.upsert.useMutation({
        onSuccess: () => {
            void apiUtils.user.settings.get.invalidate();
        },
        onError: (error) => {
            console.error('Failed to update user settings:', error);
            toast.error('Failed to save preferences');
        },
    });

    const pendingChanges = useRef<{ showSuggestions?: boolean; showMiniChat?: boolean }>({});

    const debouncedUpdateSettings = useMemo(
        () =>
            debounce(() => {
                if (Object.keys(pendingChanges.current).length === 0) return;
                const next = pendingChanges.current;
                pendingChanges.current = {};
                updateSettings(next);
            }, 250),
        [updateSettings],
    );

    useEffect(() => {
        return () => {
            debouncedUpdateSettings.cancel();
        };
    }, [debouncedUpdateSettings]);

    const updateChatPreference = (
        key: 'showSuggestions' | 'showMiniChat',
        value: boolean,
    ) => {
        apiUtils.user.settings.get.setData(undefined, (current) => {
            if (!current) {
                return current;
            }

            return {
                ...current,
                chat: {
                    ...current.chat,
                    [key]: value,
                },
            };
        });

        pendingChanges.current = { ...pendingChanges.current, [key]: value };
        debouncedUpdateSettings();
    };

    return (
        <div className="flex flex-col gap-8 p-6">
            <section className="space-y-4 rounded-lg border border-border/60 bg-background-secondary/30 p-4">
                <div>
                    <h2 className="text-base font-medium">Editor preferences</h2>
                    <p className="text-sm text-muted-foreground">
                        Make the workspace behave the way you prefer.
                    </p>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium">Show chat suggestions</p>
                            <p className="text-sm text-muted-foreground">
                                Keep prompt suggestions visible in the AI panel.
                            </p>
                        </div>
                        <Switch
                            checked={userSettings?.chat.showSuggestions ?? true}
                            onCheckedChange={(checked) =>
                                updateChatPreference('showSuggestions', checked)
                            }
                        />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium">Show mini chat on canvas</p>
                            <p className="text-sm text-muted-foreground">
                                Keep the inline chat entry point visible while editing.
                            </p>
                        </div>
                        <Switch
                            checked={userSettings?.chat.showMiniChat ?? false}
                            onCheckedChange={(checked) =>
                                updateChatPreference('showMiniChat', checked)
                            }
                        />
                    </div>
                </div>
            </section>
            {onOpenShortcuts && (
                <section className="space-y-4 rounded-lg border border-border/60 bg-background-secondary/30 p-4">
                    <div>
                        <h2 className="text-base font-medium">Keyboard shortcuts</h2>
                        <p className="text-sm text-muted-foreground">
                            Open the full shortcut reference for the project editor.
                        </p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-sm text-muted-foreground">
                            Quick access: press <span className="font-medium text-foreground">Cmd/Ctrl + K</span>.
                        </div>
                        <Button type="button" variant="outline" onClick={onOpenShortcuts}>
                            Show shortcuts
                        </Button>
                    </div>
                </section>
            )}
            <UserDeleteSection />
        </div>
    );
});
