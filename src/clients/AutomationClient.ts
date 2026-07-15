import { BaseClient } from './BaseClient.js';

/**
 * Client for Test Automation operations
 * Handles: Transmit test cases, automation requests
 */
interface WebSession {
  cookieHeader: string;
  xsrfToken: string;
  webBaseURL: string;
}

export class AutomationClient extends BaseClient {
  /**
   * Cached web session, reused across calls until it is rejected (401/403)
   * or explicitly invalidated. Avoids re-logging in for every operation.
   */
  private cachedSession: WebSession | null = null;

  /**
   * Get a web session, reusing the cached one when available.
   * Pass force=true to discard the cache and log in again.
   */
  private async getWebSession(force = false): Promise<WebSession> {
    if (!force && this.cachedSession) {
      return this.cachedSession;
    }
    this.cachedSession = await this.establishWebSession();
    return this.cachedSession;
  }

  /**
   * Perform a request against a UI backend endpoint using the cached web
   * session. If the session has expired (401/403), it re-logs in once and
   * retries the request with a fresh session.
   */
  private async sessionRequest(
    buildURL: (webBaseURL: string) => string,
    init: (session: WebSession) => RequestInit
  ): Promise<Response> {
    let session = await this.getWebSession();
    let response = await fetch(buildURL(session.webBaseURL), init(session));

    // Session likely expired -> re-login once and retry.
    if (response.status === 401 || response.status === 403) {
      session = await this.getWebSession(true);
      response = await fetch(buildURL(session.webBaseURL), init(session));
    }

    return response;
  }

  /**
   * Establish an authenticated web session (JSESSIONID + XSRF-TOKEN).
   * The Squash TM UI backend endpoints require web session cookies,
   * not the REST API token.
   */
  private async establishWebSession(): Promise<WebSession> {
    const username = process.env.SQUASH_TM_USERNAME;
    const password = process.env.SQUASH_TM_PASSWORD;

    if (!username || !password) {
      throw new Error('SQUASH_TM_USERNAME and SQUASH_TM_PASSWORD are required for web session operations');
    }

    const webBaseURL = this.getWebBaseURL();

    // Step 1: Get initial session
    const sessionResponse = await fetch(`${webBaseURL}/login`, {
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

    const finalCookieHeader = Array.from(cookieMap.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    return { cookieHeader: finalCookieHeader, xsrfToken, webBaseURL };
  }

  /**
   * Transmit test case - mark test case as transmitted for automation
   * Requires web session authentication (username/password)
   */
  async transmitTestCase(testCaseId: string): Promise<{ success: boolean; url: string }> {
    const response = await this.sessionRequest(
      (webBaseURL) => `${webBaseURL}/backend/automation-requests/${testCaseId}/status`,
      (session) => ({
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'text/plain',
          'Cookie': session.cookieHeader,
          'X-XSRF-TOKEN': session.xsrfToken
        },
        body: 'TRANSMITTED'
      })
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to transmit: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const webBaseURL = this.getWebBaseURL();
    const viewURL = `${webBaseURL.replace('/squash', '')}/squash/test-case-workspace/test-case/${testCaseId}/content?anchor=automation`;

    return {
      success: true,
      url: viewURL
    };
  }

  /**
   * Mark test case automation request as AUTOMATED - marks the test as ready
   * to be run in an execution. Requires web session authentication.
   *
   * Hits: POST /backend/automation-requests/{id}/request-status
   * Body: {"requestStatus":"AUTOMATED"}
   */
  async markTestCaseAutomated(testCaseId: string): Promise<{ success: boolean; url: string }> {
    const response = await this.sessionRequest(
      (webBaseURL) => `${webBaseURL}/backend/automation-requests/${testCaseId}/request-status`,
      (session) => ({
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Cookie': session.cookieHeader,
          'X-XSRF-TOKEN': session.xsrfToken
        },
        body: JSON.stringify({ requestStatus: 'AUTOMATED' })
      })
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to mark as AUTOMATED: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const webBaseURL = this.getWebBaseURL();
    const viewURL = `${webBaseURL.replace('/squash', '')}/squash/test-case-workspace/test-case/${testCaseId}/content?anchor=automation`;

    return {
      success: true,
      url: viewURL
    };
  }

  /**
   * Get automation requests (placeholder for future implementation)
   */
  async getAutomationRequests(): Promise<any[]> {
    // TODO: Implement based on API endpoint
    throw new Error('Not implemented yet');
  }

  /**
   * Get automation request status (placeholder for future implementation)
   */
  async getAutomationRequestStatus(testCaseId: string): Promise<string> {
    // TODO: Implement based on API endpoint
    throw new Error('Not implemented yet');
  }
}
