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

// First, let's GET the dataset to see its current structure
const baseURL = process.env.SQUASH_TM_BASE_URL;
console.log(`\n📥 Fetching dataset ${datasetId}...`);
const getResponse = await makeRequest(`${baseURL}/datasets/${datasetId}`);
const dataset = await getResponse.json();
console.log('\n📊 Current Dataset Structure:');
console.log(JSON.stringify(dataset, null, 2));

// Now try the PATCH with the payload from our sync script
const patchData = {
  _type: 'dataset',
  parameter_values: [
    {
      parameter_test_case_id: 2704,
      parameter_id: 2732,
      parameter_name: "bundle_product",
      parameter_value: "Test Bundle (no discount)"
    },
    {
      parameter_test_case_id: 2704,
      parameter_id: 2719,
      parameter_name: "email",
      parameter_value: "isla+jp3@dtn.com.vn"
    },
    {
      parameter_test_case_id: 2704,
      parameter_id: 2723,
      parameter_name: "orderType",
      parameter_value: "HDC"
    },
    {
      parameter_test_case_id: 2704,
      parameter_id: 2724,
      parameter_name: "paymentMethod",
      parameter_value: "銀行振込"
    },
    {
      parameter_test_case_id: 2704,
      parameter_id: 2978,
      parameter_name: "product1",
      parameter_value: "M12 CHZ-0 JP"
    },
    {
      parameter_test_case_id: 2704,
      parameter_id: 2979,
      parameter_name: "product2",
      parameter_value: "49-16-2567"
    },
    {
      parameter_test_case_id: 2704,
      parameter_id: 2980,
      parameter_name: "ship_via",
      parameter_value: ""
    },
    {
      parameter_test_case_id: 2704,
      parameter_id: 2718,
      parameter_name: "shippingMethod",
      parameter_value: "宅配業者による配送"
    },
    {
      parameter_test_case_id: 2704,
      parameter_id: 2981,
      parameter_name: "source",
      parameter_value: "HNN_ECOM"
    }
  ]
};

console.log('\n📤 Sending PATCH request...');
console.log('Payload:', JSON.stringify(patchData, null, 2));

const patchResponse = await makeRequest(`${baseURL}/datasets/${datasetId}`, {
  method: 'PATCH',
  body: JSON.stringify(patchData)
});

console.log(`\n📊 Response Status: ${patchResponse.status} ${patchResponse.statusText}`);
const responseText = await patchResponse.text();
console.log('Response Body:', responseText);
