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

// This is the EXACT payload from the debug output
const patchData = {
  "_type": "dataset",
  "parameter_values": [
    {
      "_type": "parameter-value",
      "parameter_test_case_id": 2704,
      "parameter_id": 2732,
      "parameter_name": "bundle_product",
      "parameter_value": "Test Bundle (no discount)"
    },
    {
      "_type": "parameter-value",
      "parameter_test_case_id": 2704,
      "parameter_id": 2719,
      "parameter_name": "email",
      "parameter_value": "isla+jp3@dtn.com.vn"
    },
    {
      "_type": "parameter-value",
      "parameter_test_case_id": 2704,
      "parameter_id": 2723,
      "parameter_name": "orderType",
      "parameter_value": "HDC"
    },
    {
      "_type": "parameter-value",
      "parameter_test_case_id": 2704,
      "parameter_id": 2724,
      "parameter_name": "paymentMethod",
      "parameter_value": "銀行振込"
    },
    {
      "_type": "parameter-value",
      "parameter_test_case_id": 2704,
      "parameter_id": 2978,
      "parameter_name": "product1",
      "parameter_value": "M12 CHZ-0 JP"
    },
    {
      "_type": "parameter-value",
      "parameter_test_case_id": 2704,
      "parameter_id": 2979,
      "parameter_name": "product2",
      "parameter_value": "49-16-2567"
    },
    {
      "_type": "parameter-value",
      "parameter_test_case_id": 2704,
      "parameter_id": 2980,
      "parameter_name": "ship_via",
      "parameter_value": ""
    },
    {
      "_type": "parameter-value",
      "parameter_test_case_id": 2704,
      "parameter_id": 2718,
      "parameter_name": "shippingMethod",
      "parameter_value": "宅配業者による配送"
    },
    {
      "_type": "parameter-value",
      "parameter_test_case_id": 2704,
      "parameter_id": 2981,
      "parameter_name": "source",
      "parameter_value": "HNN_ECOM"
    }
  ]
};

console.log('Sending PATCH request...');
const response = await makeRequest(`${baseURL}/datasets/${datasetId}`, {
  method: 'PATCH',
  body: JSON.stringify(patchData)
});

console.log(`Status: ${response.status} ${response.statusText}`);
const responseText = await response.text();
console.log('Response:', responseText);

// Now test with single parameter
console.log('\n\nTesting with single parameter...');
const singleParamData = {
  "_type": "dataset",
  "parameter_values": [
    {
      "_type": "parameter-value",
      "parameter_test_case_id": 2704,
      "parameter_id": 2732,
      "parameter_name": "bundle_product",
      "parameter_value": "Test Bundle (no discount)"
    }
  ]
};

const response2 = await makeRequest(`${baseURL}/datasets/${datasetId}`, {
  method: 'PATCH',
  body: JSON.stringify(singleParamData)
});

console.log(`Status: ${response2.status} ${response2.statusText}`);
const responseText2 = await response2.text();
console.log('Response:', responseText2.substring(0, 500));
