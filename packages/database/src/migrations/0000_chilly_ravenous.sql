CREATE TABLE "chat_access" (
	"id" text PRIMARY KEY NOT NULL,
	"chatId" text NOT NULL,
	"userId" text NOT NULL,
	"write" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"public" boolean NOT NULL,
	"locked" boolean NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_chunks" (
	"messageId" text NOT NULL,
	"index" integer NOT NULL,
	"content" text NOT NULL,
	CONSTRAINT "message_chunks_messageId_index_pk" PRIMARY KEY("messageId","index")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"chatId" text NOT NULL,
	"userId" text,
	"role" text NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"githubId" text NOT NULL,
	"name" text NOT NULL,
	"username" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_access" ADD CONSTRAINT "chat_access_chatId_chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_access" ADD CONSTRAINT "chat_access_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_chunks" ADD CONSTRAINT "message_chunks_messageId_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_access_chatId_index" ON "chat_access" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "chat_access_userId_index" ON "chat_access" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "chats_userId_index" ON "chats" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "messages_chatId_index" ON "messages" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "messages_userId_index" ON "messages" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "users_githubId_index" ON "users" USING btree ("githubId");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_index" ON "users" USING btree ("username");