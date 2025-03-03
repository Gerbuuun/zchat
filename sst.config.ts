/// <reference path="./.sst/platform/config.d.ts" />

import * as postgresql from '@pulumi/postgresql';
import * as aws from '@pulumi/aws';

const svelteDomain = 'zchat.grbn.dev';
const zeroDomain = 'zchat-zero.grbn.dev';
const awsRegion = 'us-east-1';

const cacheDisabled = {
  /**
   * Managed by AWS: CachingDisabled
   */
  cachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
  viewerProtocolPolicy: 'https-only',
  allowedMethods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'],
  cachedMethods: ['GET', 'HEAD'],
  compress: true,
};

export default $config({
  app(input) {
    return {
      name: 'zchat',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      providers: {
        aws: {
          region: awsRegion,
          profile: input.stage === 'production' ? 'kanrilabs-production' : 'kanrilabs-dev',
        },
        command: '1.0.2',
        postgresql: '3.14.0',
      },
    };
  },
  async run() {
    const openaiApiKey = new sst.Secret('OPENAI_API_KEY');
    const githubClientID = new sst.Secret('GITHUB_CLIENT_ID');
    const githubClientSecret = new sst.Secret('GITHUB_CLIENT_SECRET');
    const jwtSecret = new sst.Secret('JWT_SECRET');

    const vpc = new sst.aws.Vpc('Vpc', {
      bastion: true,
      nat: 'ec2',
    });
    const db = new sst.aws.Postgres('Database', {
      vpc,
      transform: {
        parameterGroup: {
          parameters: [
            {
              name: 'rds.logical_replication',
              value: '1',
              applyMethod: 'pending-reboot',
            },
            {
              name: 'rds.force_ssl',
              value: '0',
              applyMethod: 'pending-reboot',
            },
            {
              name: 'max_connections',
              value: '1000',
              applyMethod: 'pending-reboot',
            },
          ],
        },
      },
    });

    const cluster = new sst.aws.Cluster('Cluster', { vpc });
    const connection = $interpolate`postgres://${db.username}:${db.password}@${db.host}:${db.port}`;
    const zero = new sst.aws.Service('Zero', {
      cluster,
      image: 'rocicorp/zero',
      dev: {
        command: 'npx zero-cache',
      },
      capacity: 'spot',
      loadBalancer: {
        public: true,
        ports: [
          { listen: '80/http', forward: '4848/http' },
          { listen: '443/https', forward: '4848/http' },
        ],
        domain: {
          name: zeroDomain,
          dns: sst.cloudflare.dns({
            zone: process.env.CLOUDFLARE_ZONE_ID!,
            proxy: false,
          }),
        },
      },
      environment: {
        ZERO_UPSTREAM_DB: $interpolate`${connection}/${db.database}`,
        ZERO_CVR_DB: $interpolate`${connection}/${db.database}_cvr`,
        ZERO_CHANGE_DB: $interpolate`${connection}/${db.database}_change`,
        ZERO_REPLICA_FILE: 'zero.db',
        ZERO_NUM_SYNC_WORKERS: '1',
        ZERO_AUTH_SECRET: jwtSecret.value,
      },
    });

    const apiFunction = new sst.aws.Function('Api', {
      vpc,
      runtime: 'nodejs22.x',
      memory: '256 MB',
      architecture: 'arm64',
      handler: 'api/auth.handler',
      link: [githubClientID, githubClientSecret, jwtSecret, db],
      environment: {
        SPA_DOMAIN: svelteDomain,
      },
      url: true,
    });

    const llmFunction = new sst.aws.Function('LLM', {
      vpc,
      runtime: 'nodejs22.x',
      memory: '256 MB',
      architecture: 'arm64',
      handler: 'api/llm.handler',
      link: [db, openaiApiKey],
    });

    // From Discord: https://discord.com/channels/983865673656705025/1326997110440198155/1328686549830996081
    const apiOrigin = {
      domainName: apiFunction.url.apply(url => new URL(url).hostname),
      originId: 'apiOriginId',
      customOriginConfig: {
        httpPort: 80,
        httpsPort: 443,
        originSslProtocols: ['TLSv1.2'],
        originProtocolPolicy: 'https-only',
      },
    };

    new sst.aws.StaticSite('SvelteSPA', {
      domain: {
        name: svelteDomain,
        dns: sst.cloudflare.dns({
          zone: process.env.CLOUDFLARE_ZONE_ID!,
          proxy: true,
        }),
      },
      build: {
        command: 'pnpm build',
        output: 'build',
      },
      transform: {
        cdn: (options) => {
          options.origins = $resolve(options.origins).apply(val => [
            ...val,
            apiOrigin,
          ]);
          options.orderedCacheBehaviors = $resolve(
            options.orderedCacheBehaviors || [],
          ).apply(val => [
            ...val,
            {
              pathPattern: '/api/*',
              targetOriginId: apiOrigin.originId,
              /**
               * Managed by AWS: AllViewerExceptHostHeader
               */
              originRequestPolicyId: 'b689b0a8-53d0-40ab-baf2-68738e2966ac',
              ...cacheDisabled,
            },
          ]);
        },
      },
    });

    new sst.x.DevCommand('Drizzle', {
      link: [db],
      dev: {
        command: 'drizzle-kit studio',
        title: 'Drizzle Studio',
      },
    });

    new command.local.Command(
      'ZeroDeployPermissions',
      {
        create: `npx zero-deploy-permissions --schema-path ../../src/lib/zero/schema.ts`,
        environment: { ZERO_UPSTREAM_DB: $interpolate`${connection}/${db.database}` },
        triggers: [Date.now()],
      },
      { dependsOn: zero },
    );

    const provider = new postgresql.Provider('DatabasePostgresProvider', {
      host: db.host,
      port: db.port,
      database: db.database,
      username: db.username,
      password: db.password,
    });

    new postgresql.Extension('DatabaseLambdaExtension', {
      name: 'aws_lambda',
      createCascade: true,
      dropCascade: true,
    }, { provider });

    new postgresql.Function('DatabaseLambdaTrigger', {
      name: 'rds_lambda_trigger',
      body: $interpolate`DECLARE
    new_message record;
BEGIN
    SELECT "role", "chatId" FROM messages WHERE id = NEW."messageId" INTO new_message;

    -- Only proceed if the role is 'user'
    IF new_message.role = 'user' THEN
        -- Invoke Lambda function with the new row data
        PERFORM aws_lambda.invoke(
            aws_commons.create_lambda_function_arn(
                '${llmFunction.arn}',
                '${awsRegion}'
            ),
            json_build_object('chatId', new_message."chatId"),
            'Event'
        );
    END IF;
    RETURN NEW;
END;`,
      language: 'plpgsql',
      schema: 'public',
      returns: 'trigger',
    }, { provider });

    const rdsLambdaTriggerRole = new aws.iam.Role('DatabaseLambdaTriggerRole', {
      description: 'Role for RDS to invoke LLM Lambda function',
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: 'rds.amazonaws.com',
      }),
      inlinePolicies: [{
        name: 'inline',
        policy: aws.iam.getPolicyDocumentOutput({
          statements: [{
            actions: ['lambda:InvokeFunction'],
            resources: [llmFunction.arn],
          }],
        }).json,
      }]
    });

    new aws.rds.RoleAssociation('DatabaseLambdaTriggerRoleAssociation', {
      dbInstanceIdentifier: db.id,
      featureName: 'Lambda',
      roleArn: rdsLambdaTriggerRole.arn,
    });

    return {
      connection: $interpolate`${connection}/${db.database}`,
    };
  },
});
