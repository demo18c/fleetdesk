#!/usr/bin/env bash
# One-time setup for a fresh Ubuntu 24.04 EC2 instance.
# Usage (on the instance):  bash setup-ec2.sh <site-name> <github-repo-url>
#   site-name       public hostname Caddy should serve, e.g. 1-2-3-4.sslip.io or fleetdesk.example.com
#   github-repo-url https://github.com/<user>/fleetdesk.git
# After it finishes, create /home/ubuntu/fleetdesk/.env (see .env.example) and run:
#   cd ~/fleetdesk && pm2 restart fleetdesk
set -euo pipefail

SITE="${1:?site name required}"
REPO="${2:?github repo url required}"
APP_DIR=/home/ubuntu/fleetdesk

echo "==> System packages"
sudo apt-get update -y
sudo apt-get install -y curl git ca-certificates gnupg debian-keyring debian-archive-keyring apt-transport-https

echo "==> Node 22 (NodeSource)"
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v && npm -v

echo "==> PM2"
sudo npm install -g pm2

echo "==> Caddy"
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
sudo apt-get update -y
sudo apt-get install -y caddy

echo "==> Clone app"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

echo "==> Install + build"
npm ci
npm run build

echo "==> Caddyfile for $SITE"
sed "s/SITE_NAME/$SITE/" deploy/Caddyfile | sudo tee /etc/caddy/Caddyfile >/dev/null
sudo systemctl enable caddy
sudo systemctl restart caddy

echo "==> PM2 start"
if [ ! -f .env ]; then
  cp .env.example .env
  echo "!! Edit $APP_DIR/.env with the real MONGODB_URI and CLIENT_ORIGIN=https://$SITE, then: pm2 restart fleetdesk"
fi
pm2 start deploy/ecosystem.config.cjs
pm2 save
# Make PM2 come back after reboot (prints a sudo command; run it).
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo "==> Done. Site: https://$SITE"
