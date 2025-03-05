import { auth } from './auth';
import { webDomain } from './constants';
import { zero } from './zero';

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

// From Discord: https://discord.com/channels/983865673656705025/1326997110440198155/1328686549830996081
const apiOrigin = {
  domainName: auth.url.apply(url => new URL(url).hostname),
  originId: 'apiOriginId',
  customOriginConfig: {
    httpPort: 80,
    httpsPort: 443,
    originSslProtocols: ['TLSv1.2'],
    originProtocolPolicy: 'https-only',
  },
};

export const web = new sst.aws.StaticSite('SvelteSPA', {
  path: 'packages/web',
  domain: {
    name: webDomain,
    dns: sst.cloudflare.dns({
      zone: process.env.CLOUDFLARE_ZONE_ID!,
      proxy: true,
    }),
  },
  build: {
    command: 'pnpm build',
    output: 'build',
  },
  environment: {
    PUBLIC_ZERO_SERVER: zero.url,
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
