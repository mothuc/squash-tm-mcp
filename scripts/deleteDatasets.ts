import { SquashTMClient } from '../src/clients/SquashTMClient.js';

const client = new SquashTMClient();

async function deleteOldDatasets() {
  console.log('🗑️  Deleting old stg-* datasets from test case 3760...\n');

  const datasetsToDelete = [5101, 5099, 5100, 5104];

  let successCount = 0;
  let failCount = 0;

  for (const datasetId of datasetsToDelete) {
    try {
      await client.deleteDatasets(datasetId);
      console.log(`   ✅ Deleted dataset ID: ${datasetId}`);
      successCount++;
    } catch (error: any) {
      console.error(`   ❌ Failed to delete dataset ${datasetId}:`, error.message);
      failCount++;
    }
  }

  console.log(`\n✅ Deleted ${successCount} dataset(s), ${failCount} failed`);
}

deleteOldDatasets();
