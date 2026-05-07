#!/usr/bin/env node

/**
 * Standalone script to run Squash TM iteration tests
 * Can be called from any test project directory
 *
 * Usage from test project:
 *   npx tsx /home/thuc/Projects/squash-tm-mcp-agent/scripts/runIteration.ts <iterationId> [playwright-args]
 *
 * Environment Variables:
 *   ENV        Environment (staging|production|dev) [default: staging]
 *   DEBUG      Debug mode (true|false) [default: false]
 *
 * Examples:
 *   npm run smoke-tests
 *   npm run smoke-tests -- --ui
 *   ENV=production npm run smoke-tests -- --ui --headed
 */

import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from squash-tm-mcp-agent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const agentDir = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(agentDir, '.env') });

// Squash TM configuration
const SQUASH_BASE_URL = process.env.SQUASH_TM_BASE_URL || 'https://qa.dtn.com.vn/squash/api/rest/latest';
const SQUASH_TOKEN = process.env.SQUASH_TM_API_TOKEN;

async function fetchIterationTests(iterationId: number) {
  const response = await fetch(`${SQUASH_BASE_URL}/iterations/${iterationId}/test-plan?size=1000`, {
    headers: {
      'Authorization': `Bearer ${SQUASH_TOKEN}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch iteration: ${response.statusText}`);
  }

  return response.json();
}

async function fetchIterationInfo(iterationId: number) {
  const url = `${SQUASH_BASE_URL}/iterations/${iterationId}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SQUASH_TOKEN}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch iteration info: ${response.status} ${response.statusText}\nURL: ${url}\nResponse: ${text}`);
  }

  return response.json();
}

async function runIterationTests(iterationId: number, playwrightArgs: string[] = []) {
  const env = process.env.ENV || 'staging';
  const debug = process.env.DEBUG === 'true';
  const projectPath = process.cwd();

  try {
    console.log('\n🔍 Fetching iteration tests...');

    // Get iteration info
    const iteration = await fetchIterationInfo(iterationId);
    console.log(`📋 ${iteration.name} (ID: ${iterationId})`);

    // Get test plan
    const data = await fetchIterationTests(iterationId);

    // Extract unique test case IDs
    const testCaseIds = new Set<number>();
    if (data._embedded && data._embedded['test-plan']) {
      for (const item of data._embedded['test-plan']) {
        if (item.referenced_test_case?.id) {
          testCaseIds.add(item.referenced_test_case.id);
        }
      }
    }

    console.log(`📊 ${testCaseIds.size} test cases\n`);

    // Verify feature files exist
    const foundIds: number[] = [];
    for (const testId of testCaseIds) {
      try {
        const result = execSync(
          `find . -type f -name "${testId}_*.feature"`,
          { encoding: 'utf-8', cwd: projectPath }
        ).trim();

        if (result) {
          foundIds.push(testId);
          console.log(`  ✓ ${testId}_*.feature`);
        }
      } catch (error) {
        // File not found, skip
      }
    }

    if (foundIds.length === 0) {
      console.log('\n❌ No feature files found');
      console.log('💡 Ensure files follow pattern: {testCaseId}_*.feature\n');
      return;
    }

    console.log(`\n✅ Found ${foundIds.length} files\n`);

    // Build grep pattern from test IDs
    const grepPattern = foundIds.join('|');

    // Build command with grep pattern
    let command = 'npm run test -- --grep="' + grepPattern + '"';

    // Append playwright args
    if (playwrightArgs.length > 0) {
      command += ' ' + playwrightArgs.join(' ');
    }

    console.log(`🚀 Running tests (ENV=${env}, DEBUG=${debug})...\n`);
    console.log(`📝 Command: ${command}\n`);

    // Run tests with environment variables
    execSync(command, {
      cwd: projectPath,
      stdio: 'inherit',
      encoding: 'utf-8',
      env: {
        ...process.env,
        ENV: env,
        DEBUG: debug.toString()
      }
    });

    console.log('\n✅ Done\n');

  } catch (error: any) {
    if (error.status) {
      console.log('\n⚠ Tests completed with failures\n');
      process.exit(1);
    } else {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  }
}

// Parse CLI args
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help')) {
  console.log(`
🧪 Run Squash TM Iteration Tests

Usage:
  npx tsx /home/thuc/Projects/squash-tm-mcp-agent/scripts/runIteration.ts <iterationId> [playwright-args]

Environment Variables:
  ENV        Environment (staging|production|dev) [default: staging]
  DEBUG      Debug mode (true|false) [default: false]

Examples:
  # Basic - Run headless on staging
  npm run smoke-tests

  # UI mode
  npm run smoke-tests -- --ui

  # Headed mode
  npm run smoke-tests -- --headed

  # Override environment
  ENV=production npm run smoke-tests -- --ui

  # With debug
  DEBUG=true npm run smoke-tests -- --headed

  # Multiple args
  ENV=production npm run smoke-tests -- --ui --headed
`);
  process.exit(0);
}

const iterationId = parseInt(args[0]);

if (isNaN(iterationId)) {
  console.error('❌ Invalid iteration ID');
  process.exit(1);
}

// All args after iteration ID are playwright args
const playwrightArgs = args.slice(1);

runIterationTests(iterationId, playwrightArgs);
