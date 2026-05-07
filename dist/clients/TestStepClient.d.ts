import { BaseClient } from './BaseClient.js';
import { SquashStep } from '../types.js';
/**
 * Client for Test Step operations
 * Handles: Get, Create, Modify, Delete test steps
 */
export declare class TestStepClient extends BaseClient {
    /**
     * Get all steps for a test case
     */
    getAllSteps(testCaseId: number): Promise<SquashStep[]>;
    /**
     * Get single test step by ID
     */
    getTestStep(stepId: number): Promise<SquashStep>;
    /**
     * Create a keyword step for a test case
     */
    createKeywordStep(testCaseId: number, keyword: string, action: string, datatable?: string, comment?: string): Promise<unknown>;
    /**
     * Create a test step (generic, placeholder for future implementation)
     */
    createTestStep(testCaseId: number, stepData: any): Promise<any>;
    /**
     * Update a keyword step
     */
    updateKeywordStep(stepId: number, keyword: string, action: string, datatable?: string, comment?: string): Promise<unknown>;
    /**
     * Modify test step (generic, placeholder for future implementation)
     */
    modifyTestStep(stepId: number, stepData: any): Promise<any>;
    /**
     * Delete multiple test steps
     */
    deleteTestSteps(stepIds: number[]): Promise<void>;
    /**
     * Delete single test step
     */
    deleteTestStep(stepId: number): Promise<void>;
    /**
     * Get issues of test case (placeholder for future implementation)
     */
    getIssuesOfTestCase(testCaseId: number): Promise<any[]>;
    /**
     * Link requirements to a test step (placeholder for future implementation)
     */
    linkRequirementsToStep(stepId: number, requirementIds: number[]): Promise<void>;
    /**
     * Unlink requirements from a test step (placeholder for future implementation)
     */
    unlinkRequirementsFromStep(stepId: number, requirementIds: number[]): Promise<void>;
}
//# sourceMappingURL=TestStepClient.d.ts.map