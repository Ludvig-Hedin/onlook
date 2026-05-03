export interface UserSettings {
    id: string;
    chat: ChatSettings;
    editor: EditorSettings;
    ai: AISettings;
    appearance: AppearanceSettings;
    language: LanguageSettings;
    git: GitSettings;
    customShortcuts: Record<string, string>;
}

/** Shared behaviour flags that live in a single DB column set and appear in both chat and AI settings. */
export interface AIBehaviorSettings {
    showSuggestions: boolean;
    showMiniChat: boolean;
    autoApplyCode: boolean;
    expandCodeBlocks: boolean;
}

export interface ChatSettings extends AIBehaviorSettings {
    defaultModel?: string;
    ollamaBaseUrl?: string;
}

export interface AISettings extends AIBehaviorSettings {
    defaultModel: string;
    maxImages: number;
}

export interface EditorSettings {
    shouldWarnDelete: boolean;
    enableBunReplace: boolean;
    buildFlags: string;
}

export interface AppearanceSettings {
    theme: 'light' | 'dark' | 'system';
    accentColor: 'blue' | 'red' | 'green' | 'neutral';
    fontFamily: 'sans' | 'serif';
    fontSize: 'small' | 'medium' | 'large';
    uiDensity: 'compact' | 'comfortable';
}

export interface LanguageSettings {
    locale: 'en' | 'ja' | 'zh' | 'ko';
}

export interface GitSettings {
    autoCommit: boolean;
    autoPush: boolean;
    commitMessageFormat: string;
    defaultBranchPattern: string;
}
