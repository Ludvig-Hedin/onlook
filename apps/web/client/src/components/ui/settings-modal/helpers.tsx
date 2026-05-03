export enum SettingsTabValue {
    // Global tabs
    ACCOUNT = 'account',
    APPEARANCE = 'appearance',
    LANGUAGE = 'language',
    EDITOR = 'editor',
    AI = 'ai',
    SHORTCUTS = 'shortcuts',
    GITHUB = 'github',
    GIT = 'git',
    SUBSCRIPTION = 'subscription',
    // Project tabs
    SITE = 'site',
    DOMAIN = 'domain',
    PROJECT = 'project',
    VERSIONS = 'versions',
    // Legacy alias
    PREFERENCES = 'account',
}

export interface SettingTab {
    label: SettingsTabValue | string;
    icon: React.ReactNode;
    component: React.ReactNode;
}

export const ComingSoonTab = () => {
    return <div>Coming soon...</div>;
};
