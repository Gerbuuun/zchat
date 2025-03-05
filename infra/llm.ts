import { db, provider, vpc } from './database';

const openaiApiKey = new sst.Secret('OPENAI_API_KEY');
const llmFunction = new sst.aws.Function('LLM', {
  vpc,
  runtime: 'nodejs22.x',
  memory: '256 MB',
  architecture: 'arm64',
  handler: 'packages/functions/src/llm.handler',
  link: [db, openaiApiKey],
});

// Install the aws_lambda extension on the database
new postgresql.Extension('DatabaseLambdaExtension', {
  name: 'aws_lambda',
  createCascade: true,
  dropCascade: true,
}, { provider });

// Create the postgresql function which invokes the lambda function
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
              '${$app.providers!.aws.region}'
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

// Create a role for the RDS instance to invoke the Lambda function
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
  }],
});

// Associate the role with the database
new aws.rds.RoleAssociation('DatabaseLambdaTriggerRoleAssociation', {
  dbInstanceIdentifier: db.id,
  featureName: 'Lambda',
  roleArn: rdsLambdaTriggerRole.arn,
});
