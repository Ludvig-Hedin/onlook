export interface UserSettings {
    id: string;
    chat: ChatSettings;
    editor: EditorSettings;
}

export interface ChatSettings {
    showSuggestions: boolean;
    autoApplyCode: boolean;
    expandCodeBlocks: boolean;
    showMiniChat: boolean;
    defaultModel?: string;
    ollamaBaseUrl?: string;
}

export interface EditorSettings {
    shouldWarnDelete: boolean;
}
