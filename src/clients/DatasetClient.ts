import { BaseClient } from './BaseClient.js';
import { TestCaseClient } from './TestCaseClient.js';
import { ParameterClient } from './ParameterClient.js';

/**
 * Client for Dataset operations
 * Handles: Get datasets, Sync datasets, Delete datasets
 */
export class DatasetClient extends BaseClient {
  private testCaseClient: TestCaseClient;
  private parameterClient: ParameterClient;

  constructor() {
    super();
    this.testCaseClient = new TestCaseClient();
    this.parameterClient = new ParameterClient();
  }

  /**
   * Get datasets of test case
   */
  async getDatasetsOfTestCase(testCaseId: number): Promise<any[]> {
    const testCase = await this.testCaseClient.getTestCase(testCaseId);
    return testCase.datasets || [];
  }

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
  async syncDataset(testCaseId: number, datasetName: string, paramNamesInOrder: string[], paramValues: string[]): Promise<void> {
    // Fetch test case to get current parameters and datasets
    let testCase = await this.testCaseClient.getTestCase(testCaseId);

    // Step 1: Auto-create missing parameters
    const missingParams: string[] = [];
    for (const paramName of paramNamesInOrder) {
      const existingParam = testCase.parameters?.find((p: any) => p.name === paramName);
      if (!existingParam) {
        missingParams.push(paramName);
      }
    }

    if (missingParams.length > 0) {
      for (const paramName of missingParams) {
        await this.parameterClient.createParameter(testCaseId, paramName);
      }
      // Refresh test case data after creating parameters
      testCase = await this.testCaseClient.getTestCase(testCaseId);
    }

    // Step 2: Build parameter values array with IDs
    const existingDataset = testCase.datasets?.find((ds: any) => ds.name === datasetName);
    const parameter_values: any[] = [];

    paramNamesInOrder.forEach((paramName, index) => {
      const paramValue = paramValues[index];
      if (paramValue !== '') {
        // Parameter MUST exist now (either pre-existing or just created)
        const param = testCase.parameters?.find((p: any) => p.name === paramName);

        if (!param) {
          throw new Error(`Parameter "${paramName}" not found after creation. This should not happen.`);
        }

        parameter_values.push({
          _type: 'parameter-value',
          parameter_test_case_id: testCaseId,
          parameter_id: param.id,
          parameter_name: paramName,
          parameter_value: paramValue
        });
      }
    });

    if (existingDataset) {
      // Squash TM API limitation: max 7 parameter values per PATCH request
      const BATCH_SIZE = 7;

      if (parameter_values.length <= BATCH_SIZE) {
        // Simple case: update all at once
        const patchData = {
          _type: 'dataset',
          parameter_values
        };

        const response = await this.makeRequest(`${this.baseURL}/datasets/${existingDataset.id}`, {
          method: 'PATCH',
          body: JSON.stringify(patchData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update dataset: ${response.status} ${errorText}`);
        }
      } else {
        // Batch case: split into chunks of 7
        for (let i = 0; i < parameter_values.length; i += BATCH_SIZE) {
          const batch = parameter_values.slice(i, i + BATCH_SIZE);
          const patchData = {
            _type: 'dataset',
            parameter_values: batch
          };

          const response = await this.makeRequest(`${this.baseURL}/datasets/${existingDataset.id}`, {
            method: 'PATCH',
            body: JSON.stringify(patchData)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update dataset batch ${Math.floor(i / BATCH_SIZE) + 1}: ${response.status} ${errorText}`);
          }
        }
      }
    } else {
      // Create new dataset - API allows all parameters on creation
      const datasetData = {
        _type: 'dataset',
        name: datasetName,
        test_case: {
          _type: 'test-case',
          id: testCaseId
        },
        parameter_values
      };

      const response = await this.makeRequest(`${this.baseURL}/datasets`, {
        method: 'POST',
        body: JSON.stringify(datasetData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create dataset: ${response.status} ${errorText}`);
      }
    }
  }

  /**
   * Create dataset (placeholder for future implementation)
   */
  async createDataset(testCaseId: number, datasetData: any): Promise<any> {
    // TODO: Implement generic dataset creation
    throw new Error('Not implemented yet');
  }

  /**
   * Modify dataset (placeholder for future implementation)
   */
  async modifyDataset(datasetId: number, datasetData: any): Promise<any> {
    // TODO: Implement generic dataset modification
    throw new Error('Not implemented yet');
  }

  /**
   * Delete one or more datasets
   * @param datasetIds - Single dataset ID or array of IDs
   */
  async deleteDatasets(datasetIds: number | number[]): Promise<void> {
    const idsParam = Array.isArray(datasetIds) ? datasetIds.join(',') : datasetIds;

    const response = await this.makeRequest(`${this.baseURL}/datasets/${idsParam}`, {
      method: 'DELETE'
    });

    if (!response.ok && response.status !== 204) {
      const errorText = await response.text();
      throw new Error(`Failed to delete dataset(s): ${response.status} ${errorText}`);
    }
  }

  /**
   * Delete unused parameters from a test case
   * Removes parameters that are not used in any dataset
   * @param testCaseId - Test case ID
   */
  async cleanupUnusedParameters(testCaseId: number): Promise<void> {
    const testCase = await this.testCaseClient.getTestCase(testCaseId);
    const datasets = testCase.datasets || [];
    const parameters = testCase.parameters || [];

    // Collect all parameter IDs used in datasets
    const usedParamIds = new Set<number>();
    for (const dataset of datasets) {
      for (const paramValue of dataset.parameter_values || []) {
        usedParamIds.add(paramValue.parameter_id);
      }
    }

    // Find unused parameters
    const unusedParams = parameters.filter((p: any) => !usedParamIds.has(p.id));

    if (unusedParams.length > 0) {
      const unusedIds = unusedParams.map((p: any) => p.id);
      await this.parameterClient.deleteParameters(unusedIds);
    }
  }
}
