/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'zchat',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      providers: {
        aws: {
          region: 'us-east-1',
          profile: input.stage === 'production' ? 'kanrilabs-production' : 'kanrilabs-dev',
        },
        command: '1.0.2',
        postgresql: '3.14.0',
        random: '4.18.0',
      },
    };
  },
  async run() {
    const infra = await import('./infra');

    return {
      connection: $interpolate`${infra.databaseUrl}/${infra.db.database}`,
    };
  },
});
