#!/#!/usr/bin/env bash

# Get the API_KEY from the environment variables
API_KEY=$API_KEY

if [ -z "$API_KEY" ]; then
  echo "API_KEY is not defined in the environment variables."
  exit 1
fi

# Generate or modify .env file content
echo "API_KEY=$API_KEY" > .env

echo ".env file generated for App Center pre-build script."