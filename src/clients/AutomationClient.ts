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

export interface CreateAndExecuteConfig {
  /** Iteration the test-plan items belong to. Always used for status polling
   *  in createAndExecuteInBatches, regardless of `context`. */
  iterationId: number;
  testPlanSubsetIds: number[];
  projectId: number;
  namespaces?: string[];
  environmentTags?: string[];
  environmentVariables?: Record<string, string>;
  /** Overrides the `context` sent to create-and-execute. Defaults to
   *  `{ type: 'ITERATION', id: iterationId }` when omitted — pass
   *  `{ type: 'TEST_SUITE', id: <testSuiteId> }` to trigger from a suite. */
  context?: { type: 'ITERATION' | 'TEST_SUITE'; id: number };
}

export interface BatchResult {
  batchIndex: number;
  testPlanSubsetIds: number[];
  success: boolean;
  response?: any;
  error?: string;
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

  /**
   * Raw test-plan items for an iteration ({ id, execution_status, ... } per
   * item). Shared by getIterationTestPlanItemIds and getIterationTestPlanStatuses.
   */
  private async fetchIterationTestPlanItems(iterationId: number): Promise<any[]> {
    const response = await this.makeRequest(`${this.baseURL}/iterations/${iterationId}/test-plan?size=1000`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch test plan for iteration ${iterationId}: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    const data: any = await response.json();
    return data._embedded?.['test-plan'] || [];
  }

  /**
   * Fetch test-plan-item IDs for an iteration (the "10451" style IDs used as
   * testPlanSubsetIds), optionally filtered by execution_status. Uses the
   * REST API (Bearer/Basic token), not the web session.
   */
  async getIterationTestPlanItemIds(iterationId: number, executionStatusFilter?: string[]): Promise<number[]> {
    const items = await this.fetchIterationTestPlanItems(iterationId);

    const filtered =
      executionStatusFilter && executionStatusFilter.length > 0
        ? items.filter((item) => executionStatusFilter.includes(item.execution_status))
        : items;

    return filtered.map((item) => item.id);
  }

  /**
   * Current execution_status per test-plan-item ID, e.g. { 10456: "SUCCESS" }.
   * Used to detect when a dispatched batch has actually finished running,
   * as opposed to merely having been submitted to the Orchestrator.
   */
  async getIterationTestPlanStatuses(iterationId: number): Promise<Record<number, string>> {
    const items = await this.fetchIterationTestPlanItems(iterationId);
    const statuses: Record<number, string> = {};
    for (const item of items) {
      statuses[item.id] = item.execution_status;
    }
    return statuses;
  }

  /**
   * Raw test-plan items for a test suite. A test suite doesn't own separate
   * test-plan-items — it's a filtered view over a subset of its parent
   * iteration's test plan, so these ids live in the same space as
   * getIterationTestPlanItemIds/getIterationTestPlanStatuses.
   */
  private async fetchTestSuiteTestPlanItems(testSuiteId: number): Promise<any[]> {
    const response = await this.makeRequest(`${this.baseURL}/test-suites/${testSuiteId}/test-plan?size=1000`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch test plan for test suite ${testSuiteId}: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    const data: any = await response.json();
    return data._embedded?.['test-plan'] || [];
  }

  /**
   * Fetch test-plan-item IDs for a test suite, optionally filtered by
   * execution_status.
   */
  async getTestSuiteTestPlanItemIds(testSuiteId: number, executionStatusFilter?: string[]): Promise<number[]> {
    const items = await this.fetchTestSuiteTestPlanItems(testSuiteId);

    const filtered =
      executionStatusFilter && executionStatusFilter.length > 0
        ? items.filter((item) => executionStatusFilter.includes(item.execution_status))
        : items;

    return filtered.map((item) => item.id);
  }

  /**
   * Resolves the parent iteration id of a test suite — needed because
   * createAndExecuteInBatches always polls status via the enclosing
   * iteration, even when triggering with `context: { type: 'TEST_SUITE' }`.
   */
  async getTestSuiteParentIterationId(testSuiteId: number): Promise<number> {
    const response = await this.makeRequest(`${this.baseURL}/test-suites/${testSuiteId}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch test suite ${testSuiteId}: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data: any = await response.json();
    const iterationId = data.parent?.id;
    if (!iterationId) {
      throw new Error(`Test suite ${testSuiteId} has no parent iteration`);
    }
    return iterationId;
  }

  /**
   * Resolves/associates the automated script for the given test-plan-items
   * (by convention, matching automated_test_reference) at request time,
   * mirroring what the Squash TM UI does right before showing the
   * execute-confirmation dialog. This is what lets create-and-execute work
   * even when the test case's `automated_test` REST field is null — the
   * public REST automated-suite-utils/{id}/executor flow requires that
   * field to be pre-populated and silently no-ops otherwise.
   *
   * Hits: POST /backend/automation-requests/associate-TA-script?testPlanItemsIds[]=...
   */
  async associateTAScript(testPlanItemIds: number[]): Promise<void> {
    const params = new URLSearchParams();
    for (const id of testPlanItemIds) {
      params.append('testPlanItemsIds[]', String(id));
    }

    const response = await this.sessionRequest(
      (webBaseURL) => `${webBaseURL}/backend/automation-requests/associate-TA-script?${params.toString()}`,
      (session) => ({
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Cookie': session.cookieHeader,
          'X-XSRF-TOKEN': session.xsrfToken
        },
        body: '{}'
      })
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to associate TA script: ${response.status} ${response.statusText}\n${errorText}`);
    }
  }

  /**
   * Submit one automated-suite execution workflow to Squash Orchestrator.
   * Requires web session authentication.
   *
   * Hits: POST /backend/automated-suites/create-and-execute
   */
  async createAndExecute(config: CreateAndExecuteConfig): Promise<any> {
    const {
      iterationId,
      testPlanSubsetIds,
      projectId,
      namespaces = ['default'],
      environmentTags = [],
      environmentVariables = {},
      context = { type: 'ITERATION' as const, id: iterationId },
    } = config;

    const wrappedEnvVariables: Record<string, { value: string; verbatim: boolean }> = {};
    for (const [key, value] of Object.entries(environmentVariables)) {
      wrappedEnvVariables[key] = { value, verbatim: true };
    }

    const response = await this.sessionRequest(
      (webBaseURL) => `${webBaseURL}/backend/automated-suites/create-and-execute`,
      (session) => ({
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Cookie': session.cookieHeader,
          'X-XSRF-TOKEN': session.xsrfToken
        },
        body: JSON.stringify({
          context,
          testPlanSubsetIds,
          filterValues: [],
          executionConfigurations: [],
          squashAutomExecutionConfigurations: [
            {
              projectId,
              namespaces,
              environmentTags,
              environmentVariables: wrappedEnvVariables,
            },
          ],
        }),
      })
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create-and-execute: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  /**
   * Statuses meaning "still executing" on a test-plan-item. Anything else
   * (SUCCESS, FAILURE, BLOCKED, NOT_RUN, ...) is treated as finished, since
   * Squash TM's terminal status set isn't fully documented — biasing toward
   * "done" avoids hanging forever on an unrecognized status. If a slot frees
   * up earlier than expected in practice, narrow this set.
   */
  private static readonly IN_PROGRESS_STATUSES = new Set(['READY', 'RUNNING']);

  /**
   * Split testPlanSubsetIds into batches and submit each as its own
   * create-and-execute workflow, keeping at most `concurrency` batches
   * actually RUNNING at once (polling real execution_status, not just
   * submission latency) — so `concurrency` genuinely caps how many agent
   * containers are occupied, leaving the rest idle/free for other work.
   */
  async createAndExecuteInBatches(
    config: CreateAndExecuteConfig,
    batchSize = 10,
    concurrency = 5,
    pollIntervalMs = 15000,
    onProgress?: (info: { submitted: number; total: number; running: number; finished: number }) => void
  ): Promise<BatchResult[]> {
    const { iterationId, testPlanSubsetIds, ...rest } = config;

    // Resolve script association for the whole set once upfront, not per
    // batch — matches the UI's single associate-TA-script call before the
    // execute-confirmation dialog.
    await this.associateTAScript(testPlanSubsetIds);

    const batches: number[][] = [];
    for (let i = 0; i < testPlanSubsetIds.length; i += batchSize) {
      batches.push(testPlanSubsetIds.slice(i, i + batchSize));
    }

    const results: BatchResult[] = new Array(batches.length);
    const pending = batches.map((ids, index) => ({ index, ids }));
    const inFlight = new Map<number, number[]>(); // batchIndex -> item IDs not yet finished
    let submittedCount = 0;
    let finishedCount = 0;

    const reportProgress = () => {
      onProgress?.({ submitted: submittedCount, total: batches.length, running: inFlight.size, finished: finishedCount });
    };

    const submitNext = async (): Promise<void> => {
      const next = pending.shift();
      if (!next) return;
      submittedCount++;
      try {
        const response = await this.createAndExecute({ ...rest, iterationId, testPlanSubsetIds: next.ids });
        results[next.index] = { batchIndex: next.index, testPlanSubsetIds: next.ids, success: true, response };
        inFlight.set(next.index, [...next.ids]);
      } catch (error: any) {
        results[next.index] = { batchIndex: next.index, testPlanSubsetIds: next.ids, success: false, error: error.message };
        finishedCount++;
      }
      reportProgress();
    };

    const initialSlots = Math.min(concurrency, batches.length);
    for (let i = 0; i < initialSlots; i++) {
      await submitNext();
    }

    while (inFlight.size > 0) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

      const statuses = await this.getIterationTestPlanStatuses(iterationId);

      for (const [batchIndex, ids] of Array.from(inFlight.entries())) {
        const stillRunning = ids.filter((id) => AutomationClient.IN_PROGRESS_STATUSES.has(statuses[id]));
        if (stillRunning.length === 0) {
          inFlight.delete(batchIndex);
          finishedCount++;
        } else {
          inFlight.set(batchIndex, stillRunning);
        }
      }
      reportProgress();

      const freedSlots = concurrency - inFlight.size;
      for (let i = 0; i < freedSlots && pending.length > 0; i++) {
        await submitNext();
      }
    }

    while (pending.length > 0) {
      await submitNext();
    }

    return results;
  }
}
