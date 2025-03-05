import postgres from "postgres";
import { Resource } from "sst";
import { drizzle } from "drizzle-orm/postgres-js";

export function getDB() {
  const client = postgres(`postgres://${Resource.Database.username}:${Resource.Database.password}@${Resource.Database.host}:${Resource.Database.port}/${Resource.Database.database}`);
  return drizzle(client);
}

export * from "./schema";
