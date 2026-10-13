// PM2 process definition. `pm2 start deploy/ecosystem.config.cjs` from the repo root.
module.exports = {
  apps: [
    {
      name: 'fleetdesk',
      script: 'server/index.js',
      cwd: '/home/ubuntu/fleetdesk',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M',
    },
  ],
};
