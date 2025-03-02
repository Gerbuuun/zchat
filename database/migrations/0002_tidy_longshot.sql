CREATE INDEX "chat_access_chatId_index" ON "chat_access" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "chat_access_userId_index" ON "chat_access" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "chats_userId_index" ON "chats" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "messages_chatId_index" ON "messages" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "messages_userId_index" ON "messages" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "users_githubId_index" ON "users" USING btree ("githubId");