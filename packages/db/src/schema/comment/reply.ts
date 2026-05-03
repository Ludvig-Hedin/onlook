import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { projectComments } from './comment';

export const commentReplies = pgTable('comment_replies', {
    id: uuid('id').primaryKey().defaultRandom(),
    commentId: uuid('comment_id')
        .notNull()
        .references(() => projectComments.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    content: text('content').notNull(),
    authorId: uuid('author_id').notNull(),
    authorName: text('author_name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
}).enableRLS();

export const replyInsertSchema = createInsertSchema(commentReplies);
export const replyUpdateSchema = createUpdateSchema(commentReplies, {
    id: z.string().uuid(),
});

export const replyRelations = relations(commentReplies, ({ one }) => ({
    comment: one(projectComments, {
        fields: [commentReplies.commentId],
        references: [projectComments.id],
    }),
}));

export type CommentReply = typeof commentReplies.$inferSelect;
export type NewCommentReply = typeof commentReplies.$inferInsert;
