export const vpc = new sst.aws.Vpc('Vpc', {
  bastion: true,
  nat: 'ec2',
});

export const db = new sst.aws.Postgres('Database', {
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

export const databaseUrl = $interpolate`postgresql://${db.username}:${db.password}@${db.host}:${db.port}`;

// Create a provider to connect to the database
export const provider = new postgresql.Provider('DatabasePostgresProvider', {
  host: db.host,
  port: db.port,
  database: db.database,
  username: db.username,
  password: db.password,
});

// Create the cvr database
new postgresql.Database('CvrDatabase', {
  name: $interpolate`${db.database}_cvr`,
}, { provider });

// Create the change database
new postgresql.Database('ChangeDatabase', {
  name: $interpolate`${db.database}_change`,
}, { provider });
