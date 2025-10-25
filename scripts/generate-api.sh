#!/bin/bash

# Script to regenerate API types and client from OpenAPI specification
# Usage: yarn generate-api

set -e

echo "🔄 Fetching latest OpenAPI specification..."
curl -s https://api-sb-wsb.franeklab.com/v3/api-docs > openapi-spec.json

# Check if the file was downloaded successfully
if [ ! -s openapi-spec.json ]; then
    echo "❌ Failed to fetch OpenAPI specification"
    exit 1
fi

echo "🔧 Adding login endpoint to OpenAPI spec..."
# Create a temporary file for processing
TEMP_FILE=$(mktemp)

# Add the login endpoint and schemas
jq '.paths["/auth/login"] = {
  "post": {
    "tags": ["auth-controller"],
    "operationId": "login",
    "requestBody": {
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/LoginRequest"
          }
        }
      },
      "required": true
    },
    "responses": {
      "200": {
        "description": "OK",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/LoginResponse"
            }
          }
        }
      }
    }
  }
} | .components.schemas.LoginRequest = {
  "type": "object",
  "properties": {
    "email": { "type": "string" },
    "password": { "type": "string" }
  }
} | .components.schemas.LoginResponse = {
  "type": "object",
  "properties": {
    "token": { "type": "string" }
  }
}' openapi-spec.json > "$TEMP_FILE"

# Replace the original file with the processed version
mv "$TEMP_FILE" openapi-spec.json

echo "📝 Generating TypeScript types..."
npx openapi-typescript openapi-spec.json -o packages/app/api/types.ts

echo "🔧 Generating API client..."
npx openapi-generator-cli generate -c openapi-generator-config.json

echo "✅ API generation complete!"
echo "📁 Generated files:"
echo "   - packages/app/api/types.ts (TypeScript types)"
echo "   - packages/app/api/generated/ (OpenAPI client)"
echo "   - packages/app/api/client.ts (React Query client)"
echo "   - packages/app/api/hooks/ (React Query hooks)"






