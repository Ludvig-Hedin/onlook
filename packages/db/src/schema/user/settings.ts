import { relations } from 'drizzle-orm';
import { boolean, integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';

import { users } from './user';

export const userSettings = pgTable('user_settings', {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
        .unique(),
    // Chat / AI
    autoApplyCode: boolean('auto_apply_code').notNull().default(true),
    expandCodeBlocks: boolean('expand_code_blocks').notNull().default(true),
    showSuggestions: boolean('show_suggestions').notNull().default(true),
    showMiniChat: boolean('show_mini_chat').notNull().default(false),
    defaultModel: text('default_model'),
    ollamaBaseUrl: text('ollama_base_url'),
    maxImages: integer('max_images').notNull().default(5),
    // Editor
    shouldWarnDelete: boolean('should_warn_delete').notNull().default(true),
    enableBunReplace: boolean('enable_bun_replace').notNull().default(true),
    buildFlags: text('build_flags').notNull().default('--no-lint'),
    // Appearance
    theme: text('theme').notNull().default('system'),
    accentColor: text('accent_color').notNull().default('blue'),
    fontFamily: text('font_family').notNull().default('sans'),
    fontSize: text('font_size').notNull().default('medium'),
    uiDensity: text('ui_density').notNull().default('comfortable'),
    // Language
    locale: text('locale').notNull().default('en'),
    // Git
    autoCommit: boolean('auto_commit').notNull().default(false),
    autoPush: boolean('auto_push').notNull().default(false),
    commitMessageFormat: text('commit_message_format').notNull().default('feat: {description}'),
    defaultBranchPattern: text('default_branch_pattern').notNull().default('feature/{timestamp}'),
    // Shortcuts
    customShortcuts: jsonb('custom_shortcuts').notNull().default({}),
}).enableRLS();

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
    user: one(users, {
        fields: [userSettings.userId],
        references: [users.id],
    }),
}));

export const userSettingsInsertSchema = createInsertSchema(userSettings);
export const userSettingsUpdateSchema = createUpdateSchema(userSettings);

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
