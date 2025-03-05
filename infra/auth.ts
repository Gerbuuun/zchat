import { webDomain } from './constants';
import { jwtSecret, githubClientID, githubClientSecret } from './secrets';
import { db, vpc } from './database';

export const auth = new sst.aws.Function('Auth', {
  vpc,
  runtime: 'nodejs22.x',
  memory: '256 MB',
  architecture: 'arm64',
  handler: 'packages/functions/src/auth.handler',
  link: [githubClientID, githubClientSecret, jwtSecret, db],
  environment: {
    SPA_DOMAIN: webDomain,
  },
  url: true,
});
