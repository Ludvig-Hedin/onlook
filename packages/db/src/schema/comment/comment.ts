import { relations } from 'drizzle-orm';
import { pgTable, real, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { projects } from '../project';
import { commentReplies } from './reply';

export const projectComments = pgTable('project_comments', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    canvasX: real('canvas_x').notNull(),
    canvasY: real('canvas_y').notNull(),
    elementSelector: text('element_selector'),
    content: text('content').notNull(),
    authorId: uuid('author_id').notNull(),
    authorName: text('author_name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
}).enableRLS();

export const commentInsertSchema = createInsertSchema(projectComments);
export const commentUpdateSchema = createUpdateSchema(projectComments, {
    id: z.string().uuid(),
});

export const commentRelations = relations(projectComments, ({ one, many }) => ({
    project: one(projects, {
        fields: [projectComments.projectId],
        references: [projects.id],
    }),
    replies: many(commentReplies),
}));

export type ProjectComment = typeof projectComments.$inferSelect;
export type NewProjectComment = typeof projectComments.$inferInsert;
