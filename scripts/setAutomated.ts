import * as dotenv from 'dotenv';

dotenv.config();

const STATUS = 'AUTOMATED';

async function setStatus(testCaseId: string) {
  const username = process.env.SQUASH_TM_USERNAME!;
  const password = process.env.SQUASH_TM_PASSWORD!;
  const baseURL = process.env.SQUASH_TM_BASE_URL!.replace('/api/rest/latest', '');

  const cookieMap = new Map<string, string>();
  const collect = (headers: Headers) =>
    headers.getSetCookie().forEach(c => {
      const m = c.match(/([^=]+)=([^;]+)/);
      if (m) cookieMap.set(m[1].trim(), m[2].trim());
    });

  const s1 = await fetch(`${baseURL}/login`, { method: 'GET', redirect: 'follow' });
  collect(s1.headers);

  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  const s2 = await fetch(`${baseURL}/login`, {
    method: 'GET',
    headers: {
      Cookie: Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join('; '),
      Authorization: `Basic ${credentials}`,
    },
    redirect: 'follow',
  });
  collect(s2.headers);

  const xsrfToken = cookieMap.get('XSRF-TOKEN');
  if (!cookieMap.get('JSESSIONID') || !xsrfToken) {
    throw new Error('Missing session cookies');
  }

  const res = await fetch(`${baseURL}/backend/automation-requests/${testCaseId}/status`, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'text/plain',
      Cookie: Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join('; '),
      'X-XSRF-TOKEN': xsrfToken,
    },
    body: STATUS,
  });

  if (res.ok) {
    console.log(`✅ Test case ${testCaseId} -> ${STATUS}`);
  } else {
    throw new Error(`Failed ${testCaseId}: ${res.status} ${res.statusText}\n${await res.text()}`);
  }
}

(async () => {
  for (const id of process.argv.slice(2)) {
    await setStatus(id);
  }
})().catch(e => {
  console.error('❌', e.message);
  process.exit(1);
});
