import { BaseClient } from './BaseClient.js';
import { TestCase, CreateKeywordTestCaseParams, CreateBDDTestCaseParams, UpdateBDDTestCaseParams, AddStepParams, UpdateStepParams } from '../types.js';
/**
 * Client for Test Case operations
 * Handles: Get, Create, Modify, Delete test cases
 */
export declare class TestCaseClient extends BaseClient {
    /**
     * Get test case by ID
     */
    getTestCase(testCaseId: number): Promise<TestCase>;
    /**
     * Get all test cases (placeholder for future implementation)
     */
    getAllTestCases(): Promise<TestCase[]>;
    /**
     * Get test cases by milestone (placeholder for future implementation)
     */
    getTestCasesByMilestone(milestoneId: number): Promise<TestCase[]>;
    /**
     * Create keyword test case (BDD format with individual steps)
     */
    createKeywordTestCase(params: CreateKeywordTestCaseParams): Promise<TestCase>;
    /**
     * Create BDD test case
     */
    createBDDTestCase(params: CreateBDDTestCaseParams): Promise<TestCase>;
    /**
     * Update BDD test case
     */
    updateBDDTestCase(testCaseId: number, params: UpdateBDDTestCaseParams): Promise<TestCase>;
    /**
     * Delete test case
     */
    deleteTestCase(testCaseId: number): Promise<void>;
    /**
     * Add step to BDD test case by appending to Gherkin script
     */
    addStepToBDDTestCase(params: AddStepParams): Promise<TestCase>;
    /**
     * Update step in BDD test case by modifying Gherkin script
     */
    updateStepInBDDTestCase(params: UpdateStepParams): Promise<TestCase>;
    /**
     * Create test case (generic, for backward compatibility)
     */
    createTestCase(data: any): Promise<TestCase>;
    /**
     * Modify test case (generic, for backward compatibility)
     */
    modifyTestCase(testCaseId: number, data: any): Promise<TestCase>;
}
//# sourceMappingURL=TestCaseClient.d.ts.map