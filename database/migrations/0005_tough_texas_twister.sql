DROP INDEX "users_githubId_index";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "email" TO "username";--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_index" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "users_githubId_index" ON "users" USING btree ("githubId");