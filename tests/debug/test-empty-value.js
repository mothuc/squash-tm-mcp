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

// Test 1: empty string
console.log('Test 1: Empty string ""');
let patchData = {
  "_type": "dataset",
  "parameter_values": [{
    "_type": "parameter-value",
    "parameter_test_case_id": 2704,
    "parameter_id": 2980,
    "parameter_name": "ship_via",
    "parameter_value": ""
  }]
};

let response = await makeRequest(`${baseURL}/datasets/${datasetId}`, {
  method: 'PATCH',
  body: JSON.stringify(patchData)
});

console.log(`Status: ${response.status}`);
console.log('Response:', await response.text());

// Test 2: null
console.log('\n\nTest 2: null value');
patchData = {
  "_type": "dataset",
  "parameter_values": [{
    "_type": "parameter-value",
    "parameter_test_case_id": 2704,
    "parameter_id": 2980,
    "parameter_name": "ship_via",
    "parameter_value": null
  }]
};

response = await makeRequest(`${baseURL}/datasets/${datasetId}`, {
  method: 'PATCH',
  body: JSON.stringify(patchData)
});

console.log(`Status: ${response.status}`);
console.log('Response:', (await response.text()).substring(0, 200));

// Test 3: space
console.log('\n\nTest 3: Single space " "');
patchData = {
  "_type": "dataset",
  "parameter_values": [{
    "_type": "parameter-value",
    "parameter_test_case_id": 2704,
    "parameter_id": 2980,
    "parameter_name": "ship_via",
    "parameter_value": " "
  }]
};

response = await makeRequest(`${baseURL}/datasets/${datasetId}`, {
  method: 'PATCH',
  body: JSON.stringify(patchData)
});

console.log(`Status: ${response.status}`);
console.log('Response:', (await response.text()).substring(0, 200));

// Test 4: Don't send the parameter at all
console.log('\n\nTest 4: Exclude parameter entirely');
patchData = {
  "_type": "dataset",
  "parameter_values": [{
    "_type": "parameter-value",
    "parameter_test_case_id": 2704,
    "parameter_id": 2979,
    "parameter_name": "product2",
    "parameter_value": "49-16-2567"
  }]
};

response = await makeRequest(`${baseURL}/datasets/${datasetId}`, {
  method: 'PATCH',
  body: JSON.stringify(patchData)
});

console.log(`Status: ${response.status}`);
console.log('Response:', (await response.text()).substring(0, 200));
