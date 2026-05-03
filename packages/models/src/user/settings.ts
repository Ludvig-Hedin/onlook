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

export interface ChatSettings {
    showSuggestions: boolean;
    autoApplyCode: boolean;
    expandCodeBlocks: boolean;
    showMiniChat: boolean;
    defaultModel?: string;
    ollamaBaseUrl?: string;
}

export interface AISettings {
    defaultModel: string;
    showSuggestions: boolean;
    showMiniChat: boolean;
    autoApplyCode: boolean;
    expandCodeBlocks: boolean;
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
