#!/usr/bin/env bash
# Runs on the EC2 instance on every push to main (called by GitHub Actions over SSH).
# Pulls the latest code, installs deps, rebuilds the React app, restarts the API.
set -euo pipefail
cd /home/ubuntu/fleetdesk
git fetch --all
git reset --hard origin/main
npm ci
npm run build
pm2 restart fleetdesk --update-env
pm2 save
echo "Deployed $(git rev-parse --short HEAD) at $(date -u +%FT%TZ)"
