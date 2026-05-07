import { BaseClient } from './BaseClient.js';
/**
 * Client for Parameter operations
 * Handles: Get parameter, Create parameter, Update parameter, Delete parameter
 */
export declare class ParameterClient extends BaseClient {
    /**
     * Get a parameter by ID
     * @param parameterId - Parameter ID
     * @returns Parameter object
     */
    getParameter(parameterId: number): Promise<any>;
    /**
     * Get all parameters for a test case
     * @param testCaseId - Test case ID
     * @returns Array of parameters
     */
    getParametersOfTestCase(testCaseId: number): Promise<any[]>;
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
    createParameter(testCaseId: number, parameterName: string, description?: string): Promise<any>;
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
    updateParameter(parameterId: number, updates: {
        name?: string;
        description?: string;
    }): Promise<any>;
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
    deleteParameter(parameterId: number): Promise<void>;
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
    deleteParameters(parameterIds: number[]): Promise<void>;
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
    findParameterByName(testCaseId: number, parameterName: string): Promise<any | undefined>;
}
//# sourceMappingURL=ParameterClient.d.ts.map