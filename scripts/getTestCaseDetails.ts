import { SquashTMClient } from '../src/clients/SquashTMClient.js';

const client = new SquashTMClient();

async function getDetails() {
  const args = process.argv.slice(2);
  const testCaseId = args[0] ? parseInt(args[0], 10) : 3760;

  console.log(`\n📋 Test case ${testCaseId} details:\n`);

  const testCase = await client.getTestCase(testCaseId);

  console.log('📊 Parameters:');
  if (testCase.parameters && testCase.parameters.length > 0) {
    testCase.parameters.forEach((p: any) => {
      console.log(`   - ID: ${p.id} | Name: "${p.name}"`);
    });
  } else {
    console.log('   (No parameters)');
  }

  console.log('\n📊 Datasets:');
  if (testCase.datasets && testCase.datasets.length > 0) {
    testCase.datasets.forEach((ds: any) => {
      console.log(`\n   Dataset: "${ds.name}" (ID: ${ds.id})`);
      if (ds.parameter_values && ds.parameter_values.length > 0) {
        ds.parameter_values.forEach((pv: any) => {
          console.log(`      - ${pv.parameter_name} = "${pv.parameter_value}"`);
        });
      }
    });
  } else {
    console.log('   (No datasets)');
  }
}

getDetails();
