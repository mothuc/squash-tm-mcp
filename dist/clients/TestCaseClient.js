import { BaseClient } from './BaseClient.js';
/**
 * Client for Test Case operations
 * Handles: Get, Create, Modify, Delete test cases
 */
export class TestCaseClient extends BaseClient {
    /**
     * Get test case by ID
     */
    async getTestCase(testCaseId) {
        const response = await this.makeRequest(`${this.baseURL}/test-cases/${testCaseId}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch test case: ${response.status} ${response.statusText}\n${errorText}`);
        }
        return await response.json();
    }
    /**
     * Get all test cases (placeholder for future implementation)
     */
    async getAllTestCases() {
        // TODO: Implement based on API endpoint
        throw new Error('Not implemented yet');
    }
    /**
     * Get test cases by milestone (placeholder for future implementation)
     */
    async getTestCasesByMilestone(milestoneId) {
        // TODO: Implement based on API endpoint
        throw new Error('Not implemented yet');
    }
    /**
     * Create keyword test case (BDD format with individual steps)
     */
    async createKeywordTestCase(params) {
        const payload = {
            _type: 'keyword-test-case',
            name: params.name,
            parent: params.parent,
            importance: params.importance || 'VERY_HIGH',
            status: params.status || 'WORK_IN_PROGRESS',
            ...(params.description && { description: params.description }),
            ...(params.prerequisite && { prerequisite: params.prerequisite }),
            ...(params.automated_test_technology && { automated_test_technology: params.automated_test_technology || 'Playwright' }),
        };
        const response = await this.makeRequest(`${this.baseURL}/test-cases`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create keyword test case: ${response.status} ${response.statusText}\n${errorText}`);
        }
        return await response.json();
    }
    /**
     * Create BDD test case
     */
    async createBDDTestCase(params) {
        const payload = {
            _type: 'scripted-test-case',
            name: params.name,
            parent: params.parent,
            script: params.script,
            ...(params.description && { description: params.description }),
            ...(params.prerequisite && { prerequisite: params.prerequisite }),
            ...(params.importance && { importance: params.importance }),
            ...(params.status && { status: params.status }),
            ...(params.nature && { nature: params.nature }),
            ...(params.type && { type: params.type }),
        };
        const response = await this.makeRequest(`${this.baseURL}/test-cases`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create BDD test case: ${response.status} ${response.statusText}\n${errorText}`);
        }
        return await response.json();
    }
    /**
     * Update BDD test case
     */
    async updateBDDTestCase(testCaseId, params) {
        const payload = {
            _type: 'scripted-test-case',
            ...(params.script !== undefined && { script: params.script }),
            ...(params.name && { name: params.name }),
            ...(params.description !== undefined && { description: params.description }),
            ...(params.prerequisite !== undefined && { prerequisite: params.prerequisite }),
            ...(params.importance && { importance: params.importance }),
            ...(params.status && { status: params.status }),
        };
        const response = await this.makeRequest(`${this.baseURL}/test-cases/${testCaseId}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update BDD test case: ${response.status} ${response.statusText}\n${errorText}`);
        }
        return await response.json();
    }
    /**
     * Delete test case
     */
    async deleteTestCase(testCaseId) {
        const response = await this.makeRequest(`${this.baseURL}/test-cases/${testCaseId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete test case: ${response.status} ${response.statusText}\n${errorText}`);
        }
    }
    /**
     * Add step to BDD test case by appending to Gherkin script
     */
    async addStepToBDDTestCase(params) {
        // Get current test case
        const testCase = await this.getTestCase(params.testCaseId);
        if (!testCase.script) {
            throw new Error('Test case does not have a script field (not a BDD test case)');
        }
        let currentScript = testCase.script;
        const newStep = `    ${params.keyword} ${params.text}`;
        // Parse script to find where to insert
        const lines = currentScript.split('\n');
        if (params.position === 'end' || params.position === undefined) {
            // Find last step line (before Examples or end of file)
            let insertIndex = lines.length;
            for (let i = lines.length - 1; i >= 0; i--) {
                const trimmed = lines[i].trim();
                if (trimmed.startsWith('Examples:') || trimmed.startsWith('@')) {
                    insertIndex = i;
                }
                else if (trimmed.match(/^(Given|When|Then|And|But)\s/)) {
                    insertIndex = i + 1;
                    break;
                }
            }
            lines.splice(insertIndex, 0, newStep);
        }
        else {
            // Insert at specific position
            lines.splice(params.position, 0, newStep);
        }
        const updatedScript = lines.join('\n');
        // Update test case with new script
        return await this.updateBDDTestCase(params.testCaseId, { script: updatedScript });
    }
    /**
     * Update step in BDD test case by modifying Gherkin script
     */
    async updateStepInBDDTestCase(params) {
        // Get current test case
        const testCase = await this.getTestCase(params.testCaseId);
        if (!testCase.script) {
            throw new Error('Test case does not have a script field (not a BDD test case)');
        }
        const lines = testCase.script.split('\n');
        // Find step lines (lines starting with Given/When/Then/And/But)
        const stepLines = [];
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed.match(/^(Given|When|Then|And|But)\s/)) {
                stepLines.push(index);
            }
        });
        if (params.stepIndex < 0 || params.stepIndex >= stepLines.length) {
            throw new Error(`Step index ${params.stepIndex} out of range (0-${stepLines.length - 1})`);
        }
        const lineIndex = stepLines[params.stepIndex];
        const currentLine = lines[lineIndex];
        const indent = currentLine.match(/^\s*/)?.[0] || '    ';
        // Build new step line
        let newLine = currentLine;
        if (params.keyword && params.text) {
            newLine = `${indent}${params.keyword} ${params.text}`;
        }
        else if (params.keyword) {
            const currentText = currentLine.replace(/^\s*(Given|When|Then|And|But)\s+/, '');
            newLine = `${indent}${params.keyword} ${currentText}`;
        }
        else if (params.text) {
            const currentKeyword = currentLine.trim().match(/^(Given|When|Then|And|But)\s/)?.[0] || 'Given ';
            newLine = `${indent}${currentKeyword}${params.text}`;
        }
        lines[lineIndex] = newLine;
        const updatedScript = lines.join('\n');
        // Update test case with new script
        return await this.updateBDDTestCase(params.testCaseId, { script: updatedScript });
    }
    /**
     * Create test case (generic, for backward compatibility)
     */
    async createTestCase(data) {
        const response = await this.makeRequest(`${this.baseURL}/test-cases`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create test case: ${response.status} ${response.statusText}\n${errorText}`);
        }
        return await response.json();
    }
    /**
     * Modify test case (generic, for backward compatibility)
     */
    async modifyTestCase(testCaseId, data) {
        const response = await this.makeRequest(`${this.baseURL}/test-cases/${testCaseId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to modify test case: ${response.status} ${response.statusText}\n${errorText}`);
        }
        return await response.json();
    }
}
//# sourceMappingURL=TestCaseClient.js.map