import { webDomain } from './constants';
import { db, vpc } from './database';
import { githubClientID, githubClientSecret, jwtSecret } from './secrets';

export const auth = new sst.aws.Function('Auth', {
  vpc,
  runtime: 'nodejs22.x',
  memory: '256 MB',
  architecture: 'arm64',
  handler: 'packages/functions/src/auth.handler',
  link: [githubClientID, githubClientSecret, db],
  environment: {
    SPA_DOMAIN: webDomain,
    JWT_SECRET: jwtSecret.result,
  },
  url: true,
});
