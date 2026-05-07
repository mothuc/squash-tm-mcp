import * as dotenv from 'dotenv';
dotenv.config();

const testCaseId = 2704;

// Helper function for API requests
async function makeRequest(url, options = {}) {
  const apiToken = process.env.SQUASH_TM_API_TOKEN;
  const username = process.env.SQUASH_TM_USERNAME;
  const password = process.env.SQUASH_TM_PASSWORD;

  let authHeader;

  if (apiToken) {
    authHeader = `Bearer ${apiToken}`;
  } else if (username && password) {
    const authBase64 = Buffer.from(`${username}:${password}`).toString('base64');
    authHeader = `Basic ${authBase64}`;
  } else {
    throw new Error('No authentication credentials found');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': authHeader,
      ...options.headers
    }
  });

  return response;
}

// Get test case details
async function getTestCase(testCaseId) {
  const baseURL = process.env.SQUASH_TM_BASE_URL;
  const response = await makeRequest(`${baseURL}/test-cases/${testCaseId}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch test case: ${response.status} ${response.statusText}\n${errorText}`);
  }

  return await response.json();
}

// Main
const testCase = await getTestCase(testCaseId);

console.log('\n📊 Test Case Parameters:');
testCase.parameters.forEach(param => {
  console.log(`   - ID: ${param.id} | Name: "${param.name}"`);
});

console.log('\n📊 Existing Datasets:');
testCase.datasets.forEach(ds => {
  console.log(`\n   Dataset ID: ${ds.id} | Name: "${ds.name}"`);
  console.log(`   Parameters:`, ds.parameters);
  console.log(`   Parameter Values:`, ds.parameter_values);
});

// Try to build the payload for "multiple_items" dataset
const datasetName = "multiple_items";
const params = ["bundle_product", "email", "orderType", "paymentMethod", "product1", "product2", "ship_via", "shippingMethod", "source"];
const values = ["Test Bundle (no discount)", "isla+jp3@dtn.com.vn", "HDC", "銀行振込", "M12 CHZ-0 JP", "49-16-2567", "", "宅配業者による配送", "HNN_ECOM"];

const parameters = params.map(paramName => {
  const param = testCase.parameters.find(p => p.name === paramName);
  if (!param) {
    console.warn(`   ⚠️  Parameter '${paramName}' not found in test case`);
  }
  return param;
}).filter(Boolean);

console.log('\n📋 Matched Parameters:');
parameters.forEach((p, i) => {
  console.log(`   ${i}: ${p.name} (ID: ${p.id}) = ${values[i]}`);
});

const parameter_values = parameters.map((param, index) => ({
  parameter_test_case_id: testCaseId,
  parameter_id: param.id,
  parameter_name: param.name,
  parameter_value: values[index]
}));

console.log('\n📋 Parameter Values Array:');
console.log(JSON.stringify(parameter_values, null, 2));

const patchData = {
  _type: 'dataset',
  parameter_values
};

console.log('\n📋 PATCH Payload:');
console.log(JSON.stringify(patchData, null, 2));
