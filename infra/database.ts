// Create the VPC with a bastion host wherein the application will run
export const vpc = new sst.aws.Vpc('Vpc', {
  bastion: true,
  nat: 'ec2',
});

// Install the SST tunnel
const install = new command.local.Command(
  'InstallVPCTunnel',
  {
    create: `sudo sst tunnel install --stage ${$app.stage}`,
  },
  {
    dependsOn: [vpc],
  },
);

// Run the SST tunnel
const tunnel = new command.local.Command(
  'RunVPCTunnel',
  {
    create: `nohup sudo sst tunnel --stage ${$app.stage} > /dev/null 2>&1 & echo $! > sst-tunnel.pid`,
    triggers: [Date.now()],
    delete: `if [ -f sst-tunnel.pid ]; then sudo kill $(cat sst-tunnel.pid) || sudo pkill -f "sst tunnel" || true; rm sst-tunnel.pid; fi`,
  },
  {
    dependsOn: [install],
  },
);

// Create the RDS instance with the necessary parameters for replication to Zero sync
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
}, {
  dependsOn: [tunnel],
});

export const databaseUrl = $interpolate`postgresql://${db.username}:${db.password}@${db.host}:${db.port}`;

// Create a provider to connect to the database
export const provider = new postgresql.Provider('DatabasePostgresProvider', {
  host: db.host,
  port: db.port,
  database: db.database,
  username: db.username,
  password: db.password,
}, {
  dependsOn: [tunnel, db],
});

// // Create the cvr database
new postgresql.Database('CvrDatabase', {
  name: $interpolate`${db.database}_cvr`,
}, {
  provider,
  dependsOn: [db],
});

// Create the change database
new postgresql.Database('ChangeDatabase', {
  name: $interpolate`${db.database}_change`,
}, {
  provider,
  dependsOn: [db],
});
