import * as dotenv from 'dotenv';
dotenv.config();

const datasetId = 3658;
const testCaseId = 2704;

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

const baseURL = process.env.SQUASH_TM_BASE_URL.replace('/api/rest/latest', '');

// First, get the dataset to see parameter value IDs
console.log('Getting dataset info...');
const getResponse = await makeRequest(`${process.env.SQUASH_TM_BASE_URL}/datasets/${datasetId}`);
const dataset = await getResponse.json();

console.log('\nDataset parameter values:');
dataset.parameter_values.forEach((pv, i) => {
  console.log(`${i}: ID=${pv.parameter_id} Name="${pv.parameter_name}" Value="${pv.parameter_value}"`);
});

// Try to find the parameter value ID for ship_via (the empty one)
const shipViaParam = dataset.parameter_values.find(pv => pv.parameter_name === 'ship_via');
console.log('\nship_via parameter:', shipViaParam);

// Now let's see if we can get individual parameter value details
// First we need to know the parameter value ID (not parameter ID)
// Let's try the backend endpoint to get parameter values for this dataset
console.log('\n\nTrying backend endpoint to get dataset parameter values...');
const backendUrl = `${baseURL}/backend/datasets/${datasetId}/parameter-values`;
console.log('URL:', backendUrl);

const backendResponse = await makeRequest(backendUrl);
console.log(`Status: ${backendResponse.status}`);
const backendData = await backendResponse.text();
console.log('Response:', backendData.substring(0, 500));

// Let's also try to get the test case to see if it has parameter value IDs
console.log('\n\nGetting test case to find parameter value IDs...');
const tcResponse = await makeRequest(`${process.env.SQUASH_TM_BASE_URL}/test-cases/${testCaseId}`);
const tcData = await tcResponse.json();

if (tcData.datasets) {
  const ds = tcData.datasets.find(d => d.id === datasetId);
  if (ds) {
    console.log('\nDataset in test case:');
    console.log(JSON.stringify(ds, null, 2));
  }
}
