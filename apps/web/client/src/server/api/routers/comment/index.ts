import { createTRPCRouter } from '../../trpc';
import { commentRouter as commentCrudRouter } from './comment';
import { replyRouter } from './reply';

export const commentRouter = createTRPCRouter({
    comment: commentCrudRouter,
    reply: replyRouter,
});
