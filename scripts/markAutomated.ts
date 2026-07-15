import * as dotenv from 'dotenv';

dotenv.config();

const TEST_CASE_ID = process.argv[2];

if (!TEST_CASE_ID) {
  console.error('❌ Usage: npm run automated <testCaseId>');
  process.exit(1);
}

async function markAutomated(testCaseId: string) {
  const username = process.env.SQUASH_TM_USERNAME!;
  const password = process.env.SQUASH_TM_PASSWORD!;
  const baseURL = process.env.SQUASH_TM_BASE_URL!.replace('/api/rest/latest', '');

  console.log(`\n🔄 Marking test case ${testCaseId} as AUTOMATED...`);

  // Step 1: Get initial session by accessing the login page (GET request)
  console.log('📝 Establishing session...');
  const sessionResponse = await fetch(`${baseURL}/login`, {
    method: 'GET',
    redirect: 'follow'
  });

  // Extract cookies from initial session
  const cookieMap = new Map<string, string>();
  let setCookieHeaders = sessionResponse.headers.getSetCookie();

  setCookieHeaders.forEach(cookie => {
    const match = cookie.match(/([^=]+)=([^;]+)/);
    if (match) {
      cookieMap.set(match[1].trim(), match[2].trim());
    }
  });

  // Step 2: Login with credentials using basic auth header
  console.log('📝 Authenticating...');
  const cookieHeader = Array.from(cookieMap.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');

  const credentials = Buffer.from(`${username}:${password}`).toString('base64');

  const loginResponse = await fetch(`${baseURL}/login`, {
    method: 'GET',
    headers: {
      'Cookie': cookieHeader,
      'Authorization': `Basic ${credentials}`
    },
    redirect: 'follow'
  });

  // Extract ALL cookies from login response and update the map
  setCookieHeaders = loginResponse.headers.getSetCookie();
  if (setCookieHeaders && setCookieHeaders.length > 0) {
    setCookieHeaders.forEach(cookie => {
      const match = cookie.match(/([^=]+)=([^;]+)/);
      if (match) {
        cookieMap.set(match[1].trim(), match[2].trim());
      }
    });
  }

  const jsessionid = cookieMap.get('JSESSIONID');
  const xsrfToken = cookieMap.get('XSRF-TOKEN');

  if (!jsessionid || !xsrfToken) {
    console.log('Available cookies:', Array.from(cookieMap.keys()).join(', '));
    console.log('Login response status:', loginResponse.status);
    throw new Error('Missing required session cookies (JSESSIONID or XSRF-TOKEN)');
  }

  console.log('✅ Authentication successful');

  // Step 3: Set automation request status to AUTOMATED
  console.log(`📤 Setting status to AUTOMATED for test case ${testCaseId}...`);
  const statusURL = `${baseURL}/backend/automation-requests/${testCaseId}/request-status`;

  const finalCookieHeader = Array.from(cookieMap.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');

  const response = await fetch(statusURL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'Cookie': finalCookieHeader,
      'X-XSRF-TOKEN': xsrfToken
    },
    body: JSON.stringify({ requestStatus: 'AUTOMATED' })
  });

  if (response.ok) {
    console.log(`✅ Test case ${testCaseId} marked as AUTOMATED successfully`);
    console.log(`🔗 View at: ${baseURL.replace('/squash', '')}/squash/test-case-workspace/test-case/${testCaseId}/content?anchor=automation`);
  } else {
    const errorText = await response.text();
    throw new Error(`Failed to mark as AUTOMATED: ${response.status} ${response.statusText}\n${errorText}`);
  }
}

markAutomated(TEST_CASE_ID)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
