ALTER TABLE "messages" ADD COLUMN "content" text;--> statement-breakpoint

UPDATE "messages" m
SET "content" = (
    SELECT string_agg("content", '')
    FROM "message_chunks" mc
    WHERE mc."messageId" = m."id"
    GROUP BY mc."messageId"
);--> statement-breakpoint

ALTER TABLE "messages" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
DROP TABLE "message_chunks" CASCADE;--> statement-breakpoint

CREATE TRIGGER trigger_user_message_insert
AFTER INSERT
ON messages
FOR EACH ROW
EXECUTE PROCEDURE public.rds_lambda_trigger();