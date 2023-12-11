#!/usr/bin/env bash

echo "Creating .env file"
cat > ./.env <<EOL
API_KEY=${API_KEY}
EOL