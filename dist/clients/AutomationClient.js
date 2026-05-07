import { BaseClient } from './BaseClient.js';
/**
 * Client for Test Automation operations
 * Handles: Transmit test cases, automation requests
 */
export class AutomationClient extends BaseClient {
    /**
     * Transmit test case - mark test case as transmitted for automation
     * Requires web session authentication (username/password)
     */
    async transmitTestCase(testCaseId) {
        const username = process.env.SQUASH_TM_USERNAME;
        const password = process.env.SQUASH_TM_PASSWORD;
        if (!username || !password) {
            throw new Error('SQUASH_TM_USERNAME and SQUASH_TM_PASSWORD are required for transmit operation');
        }
        const webBaseURL = this.getWebBaseURL();
        // Step 1: Get initial session
        const sessionResponse = await fetch(`${webBaseURL}/login`, {
            method: 'GET',
            redirect: 'follow'
        });
        // Extract cookies from initial session
        let cookieMap = new Map();
        let setCookieHeaders = sessionResponse.headers.getSetCookie();
        setCookieHeaders.forEach(cookie => {
            const match = cookie.match(/([^=]+)=([^;]+)/);
            if (match) {
                cookieMap.set(match[1].trim(), match[2].trim());
            }
        });
        // Step 2: Login with credentials
        const cookieHeader = Array.from(cookieMap.entries())
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
        const credentials = Buffer.from(`${username}:${password}`).toString('base64');
        const loginResponse = await fetch(`${webBaseURL}/login`, {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader,
                'Authorization': `Basic ${credentials}`
            },
            redirect: 'follow'
        });
        // Extract ALL cookies from login response
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
            throw new Error('Missing required session cookies (JSESSIONID or XSRF-TOKEN)');
        }
        // Step 3: Transmit test case
        const transmitURL = `${webBaseURL}/backend/automation-requests/${testCaseId}/status`;
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
        if (!transmitResponse.ok) {
            const errorText = await transmitResponse.text();
            throw new Error(`Failed to transmit: ${transmitResponse.status} ${transmitResponse.statusText}\n${errorText}`);
        }
        const viewURL = `${webBaseURL.replace('/squash', '')}/squash/test-case-workspace/test-case/${testCaseId}/content?anchor=automation`;
        return {
            success: true,
            url: viewURL
        };
    }
    /**
     * Get automation requests (placeholder for future implementation)
     */
    async getAutomationRequests() {
        // TODO: Implement based on API endpoint
        throw new Error('Not implemented yet');
    }
    /**
     * Get automation request status (placeholder for future implementation)
     */
    async getAutomationRequestStatus(testCaseId) {
        // TODO: Implement based on API endpoint
        throw new Error('Not implemented yet');
    }
}
//# sourceMappingURL=AutomationClient.js.map