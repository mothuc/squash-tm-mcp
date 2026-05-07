import { BaseClient } from './BaseClient.js';
/**
 * Client for Dataset operations
 * Handles: Get datasets, Sync datasets, Delete datasets
 */
export declare class DatasetClient extends BaseClient {
    private testCaseClient;
    private parameterClient;
    constructor();
    /**
     * Get datasets of test case
     */
    getDatasetsOfTestCase(testCaseId: number): Promise<any[]>;
    /**
     * Sync dataset - create or update dataset with parameter values
     * Note: Squash TM API has a limitation of 7 parameter values per PATCH request.
     * For datasets with more than 7 parameters, we batch the updates.
     *
     * Auto-creates missing parameters: If parameter names in the feature file don't exist
     * in Squash TM, they will be automatically created before dataset sync.
     *
     * @param paramNamesInOrder - All parameter names from feature file in original order
     * @param paramValues - Array of parameter values (same order as paramNamesInOrder)
     */
    syncDataset(testCaseId: number, datasetName: string, paramNamesInOrder: string[], paramValues: string[]): Promise<void>;
    /**
     * Create dataset (placeholder for future implementation)
     */
    createDataset(testCaseId: number, datasetData: any): Promise<any>;
    /**
     * Modify dataset (placeholder for future implementation)
     */
    modifyDataset(datasetId: number, datasetData: any): Promise<any>;
    /**
     * Delete one or more datasets
     * @param datasetIds - Single dataset ID or array of IDs
     */
    deleteDatasets(datasetIds: number | number[]): Promise<void>;
    /**
     * Delete unused parameters from a test case
     * Removes parameters that are not used in any dataset
     * @param testCaseId - Test case ID
     */
    cleanupUnusedParameters(testCaseId: number): Promise<void>;
}
//# sourceMappingURL=DatasetClient.d.ts.map