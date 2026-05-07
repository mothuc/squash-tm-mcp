import { SquashTMClient } from '../src/clients/SquashTMClient.js';

const client = new SquashTMClient();

async function deleteParam() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: npx tsx deleteParameter.ts <test-case-id> <parameter-name>');
    process.exit(1);
  }

  const testCaseId = parseInt(args[0], 10);
  const paramName = args[1];

  console.log(`\n🗑️  Deleting parameter "${paramName}" from test case ${testCaseId}...\n`);

  // Get test case to find parameter ID
  const testCase = await client.getTestCase(testCaseId);
  const param = testCase.parameters?.find((p: any) => p.name === paramName);

  if (!param) {
    console.log(`   ⚠️  Parameter "${paramName}" not found`);
    process.exit(1);
  }

  console.log(`   Found parameter: ID ${param.id} | Name "${param.name}"`);

  // Delete parameter
  await client.deleteParameter(param.id);

  console.log(`   ✅ Deleted parameter "${paramName}"\n`);
}

deleteParam();
