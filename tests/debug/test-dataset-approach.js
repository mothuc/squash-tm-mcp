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

// Get current dataset to see parameter values structure
console.log('Fetching current dataset...');
const getResp = await makeRequest(`${baseURL}/datasets/${datasetId}`);
const dataset = await getResp.json();

console.log('\nCurrent parameter_values:');
dataset.parameter_values.forEach((pv, i) => {
  console.log(`${i}: ${JSON.stringify(pv)}`);
});

// Try approach 1: Send all parameter values as-is from the GET response
console.log('\n\n🧪 Test 1: Update using exact structure from GET response');
const test1Data = {
  "_type": "dataset",
  "parameter_values": dataset.parameter_values
};

let response = await makeRequest(`${baseURL}/datasets/${datasetId}`, {
  method: 'PATCH',
  body: JSON.stringify(test1Data)
});

console.log(`Status: ${response.status} ${response.statusText}`);
console.log('Response:', await response.text());

// Try approach 2: Maybe we need to send ALL 9 parameters with _type
console.log('\n\n🧪 Test 2: Update only the first 3 parameters with _type');
const test2Data = {
  "_type": "dataset",
  "parameter_values": dataset.parameter_values.slice(0, 3).map(pv => ({
    ...pv,
    _type: 'parameter-value'
  }))
};

response = await makeRequest(`${baseURL}/datasets/${datasetId}`, {
  method: 'PATCH',
  body: JSON.stringify(test2Data)
});

console.log(`Status: ${response.status} ${response.statusText}`);
console.log('Response:', (await response.text()).substring(0, 300));
