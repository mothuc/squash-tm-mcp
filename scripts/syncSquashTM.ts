import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { SquashTMClient } from '../src/clients/index.js';
import { syncFeatureToSquashTM } from '../src/syncFeature.js';

dotenv.config();

// Thin wrapper around the shared sync logic (src/syncFeature.ts).
// All parsing/API/sync behavior lives in SquashTMClient — no duplication here.

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: npx tsx scripts/syncSquashTM.ts <feature-file-path> <test-case-id>');
  console.error('Example: npx tsx scripts/syncSquashTM.ts features/Admin_features/Order/2641_Create_Pickup_order.feature 2641');
  process.exit(1);
}

const featureFilePath = args[0];
const testCaseId = parseInt(args[1], 10);

if (!fs.existsSync(featureFilePath)) {
  console.error(`Error: Feature file not found: ${featureFilePath}`);
  process.exit(1);
}

console.log(`\n🔄 Syncing "${featureFilePath}" to Squash TM test case ${testCaseId}...\n`);

const client = new SquashTMClient();

syncFeatureToSquashTM(client, featureFilePath, testCaseId)
  .then(result => {
    console.log(result.message);
    console.log(`   - Steps deleted: ${result.details?.stepsDeleted}`);
    console.log(`   - Steps updated: ${result.details?.stepsUpdated}`);
    console.log(`   - Steps created: ${result.details?.stepsCreated}`);
    console.log(`   - Datasets synced: ${result.details?.datasetsSynced}`);
    console.log(`   - Datasets deleted: ${result.details?.datasetsDeleted}`);
    console.log(`\n✅ Sync complete!\n`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
