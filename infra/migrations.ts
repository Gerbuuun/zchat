import { databaseUrl, db, provider } from "./database";
import { lambdaTrigger } from "./llm";
import { zero } from "./zero";

// Run migrations for the database
export const migrate = new command.local.Command(
  'DatabaseRunMigrations',
  {
    dir: '../../packages/database',
    create: `sudo sst shell --stage ${$app.stage} -- drizzle-kit migrate`,
    triggers: [Date.now()],
  },
  {
    dependsOn: [provider, db, lambdaTrigger],
  },
);

// Deploy the permissions for the Zero sync
new command.local.Command(
  'DeployZeroPermissions',
  {
    dir: '../../packages/web',
    create: 'zero-deploy-permissions -p src/lib/zero/schema.ts',
    triggers: [Date.now()],
    environment: {
      ZERO_UPSTREAM_DB: $interpolate`${databaseUrl}/${db.database}`,
    },
  },
  {
    dependsOn: [zero, migrate],
  },
);
