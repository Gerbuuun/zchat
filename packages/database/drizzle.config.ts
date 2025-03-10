import { defineConfig } from 'drizzle-kit';
import { Resource } from 'sst';

export default defineConfig({
  schema: './src/schema.ts',
  out: './src/migrations',
  dbCredentials: {
    ssl: {
      rejectUnauthorized: false,
    },
    host: Resource.Database.host,
    port: Resource.Database.port,
    user: Resource.Database.username,
    password: Resource.Database.password,
    database: Resource.Database.database,
  },
  verbose: true,
  strict: true,
  dialect: 'postgresql',
});
