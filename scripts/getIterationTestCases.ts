#!/usr/bin/env node

import { BaseClient } from '../src/clients/BaseClient.js';

class IterationClient extends BaseClient {
  async getIterationTestPlan(iterationId: number) {
    const response = await this.makeRequest(
      `${this.baseURL}/iterations/${iterationId}/test-plan?size=1000`,
      { method: 'GET' }
    );
    return response;
  }
}

async function getIterationTestCases(iterationId: number) {
  const client = new IterationClient();

  try {
    // Fetch test plan for the iteration
    const response = await client.getIterationTestPlan(iterationId);
    const data = await response.json();

    // Extract test case IDs from test plan items
    const testCaseIds: number[] = [];

    if (data._embedded && data._embedded['test-plan']) {
      for (const item of data._embedded['test-plan']) {
        if (item.referenced_test_case && item.referenced_test_case.id) {
          testCaseIds.push(item.referenced_test_case.id);
        }
      }
    }

    console.log('\n📋 Test Case IDs from Iteration', iterationId);
    console.log('═══════════════════════════════════════');
    console.log(JSON.stringify(testCaseIds, null, 2));
    console.log('\n📊 Total test cases:', testCaseIds.length);

    return testCaseIds;

  } catch (error) {
    console.error('❌ Error fetching iteration test cases:', error);
    throw error;
  }
}

// Get iteration ID from command line argument
const iterationId = process.argv[2] ? parseInt(process.argv[2]) : 167;

getIterationTestCases(iterationId)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
