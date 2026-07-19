#!/usr/bin/env bash
# Build and deploy to stevenjessup.com (SiteGround).
# Requires the "siteground" host alias in ~/.ssh/config (key auth, port 18765).
set -euo pipefail
cd "$(dirname "$0")"

npm run build
rsync -az --delete -e ssh dist/ siteground:www/stevenjessup.com/public_html/

echo "Deployed to https://stevenjessup.com"
