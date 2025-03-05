import { vpc, databaseUrl } from "./database";
import { zero } from "./zero";

// Permissions deployment
const permissionsDeployer = new sst.aws.Function(
  "ZeroPermissionsDeployer",
  {
    handler: "./functions/src/permissions.deploy",
    vpc,
    environment: { ["ZERO_UPSTREAM_DB"]: databaseUrl },
    copyFiles: [
      { from: "./packages/web/src/lib/zero/schema.ts", to: "./schema.ts" },
      { from: "./packages/functions/src/database", to: "./database" },
    ],
    nodejs: { install: [`@rocicorp/zero`, `drizzle-kit`] },
  }
);

new aws.lambda.Invocation(
  "InvokeZeroPermissionsDeployer",
  {
    // Invoke the Lambda on every deploy.
    input: Date.now().toString(),
    functionName: permissionsDeployer.name,
  },
  { dependsOn: zero }
);
