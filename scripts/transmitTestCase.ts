import * as dotenv from 'dotenv';

dotenv.config();

const TEST_CASE_ID = process.argv[2] || '2940';

async function transmitTestCase(testCaseId: string) {
  const username = process.env.SQUASH_TM_USERNAME!;
  const password = process.env.SQUASH_TM_PASSWORD!;
  const baseURL = process.env.SQUASH_TM_BASE_URL!.replace('/api/rest/latest', '');

  console.log(`\n🔄 Transmitting test case ${testCaseId}...`);

  // Step 1: Get initial session by accessing the login page (GET request)
  console.log('📝 Establishing session...');
  const sessionResponse = await fetch(`${baseURL}/login`, {
    method: 'GET',
    redirect: 'follow'
  });

  // Extract cookies from initial session
  let cookieMap = new Map<string, string>();
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
  const loginURL = `${baseURL}/login`;

  const loginResponse = await fetch(loginURL, {
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
  console.log(`   JSESSIONID: ${jsessionid.substring(0, 20)}...`);
  console.log(`   XSRF-TOKEN: ${xsrfToken.substring(0, 20)}...`);

  // Step 3: Transmit test case
  console.log(`📤 Transmitting test case ${testCaseId}...`);
  const transmitURL = `${baseURL}/backend/automation-requests/${testCaseId}/status`;

  // Build cookie header from all cookies in the map
  const finalCookieHeader = Array.from(cookieMap.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');

  const transmitResponse = await fetch(transmitURL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'text/plain',
      'Cookie': finalCookieHeader,
      'X-XSRF-TOKEN': xsrfToken
    },
    body: 'TRANSMITTED'
  });

  if (transmitResponse.ok) {
    console.log(`✅ Test case ${testCaseId} transmitted successfully`);
    console.log(`🔗 View at: ${baseURL.replace('/squash', '')}/squash/test-case-workspace/test-case/${testCaseId}/content?anchor=automation`);
  } else {
    const errorText = await transmitResponse.text();
    throw new Error(`Failed to transmit: ${transmitResponse.status} ${transmitResponse.statusText}\n${errorText}`);
  }
}

transmitTestCase(TEST_CASE_ID)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
