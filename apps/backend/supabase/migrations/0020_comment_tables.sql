CREATE TABLE "project_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"canvas_x" real NOT NULL,
	"canvas_y" real NOT NULL,
	"element_selector" text,
	"content" text NOT NULL,
	"author_id" uuid NOT NULL,
	"author_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "comment_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"content" text NOT NULL,
	"author_id" uuid NOT NULL,
	"author_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "comment_replies" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "comment_replies" ADD CONSTRAINT "comment_replies_comment_id_project_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."project_comments"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "project_comments_project_id_idx" ON "project_comments" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_comments_author_id_idx" ON "project_comments" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "comment_replies_comment_id_idx" ON "comment_replies" USING btree ("comment_id");--> statement-breakpoint

-- RLS Policies for project_comments
-- Any project member (not just owner) can read and interact with comments.
-- Membership is determined via user_projects join table, matching verifyProjectAccess in the tRPC layer.
CREATE POLICY "project_comments_select" ON "project_comments"
    FOR SELECT
    USING (
        project_id IN (
            SELECT project_id FROM user_projects WHERE user_id = auth.uid()
        )
    );--> statement-breakpoint

CREATE POLICY "project_comments_insert" ON "project_comments"
    FOR INSERT
    WITH CHECK (
        author_id = auth.uid()
        AND project_id IN (
            SELECT project_id FROM user_projects WHERE user_id = auth.uid()
        )
    );--> statement-breakpoint

-- Any project member can update comments (e.g. resolve/unresolve by non-authors).
-- Content-edit authorship is enforced at the tRPC layer (update mutation checks authorId).
CREATE POLICY "project_comments_update" ON "project_comments"
    FOR UPDATE
    USING (
        project_id IN (
            SELECT project_id FROM user_projects WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT project_id FROM user_projects WHERE user_id = auth.uid()
        )
    );--> statement-breakpoint

CREATE POLICY "project_comments_delete" ON "project_comments"
    FOR DELETE
    USING (author_id = auth.uid());--> statement-breakpoint

-- RLS Policies for comment_replies
CREATE POLICY "comment_replies_select" ON "comment_replies"
    FOR SELECT
    USING (
        comment_id IN (
            SELECT id FROM project_comments
            WHERE project_id IN (
                SELECT project_id FROM user_projects WHERE user_id = auth.uid()
            )
        )
    );--> statement-breakpoint

CREATE POLICY "comment_replies_insert" ON "comment_replies"
    FOR INSERT
    WITH CHECK (
        author_id = auth.uid()
        AND comment_id IN (
            SELECT id FROM project_comments
            WHERE project_id IN (
                SELECT project_id FROM user_projects WHERE user_id = auth.uid()
            )
        )
    );--> statement-breakpoint

CREATE POLICY "comment_replies_update" ON "comment_replies"
    FOR UPDATE
    USING (author_id = auth.uid())
    WITH CHECK (author_id = auth.uid());--> statement-breakpoint

CREATE POLICY "comment_replies_delete" ON "comment_replies"
    FOR DELETE
    USING (author_id = auth.uid());
