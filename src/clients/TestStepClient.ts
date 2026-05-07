import { BaseClient } from './BaseClient.js';
import { SquashStep } from '../types.js';

/**
 * Client for Test Step operations
 * Handles: Get, Create, Modify, Delete test steps
 */
export class TestStepClient extends BaseClient {
  /**
   * Get all steps for a test case
   */
  async getAllSteps(testCaseId: number): Promise<SquashStep[]> {
    const url = `${this.baseURL}/test-cases/${testCaseId}/steps?page=0&size=100`;
    const response = await this.makeRequest(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch steps: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json() as any;
    return data._embedded?.steps || [];
  }

  /**
   * Get single test step by ID
   */
  async getTestStep(stepId: number): Promise<SquashStep> {
    const response = await this.makeRequest(`${this.baseURL}/test-steps/${stepId}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch step: ${response.status} ${response.statusText}\n${errorText}`);
    }

    return await response.json() as SquashStep;
  }

  /**
   * Create a keyword step for a test case
   */
  async createKeywordStep(testCaseId: number, keyword: string, action: string, datatable?: string, comment?: string) {
    const stepData = {
      _type: 'keyword-step',
      keyword,
      action,
      datatable: datatable || '',
      docstring: '',
      comment: comment || ''
    };

    const response = await this.makeRequest(`${this.baseURL}/test-cases/${testCaseId}/steps`, {
      method: 'POST',
      body: JSON.stringify(stepData)
    });

    return await response.json();
  }

  /**
   * Create a test step (generic, placeholder for future implementation)
   */
  async createTestStep(testCaseId: number, stepData: any): Promise<any> {
    // TODO: Implement for generic step creation
    throw new Error('Not implemented yet');
  }

  /**
   * Update a keyword step
   */
  async updateKeywordStep(stepId: number, keyword: string, action: string, datatable?: string, comment?: string) {
    const patchData = {
      _type: 'keyword-step',
      keyword,
      action,
      datatable: datatable || '',
      comment: comment || ''
    };

    const response = await this.makeRequest(`${this.baseURL}/test-steps/${stepId}`, {
      method: 'PATCH',
      body: JSON.stringify(patchData)
    });

    return await response.json();
  }

  /**
   * Modify test step (generic, placeholder for future implementation)
   */
  async modifyTestStep(stepId: number, stepData: any): Promise<any> {
    // TODO: Implement for generic step modification
    throw new Error('Not implemented yet');
  }

  /**
   * Delete multiple test steps
   */
  async deleteTestSteps(stepIds: number[]): Promise<void> {
    if (stepIds.length === 0) return;

    const idsParam = stepIds.join(',');
    const response = await this.makeRequest(`${this.baseURL}/test-steps/${idsParam}`, {
      method: 'DELETE'
    });

    if (response.status !== 204) {
      throw new Error(`Failed to delete steps: ${response.status}`);
    }
  }

  /**
   * Delete single test step
   */
  async deleteTestStep(stepId: number): Promise<void> {
    await this.deleteTestSteps([stepId]);
  }

  /**
   * Get issues of test case (placeholder for future implementation)
   */
  async getIssuesOfTestCase(testCaseId: number): Promise<any[]> {
    // TODO: Implement based on API endpoint
    throw new Error('Not implemented yet');
  }

  /**
   * Link requirements to a test step (placeholder for future implementation)
   */
  async linkRequirementsToStep(stepId: number, requirementIds: number[]): Promise<void> {
    // TODO: Implement based on API endpoint
    throw new Error('Not implemented yet');
  }

  /**
   * Unlink requirements from a test step (placeholder for future implementation)
   */
  async unlinkRequirementsFromStep(stepId: number, requirementIds: number[]): Promise<void> {
    // TODO: Implement based on API endpoint
    throw new Error('Not implemented yet');
  }
}
