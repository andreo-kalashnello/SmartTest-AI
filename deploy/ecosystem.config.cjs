/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "smarttest-web",
      cwd: "/opt/SmartTest-AI",
      script: "pnpm",
      args: "--filter web start",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
    },
  ],
};
