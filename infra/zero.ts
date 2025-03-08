import { zeroDomain } from './constants';
import { databaseUrl, db, vpc } from './database';
import { jwtSecret } from './secrets';

const cluster = new sst.aws.Cluster('Cluster', { vpc, forceUpgrade: 'v2' });
export const zero = new sst.aws.Service('Zero', {
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
    ZERO_UPSTREAM_DB: $interpolate`${databaseUrl}/${db.database}`,
    ZERO_CVR_DB: $interpolate`${databaseUrl}/${db.database}_cvr`,
    ZERO_CHANGE_DB: $interpolate`${databaseUrl}/${db.database}_change`,
    ZERO_REPLICA_FILE: 'zero.db',
    ZERO_NUM_SYNC_WORKERS: '1',
    ZERO_AUTH_SECRET: jwtSecret.result,
  },
});
