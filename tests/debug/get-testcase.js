#!/usr/bin/env node

import { SquashTMClient } from './dist/clients/index.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function getTestCase() {
  const testCaseId = parseInt(process.argv[2]);

  if (!testCaseId) {
    console.error('Usage: node get-testcase.js <testCaseId>');
    process.exit(1);
  }

  try {
    const client = new SquashTMClient();
    const testCase = await client.getTestCase(testCaseId);

    console.log('Test Case:', JSON.stringify(testCase, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getTestCase();
