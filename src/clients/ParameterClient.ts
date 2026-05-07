import { BaseClient } from './BaseClient.js';

/**
 * Client for Parameter operations
 * Handles: Get parameter, Create parameter, Update parameter, Delete parameter
 */
export class ParameterClient extends BaseClient {
  /**
   * Get a parameter by ID
   * @param parameterId - Parameter ID
   * @returns Parameter object
   */
  async getParameter(parameterId: number): Promise<any> {
    const response = await this.makeRequest(`${this.baseURL}/parameters/${parameterId}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get parameter ${parameterId}: ${response.status} ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Get all parameters for a test case
   * @param testCaseId - Test case ID
   * @returns Array of parameters
   */
  async getParametersOfTestCase(testCaseId: number): Promise<any[]> {
    const response = await this.makeRequest(`${this.baseURL}/test-cases/${testCaseId}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get test case ${testCaseId}: ${response.status} ${errorText}`);
    }

    const testCase: any = await response.json();
    return testCase.parameters || [];
  }

  /**
   * Create a new parameter for a test case
   *
   * @param testCaseId - Test case ID
   * @param parameterName - Name of the parameter
   * @param description - Optional description (HTML format)
   * @returns Created parameter object
   *
   * @example
   * ```typescript
   * const param = await client.createParameter(2709, 'username', '<p>User login name</p>');
   * console.log(param.id); // 123
   * ```
   */
  async createParameter(testCaseId: number, parameterName: string, description: string = ''): Promise<any> {
    const parameterData = {
      _type: 'parameter',
      name: parameterName,
      description,
      test_case: {
        _type: 'test-case',
        id: testCaseId
      }
    };

    const response = await this.makeRequest(`${this.baseURL}/parameters`, {
      method: 'POST',
      body: JSON.stringify(parameterData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create parameter "${parameterName}": ${response.status} ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Update an existing parameter
   *
   * @param parameterId - Parameter ID
   * @param updates - Fields to update (name and/or description)
   * @returns Updated parameter object
   *
   * @example
   * ```typescript
   * const updated = await client.updateParameter(123, {
   *   name: 'new_username',
   *   description: '<p>Updated description</p>'
   * });
   * ```
   */
  async updateParameter(parameterId: number, updates: { name?: string; description?: string }): Promise<any> {
    const patchData = {
      _type: 'parameter',
      ...updates
    };

    const response = await this.makeRequest(`${this.baseURL}/parameters/${parameterId}`, {
      method: 'PATCH',
      body: JSON.stringify(patchData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update parameter ${parameterId}: ${response.status} ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Delete a parameter
   *
   * @param parameterId - Parameter ID
   *
   * @example
   * ```typescript
   * await client.deleteParameter(123);
   * ```
   */
  async deleteParameter(parameterId: number): Promise<void> {
    const response = await this.makeRequest(`${this.baseURL}/parameters/${parameterId}`, {
      method: 'DELETE'
    });

    if (!response.ok && response.status !== 204) {
      const errorText = await response.text();
      throw new Error(`Failed to delete parameter ${parameterId}: ${response.status} ${errorText}`);
    }
  }

  /**
   * Delete multiple parameters
   *
   * @param parameterIds - Array of parameter IDs
   *
   * @example
   * ```typescript
   * await client.deleteParameters([123, 124, 125]);
   * ```
   */
  async deleteParameters(parameterIds: number[]): Promise<void> {
    for (const id of parameterIds) {
      await this.deleteParameter(id);
    }
  }

  /**
   * Find parameters by name in a test case
   *
   * @param testCaseId - Test case ID
   * @param parameterName - Parameter name to search for
   * @returns Parameter object or undefined if not found
   *
   * @example
   * ```typescript
   * const param = await client.findParameterByName(2709, 'username');
   * if (param) {
   *   console.log('Found:', param.id);
   * }
   * ```
   */
  async findParameterByName(testCaseId: number, parameterName: string): Promise<any | undefined> {
    const parameters = await this.getParametersOfTestCase(testCaseId);
    return parameters.find((p: any) => p.name === parameterName);
  }
}
