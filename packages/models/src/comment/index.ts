export interface ProjectComment {
    id: string;
    projectId: string;
    canvasX: number;
    canvasY: number;
    elementSelector: string | null;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt: Date | null;
    replies: CommentReply[];
}

export interface CommentReply {
    id: string;
    commentId: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface NewProjectComment {
    projectId: string;
    canvasX: number;
    canvasY: number;
    elementSelector?: string | null;
    content: string;
    authorId: string;
    authorName: string;
}

export interface NewCommentReply {
    commentId: string;
    content: string;
    authorId: string;
    authorName: string;
}
