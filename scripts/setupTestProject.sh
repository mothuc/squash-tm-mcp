#!/bin/bash

# Script to add npm scripts to a test project for running Squash TM iterations
# Usage: ./setupTestProject.sh /path/to/test-project

PROJECT_PATH=${1:-.}
PACKAGE_JSON="$PROJECT_PATH/package.json"

if [ ! -f "$PACKAGE_JSON" ]; then
  echo "❌ package.json not found in $PROJECT_PATH"
  exit 1
fi

echo "📝 Adding scripts to $PACKAGE_JSON"

# Check if jq is available
if ! command -v jq &> /dev/null; then
  echo "⚠ jq not installed. Please add manually:"
  echo ""
  echo "Add to package.json scripts:"
  echo '  "test:iteration": "npx tsx ~/Projects/squash-tm-mcp-agent/scripts/runIteration.ts"'
  echo ""
  exit 1
fi

# Add scripts using jq
jq '.scripts["test:iteration"] = "npx tsx ~/Projects/squash-tm-mcp-agent/scripts/runIteration.ts"' "$PACKAGE_JSON" > "$PACKAGE_JSON.tmp" && mv "$PACKAGE_JSON.tmp" "$PACKAGE_JSON"

echo "✅ Scripts added successfully!"
echo ""
echo "Usage:"
echo "  npm run test:iteration 167         # Run headless"
echo "  npm run test:iteration 167 ui      # Playwright UI"
echo "  npm run test:iteration 167 headed  # Show browser"
