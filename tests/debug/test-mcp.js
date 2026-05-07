#!/usr/bin/env node

import { SquashTMClient } from './dist/clients/index.js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

// Sync feature file to Squash TM
async function syncFeatureToSquashTM(client, featureFilePath, testCaseId) {
  const featureContent = fs.readFileSync(featureFilePath, 'utf-8');
  const gherkinSteps = client.parseGherkinSteps(featureContent);
  const datasets = client.parseDatasets(featureContent);

  console.log(`📄 Parsed ${gherkinSteps.length} Gherkin steps from feature file`);
  console.log(`📊 Parsed ${datasets.length} datasets from Examples sections`);

  const squashSteps = await client.getAllSteps(testCaseId);
  console.log(`🔍 Found ${squashSteps.length} existing steps in Squash TM`);

  const stepsToDelete = [];
  const stepsToUpdate = [];
  const stepsToCreate = [];

  if (squashSteps.length > gherkinSteps.length) {
    for (let i = gherkinSteps.length; i < squashSteps.length; i++) {
      stepsToDelete.push(squashSteps[i].id);
    }
  }

  for (let i = 0; i < gherkinSteps.length; i++) {
    if (i < squashSteps.length) {
      const squashStep = squashSteps[i];
      const gherkinStep = gherkinSteps[i];

      const keywordChanged = squashStep.keyword !== gherkinStep.keyword;
      const actionChanged = squashStep.action !== gherkinStep.text;
      const datatableChanged = (squashStep.datatable || '') !== (gherkinStep.datatable || '');
      const commentChanged = (squashStep.comment || '') !== (gherkinStep.comment || '');

      if (keywordChanged || actionChanged || datatableChanged || commentChanged) {
        stepsToUpdate.push({ id: squashStep.id, step: gherkinStep });
      }
    } else {
      stepsToCreate.push(gherkinSteps[i]);
    }
  }

  console.log(`\n📋 Sync Plan:`);
  console.log(`   ❌ Delete: ${stepsToDelete.length} steps`);
  console.log(`   ✏️  Update: ${stepsToUpdate.length} steps`);
  console.log(`   ➕ Create: ${stepsToCreate.length} steps`);

  // Execute sync
  if (stepsToDelete.length > 0) {
    console.log(`\n🗑️  Deleting ${stepsToDelete.length} steps...`);
    await client.deleteTestSteps(stepsToDelete);
  }

  for (const { id, step } of stepsToUpdate) {
    console.log(`✏️  Updating step ${id}: ${step.keyword} ${step.text.substring(0, 50)}...`);
    await client.updateKeywordStep(id, step.keyword, step.text, step.datatable, step.comment);
  }

  for (const step of stepsToCreate) {
    console.log(`➕ Creating step: ${step.keyword} ${step.text.substring(0, 50)}...`);
    await client.createKeywordStep(testCaseId, step.keyword, step.text, step.datatable, step.comment);
  }

  // Sync datasets
  let datasetsSynced = 0;
  if (datasets.length > 0) {
    console.log(`\n📊 Syncing ${datasets.length} datasets...`);
    const testCase = await client.getTestCase(testCaseId);

    for (const dataset of datasets) {
      const parameters = dataset.params
        .map(paramName => testCase.parameters?.find((p) => p.name === paramName))
        .filter(Boolean);

      if (parameters.length === dataset.params.length) {
        console.log(`   ✅ Syncing dataset "${dataset.name}" with ${dataset.values.length} rows`);
        await client.syncDataset(testCaseId, dataset.name, parameters, dataset.values);
        datasetsSynced++;
      } else {
        console.log(`   ⚠️  Skipping dataset "${dataset.name}" - parameter mismatch`);
      }
    }
  }

  return {
    success: true,
    message: `Synced ${gherkinSteps.length} steps to test case ${testCaseId}`,
    details: {
      stepsDeleted: stepsToDelete.length,
      stepsUpdated: stepsToUpdate.length,
      stepsCreated: stepsToCreate.length,
      datasetsSynced,
    },
  };
}

// Main test function
async function testMCP() {
  const testCaseId = parseInt(process.argv[2]);
  const featureFilePath = process.argv[3];

  if (!testCaseId || !featureFilePath) {
    console.error('Usage: node test-mcp.js <testCaseId> <featureFilePath>');
    process.exit(1);
  }

  if (!fs.existsSync(featureFilePath)) {
    console.error(`❌ Feature file not found: ${featureFilePath}`);
    process.exit(1);
  }

  console.log(`\n🚀 Testing MCP Sync Tool`);
  console.log(`📝 Test Case ID: ${testCaseId}`);
  console.log(`📄 Feature File: ${featureFilePath}\n`);

  try {
    const client = new SquashTMClient();
    const result = await syncFeatureToSquashTM(client, featureFilePath, testCaseId);

    console.log(`\n✅ Sync completed successfully!\n`);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`\n❌ Sync failed:`, error.message);
    process.exit(1);
  }
}

testMCP();
