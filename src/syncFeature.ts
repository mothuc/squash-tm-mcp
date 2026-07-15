import * as fs from 'fs';
import { SquashTMClient } from './clients/index.js';
import { SyncResult } from './types.js';

/**
 * Sync a Gherkin feature file to a Squash TM test case.
 *
 * Single source of truth for the sync algorithm, used by both the MCP server
 * (src/index.ts) and the standalone script (scripts/syncSquashTM.ts).
 *
 * All API/parsing logic lives in SquashTMClient. Parameters are auto-created
 * inside client.syncDataset when they don't exist in Squash TM.
 */
export async function syncFeatureToSquashTM(
  client: SquashTMClient,
  featureFilePath: string,
  testCaseId: number
): Promise<SyncResult> {
  const featureContent = fs.readFileSync(featureFilePath, 'utf-8');
  const gherkinSteps = client.parseGherkinSteps(featureContent);
  const datasets = client.parseDatasets(featureContent);

  const squashSteps = await client.getAllSteps(testCaseId);

  const stepsToDelete: number[] = [];
  const stepsToUpdate: Array<{ id: number; step: any }> = [];
  const stepsToCreate: any[] = [];

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

  // Execute sync
  if (stepsToDelete.length > 0) {
    await client.deleteTestSteps(stepsToDelete);
  }

  for (const { id, step } of stepsToUpdate) {
    await client.updateKeywordStep(id, step.keyword, step.text, step.datatable, step.comment);
  }

  for (const step of stepsToCreate) {
    await client.createKeywordStep(testCaseId, step.keyword, step.text, step.datatable, step.comment);
  }

  // Sync datasets
  const testCase = await client.getTestCase(testCaseId);
  const localDatasetNames = new Set(datasets.map(ds => ds.name));
  const remoteDatasets = testCase.datasets || [];

  // Delete datasets that exist in Squash TM but not in feature file
  const datasetsToDelete = remoteDatasets
    .filter((ds: any) => !localDatasetNames.has(ds.name))
    .map((ds: any) => ds.id);

  if (datasetsToDelete.length > 0) {
    await client.deleteDatasets(datasetsToDelete);
  }

  // Sync datasets from feature file (create or update)
  // Parameters will be auto-created if they don't exist
  let datasetsSynced = 0;
  for (const dataset of datasets) {
    await client.syncDataset(testCaseId, dataset.name, dataset.params, dataset.values);
    datasetsSynced++;
  }

  // Cleanup unused parameters after dataset sync
  // Note: Disabled due to timing issue - cleanup happens before datasets are fully populated
  // This can cause false positives where newly created parameters get deleted
  // await client.cleanupUnusedParameters(testCaseId);

  return {
    success: true,
    message: `Synced ${gherkinSteps.length} steps to test case ${testCaseId}`,
    details: {
      stepsDeleted: stepsToDelete.length,
      stepsUpdated: stepsToUpdate.length,
      stepsCreated: stepsToCreate.length,
      datasetsSynced,
      datasetsDeleted: datasetsToDelete.length,
    },
  };
}
