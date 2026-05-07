import { BaseClient } from './BaseClient.js';
/**
 * Client for Test Automation operations
 * Handles: Transmit test cases, automation requests
 */
export declare class AutomationClient extends BaseClient {
    /**
     * Transmit test case - mark test case as transmitted for automation
     * Requires web session authentication (username/password)
     */
    transmitTestCase(testCaseId: string): Promise<{
        success: boolean;
        url: string;
    }>;
    /**
     * Get automation requests (placeholder for future implementation)
     */
    getAutomationRequests(): Promise<any[]>;
    /**
     * Get automation request status (placeholder for future implementation)
     */
    getAutomationRequestStatus(testCaseId: string): Promise<string>;
}
//# sourceMappingURL=AutomationClient.d.ts.map