import { makeAutoObservable } from 'mobx';

import type { Hotkey } from '@/components/hotkey';
import { DEFAULT_HOTKEYS } from '@/components/hotkey';

export class HotkeyStore {
    customBindings: Record<string, string> = {};

    constructor() {
        makeAutoObservable(this);
    }

    getBinding(key: string): string {
        if (key in this.customBindings) {
            return this.customBindings[key]!;
        }
        const hotkey = DEFAULT_HOTKEYS[key];
        return hotkey ? hotkey.command : '';
    }

    getHotkey(key: string): Hotkey | null {
        return DEFAULT_HOTKEYS[key] ?? null;
    }

    setBinding(key: string, value: string) {
        this.customBindings[key] = value;
    }

    resetBinding(key: string) {
        delete this.customBindings[key];
    }

    resetAll() {
        this.customBindings = {};
    }

    loadFromSettings(customShortcuts: Record<string, string>) {
        this.customBindings = { ...customShortcuts };
    }

    isCustomized(key: string): boolean {
        return key in this.customBindings;
    }

    getConflict(key: string, newBinding: string): string | null {
        for (const [existingKey, binding] of Object.entries(this.customBindings)) {
            if (existingKey !== key && binding === newBinding) return existingKey;
        }
        for (const [existingKey, hotkey] of Object.entries(DEFAULT_HOTKEYS)) {
            if (
                existingKey !== key &&
                !(existingKey in this.customBindings) &&
                hotkey.command === newBinding
            ) {
                return existingKey;
            }
        }
        return null;
    }
}
