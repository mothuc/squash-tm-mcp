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

// Get current dataset
const getResp = await makeRequest(`${baseURL}/datasets/${datasetId}`);
const dataset = await getResp.json();

// Test with different counts
for (let count of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
  const testData = {
    "_type": "dataset",
    "parameter_values": dataset.parameter_values.slice(0, count).map(pv => ({
      ...pv,
      _type: 'parameter-value'
    }))
  };

  const response = await makeRequest(`${baseURL}/datasets/${datasetId}`, {
    method: 'PATCH',
    body: JSON.stringify(testData)
  });

  console.log(`Count ${count}: Status ${response.status}`);
  await response.text(); // consume response
}
