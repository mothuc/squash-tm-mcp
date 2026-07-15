#!/bin/bash
# Sync by test case ID - finds feature file by pattern <testId>_*.feature

if [ $# -eq 0 ]; then
    echo "Usage: ./syncById.sh <testCaseId> [project-path]"
    echo "Example: ./syncById.sh 2704 /home/thuc/Projects/mwkjp-squash-tests"
    exit 1
fi

TEST_ID=$1
PROJECT_PATH=${2:-.}

# Find feature file matching pattern
FEATURE_FILE=$(find "$PROJECT_PATH" -type f -name "${TEST_ID}_*.feature" | head -1)

if [ -z "$FEATURE_FILE" ]; then
    echo "❌ No feature file found matching pattern: ${TEST_ID}_*.feature"
    exit 1
fi

echo "📄 Found feature file: $FEATURE_FILE"
echo ""

# Run sync script
npx tsx "$(dirname "$0")/syncSquashTM.ts" "$FEATURE_FILE" "$TEST_ID"
