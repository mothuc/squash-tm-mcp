import * as dotenv from 'dotenv';
dotenv.config();

const testCaseId = 2704;
const datasetId = 3658; // multiple_items dataset

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

const baseURL = process.env.SQUASH_TM_BASE_URL;

// Try minimal PATCH - just update one parameter value
console.log('\n🧪 Test 1: Minimal PATCH with _type fields');
const minimalPatch = {
  _type: 'dataset',
  parameter_values: [
    {
      _type: 'parameter-value',
      parameter_test_case_id: 2704,
      parameter_id: 2732,
      parameter_name: "bundle_product",
      parameter_value: "Test Bundle (no discount)"
    }
  ]
};

console.log('Payload:', JSON.stringify(minimalPatch, null, 2));
let response = await makeRequest(`${baseURL}/datasets/${datasetId}`, {
  method: 'PATCH',
  body: JSON.stringify(minimalPatch)
});

console.log(`Response Status: ${response.status} ${response.statusText}`);
let responseText = await response.text();
console.log('Response Body:', responseText);

// Try without _type in parameter_values
console.log('\n\n🧪 Test 2: Try without parameter_values array, use individual parameter update');
const individualPatch = {
  _type: 'dataset'
};

console.log('Payload:', JSON.stringify(individualPatch, null, 2));
response = await makeRequest(`${baseURL}/datasets/${datasetId}`, {
  method: 'PATCH',
  body: JSON.stringify(individualPatch)
});

console.log(`Response Status: ${response.status} ${response.statusText}`);
responseText = await response.text();
console.log('Response Body:', responseText);
