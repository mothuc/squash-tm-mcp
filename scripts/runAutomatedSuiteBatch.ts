#!/usr/bin/env node

import * as dotenv from 'dotenv';
import { AutomationClient } from '../src/clients/AutomationClient.js';

dotenv.config();

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  const flags: Record<string, string> = {};

  for (const arg of argv) {
    const match = arg.match(/^--([\w-]+)=(.*)$/);
    if (match) {
      flags[match[1]] = match[2];
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags };
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const testSuiteIdArg = flags['test-suite'];

  if (!testSuiteIdArg && positional.length < 2) {
    console.error(
      '❌ Usage: npm run run-batch -- <iterationId> <projectId> ' +
        '[--test-ids=1,2,3] [--status=FAILURE,BLOCKED] [--batch-size=10] [--concurrency=5] ' +
        '[--poll-interval=15] [--namespaces=default] [--env-tags=tag1,tag2]\n' +
        '   or: npm run run-batch -- --test-suite=46 <projectId> [same flags as above]\n' +
        '   If --test-ids is omitted, every test-plan item in the iteration/suite is fetched automatically ' +
        '(optionally narrowed by --status).\n' +
        '   --concurrency caps how many batches are actually RUNNING at once (polled via execution_status), ' +
        'not just how many are submitted — e.g. --concurrency=3 on 5 available agents leaves 2 idle.'
    );
    process.exit(1);
  }

  const client = new AutomationClient();

  let iterationId: number;
  let projectId: number;
  let context: { type: 'ITERATION' | 'TEST_SUITE'; id: number } | undefined;
  let testPlanSubsetIds: number[];
  const statusFilter = flags['status'] ? flags['status'].split(',') : undefined;

  if (testSuiteIdArg) {
    const testSuiteId = parseInt(testSuiteIdArg, 10);
    const [projectIdArg] = positional;
    if (!projectIdArg) {
      console.error('❌ Usage: npm run run-batch -- --test-suite=46 <projectId> [...]');
      process.exit(1);
    }
    projectId = parseInt(projectIdArg, 10);
    context = { type: 'TEST_SUITE', id: testSuiteId };
    iterationId = await client.getTestSuiteParentIterationId(testSuiteId);

    if (flags['test-ids']) {
      testPlanSubsetIds = flags['test-ids'].split(',').map((id) => parseInt(id.trim(), 10));
    } else {
      console.log(
        `\n🔎 Fetching test-plan items for test suite ${testSuiteId}` +
          (statusFilter ? ` (status in [${statusFilter.join(', ')}])` : ' (all statuses)') +
          '...'
      );
      testPlanSubsetIds = await client.getTestSuiteTestPlanItemIds(testSuiteId, statusFilter);
      console.log(`📋 Found ${testPlanSubsetIds.length} test-plan item(s)`);
    }
  } else {
    const [iterationIdArg, projectIdArg] = positional;
    iterationId = parseInt(iterationIdArg, 10);
    projectId = parseInt(projectIdArg, 10);

    if (flags['test-ids']) {
      testPlanSubsetIds = flags['test-ids'].split(',').map((id) => parseInt(id.trim(), 10));
    } else {
      console.log(
        `\n🔎 Fetching test-plan items for iteration ${iterationId}` +
          (statusFilter ? ` (status in [${statusFilter.join(', ')}])` : ' (all statuses)') +
          '...'
      );
      testPlanSubsetIds = await client.getIterationTestPlanItemIds(iterationId, statusFilter);
      console.log(`📋 Found ${testPlanSubsetIds.length} test-plan item(s)`);
    }
  }

  const batchSize = flags['batch-size'] ? parseInt(flags['batch-size'], 10) : 10;
  const concurrency = flags['concurrency'] ? parseInt(flags['concurrency'], 10) : 5;
  const pollIntervalMs = flags['poll-interval'] ? parseInt(flags['poll-interval'], 10) * 1000 : 15000;
  const namespaces = flags['namespaces'] ? flags['namespaces'].split(',') : ['default'];
  const environmentTags = flags['env-tags'] ? flags['env-tags'].split(',') : [];

  if (testPlanSubsetIds.length === 0) {
    console.log('\n⚠️  Nothing to execute.');
    process.exit(0);
  }

  // Matches the env vars passed to the runner container in Squash Orchestrator
  // (see squashAutomExecutionConfigurations.environmentVariables). Only forwards
  // ones actually set, so callers can rely on defaults configured on the server.
  const environmentVariables: Record<string, string> = {};
  for (const key of ['BRANCH', 'ENV', 'DEVICE', 'REPO', 'DEBUG']) {
    if (process.env[key]) {
      environmentVariables[key] = process.env[key]!;
    }
  }

  console.log(
    `\n🚀 Dispatching ${testPlanSubsetIds.length} test case(s) from ` +
      `${context ? `test suite ${context.id}` : `iteration ${iterationId}`} ` +
      `in batches of ${batchSize} (max ${concurrency} running at once, polling every ${pollIntervalMs / 1000}s)...`
  );

  const results = await client.createAndExecuteInBatches(
    { iterationId, testPlanSubsetIds, projectId, namespaces, environmentTags, environmentVariables, context },
    batchSize,
    concurrency,
    pollIntervalMs,
    (info) => {
      console.log(`   … submitted ${info.submitted}/${info.total}, running now: ${info.running}, finished: ${info.finished}`);
    }
  );

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.length - succeeded;

  console.log(`\n📊 Batches: ${results.length} total, ✅ ${succeeded} succeeded, ❌ ${failed} failed\n`);
  for (const r of results) {
    const label = r.success ? '✅' : '❌';
    console.log(`${label} Batch ${r.batchIndex + 1} [${r.testPlanSubsetIds.join(', ')}]${r.error ? ` - ${r.error}` : ''}`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
