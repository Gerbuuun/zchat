CREATE TABLE "message_chunks" (
	"messageId" text NOT NULL,
	"index" integer NOT NULL,
	"content" text NOT NULL,
	CONSTRAINT "message_chunks_messageId_index_pk" PRIMARY KEY("messageId","index")
);
--> statement-breakpoint
ALTER TABLE "message_chunks" ADD CONSTRAINT "message_chunks_messageId_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "content";