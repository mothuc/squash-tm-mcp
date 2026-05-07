import * as dotenv from 'dotenv';
dotenv.config();

const datasetId = 3658;

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

// The 9 parameters from the feature file in order
const allParams = [
  { "_type": "parameter-value", "parameter_test_case_id": 2704, "parameter_id": 2732, "parameter_name": "bundle_product", "parameter_value": "Test Bundle (no discount)" },
  { "_type": "parameter-value", "parameter_test_case_id": 2704, "parameter_id": 2719, "parameter_name": "email", "parameter_value": "isla+jp3@dtn.com.vn" },
  { "_type": "parameter-value", "parameter_test_case_id": 2704, "parameter_id": 2723, "parameter_name": "orderType", "parameter_value": "HDC" },
  { "_type": "parameter-value", "parameter_test_case_id": 2704, "parameter_id": 2724, "parameter_name": "paymentMethod", "parameter_value": "銀行振込" },
  { "_type": "parameter-value", "parameter_test_case_id": 2704, "parameter_id": 2978, "parameter_name": "product1", "parameter_value": "M12 CHZ-0 JP" },
  { "_type": "parameter-value", "parameter_test_case_id": 2704, "parameter_id": 2979, "parameter_name": "product2", "parameter_value": "49-16-2567" },
  { "_type": "parameter-value", "parameter_test_case_id": 2704, "parameter_id": 2980, "parameter_name": "ship_via", "parameter_value": "" },
  { "_type": "parameter-value", "parameter_test_case_id": 2704, "parameter_id": 2718, "parameter_name": "shippingMethod", "parameter_value": "宅配業者による配送" },
  { "_type": "parameter-value", "parameter_test_case_id": 2704, "parameter_id": 2981, "parameter_name": "source", "parameter_value": "HNN_ECOM" }
];

// Test batch 1 (first 7)
console.log('Testing batch 1 (first 7 parameters)...');
const batch1 = allParams.slice(0, 7);
let patchData = {
  "_type": "dataset",
  "parameter_values": batch1
};

let response = await makeRequest(`${baseURL}/datasets/${datasetId}`, {
  method: 'PATCH',
  body: JSON.stringify(patchData)
});

console.log(`Status: ${response.status}`);
if (!response.ok) {
  console.log('Response:', await response.text());
}

// Test batch 2 (last 2)
console.log('\nTesting batch 2 (last 2 parameters)...');
const batch2 = allParams.slice(7, 9);
patchData = {
  "_type": "dataset",
  "parameter_values": batch2
};

response = await makeRequest(`${baseURL}/datasets/${datasetId}`, {
  method: 'PATCH',
  body: JSON.stringify(patchData)
});

console.log(`Status: ${response.status}`);
if (!response.ok) {
  console.log('Response:', await response.text());
}

// Test each parameter individually to find the problematic one
console.log('\n\nTesting each parameter individually...');
for (let i = 0; i < allParams.length; i++) {
  patchData = {
    "_type": "dataset",
    "parameter_values": [allParams[i]]
  };

  response = await makeRequest(`${baseURL}/datasets/${datasetId}`, {
    method: 'PATCH',
    body: JSON.stringify(patchData)
  });

  console.log(`Param ${i} (${allParams[i].parameter_name}): ${response.status} ${response.ok ? '✅' : '❌'}`);
  await response.text(); // consume
}
