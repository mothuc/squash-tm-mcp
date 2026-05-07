import { SquashTMClient } from '../src/clients/SquashTMClient.js';

const client = new SquashTMClient();

async function verifyDatasets() {
  const testCase = await client.getTestCase(3760);

  console.log('📊 Current datasets in test case 3760:\n');

  if (testCase.datasets && testCase.datasets.length > 0) {
    testCase.datasets.forEach((ds: any) => {
      console.log(`   - ID: ${ds.id} | Name: "${ds.name}"`);
    });
  } else {
    console.log('   No datasets found');
  }
}

verifyDatasets();
