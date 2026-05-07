export class SquashTMClient {
    baseURL;
    authHeader;
    constructor() {
        const apiToken = process.env.SQUASH_TM_API_TOKEN;
        const username = process.env.SQUASH_TM_USERNAME;
        const password = process.env.SQUASH_TM_PASSWORD;
        this.baseURL = process.env.SQUASH_TM_BASE_URL || '';
        if (apiToken) {
            this.authHeader = `Bearer ${apiToken}`;
        }
        else if (username && password) {
            const authBase64 = Buffer.from(`${username}:${password}`).toString('base64');
            this.authHeader = `Basic ${authBase64}`;
        }
        else {
            throw new Error('No authentication credentials found. Set SQUASH_TM_API_TOKEN or SQUASH_TM_USERNAME/PASSWORD');
        }
    }
    async makeRequest(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': this.authHeader,
                ...options.headers
            }
        });
        return response;
    }
    async getTestCase(testCaseId) {
        const response = await this.makeRequest(`${this.baseURL}/test-cases/${testCaseId}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch test case: ${response.status} ${response.statusText}\n${errorText}`);
        }
        return await response.json();
    }
    async getAllSteps(testCaseId) {
        const url = `${this.baseURL}/test-cases/${testCaseId}/steps?page=0&size=100`;
        const response = await this.makeRequest(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch steps: ${response.status} ${response.statusText}\n${errorText}`);
        }
        const data = await response.json();
        return data._embedded?.steps || [];
    }
    async createKeywordStep(testCaseId, keyword, action, datatable, comment) {
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
    async updateKeywordStep(stepId, keyword, action, datatable, comment) {
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
    async deleteTestSteps(stepIds) {
        if (stepIds.length === 0)
            return;
        const idsParam = stepIds.join(',');
        const response = await this.makeRequest(`${this.baseURL}/test-steps/${idsParam}`, {
            method: 'DELETE'
        });
        if (response.status !== 204) {
            throw new Error(`Failed to delete steps: ${response.status}`);
        }
    }
    async transmitTestCase(testCaseId) {
        const username = process.env.SQUASH_TM_USERNAME;
        const password = process.env.SQUASH_TM_PASSWORD;
        if (!username || !password) {
            throw new Error('SQUASH_TM_USERNAME and SQUASH_TM_PASSWORD are required for transmit operation');
        }
        const webBaseURL = this.baseURL.replace('/api/rest/latest', '');
        // Step 1: Get initial session
        const sessionResponse = await fetch(`${webBaseURL}/login`, {
            method: 'GET',
            redirect: 'follow'
        });
        // Extract cookies from initial session
        let cookieMap = new Map();
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
        // Step 3: Transmit test case
        const transmitURL = `${webBaseURL}/backend/automation-requests/${testCaseId}/status`;
        const finalCookieHeader = Array.from(cookieMap.entries())
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
        const transmitResponse = await fetch(transmitURL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'text/plain',
                'Cookie': finalCookieHeader,
                'X-XSRF-TOKEN': xsrfToken
            },
            body: 'TRANSMITTED'
        });
        if (!transmitResponse.ok) {
            const errorText = await transmitResponse.text();
            throw new Error(`Failed to transmit: ${transmitResponse.status} ${transmitResponse.statusText}\n${errorText}`);
        }
        const viewURL = `${webBaseURL.replace('/squash', '')}/squash/test-case-workspace/test-case/${testCaseId}/content?anchor=automation`;
        return {
            success: true,
            url: viewURL
        };
    }
    async syncDataset(testCaseId, datasetName, parameters, paramValues) {
        const testCase = await this.getTestCase(testCaseId);
        const existingDataset = testCase.datasets?.find((ds) => ds.name === datasetName);
        const parameter_values = parameters.map((param, index) => ({
            parameter_test_case_id: testCaseId,
            parameter_id: param.id,
            parameter_name: param.name,
            parameter_value: paramValues[index]
        }));
        if (existingDataset) {
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
        }
        else {
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
    parseGherkinSteps(featureContent) {
        const steps = [];
        const lines = featureContent.split('\n');
        let currentStep = null;
        let datatableLines = [];
        let commentLines = [];
        let inScenario = false;
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed)
                continue;
            if (trimmed.match(/^(Scenario|Scenario Outline):/i)) {
                inScenario = true;
                continue;
            }
            if (trimmed.match(/^(Examples|@):/i) || trimmed.startsWith('@')) {
                inScenario = false;
                continue;
            }
            if (!inScenario)
                continue;
            const stepMatch = trimmed.match(/^(Given|When|Then|And|But)\s+(.+)$/i);
            if (stepMatch) {
                if (currentStep) {
                    if (datatableLines.length > 0) {
                        currentStep.datatable = datatableLines.join('\n');
                    }
                    if (commentLines.length > 0) {
                        currentStep.comment = commentLines.join('\n');
                    }
                    steps.push(currentStep);
                    datatableLines = [];
                    commentLines = [];
                }
                currentStep = {
                    keyword: stepMatch[1].toUpperCase(),
                    text: stepMatch[2]
                };
            }
            else if (trimmed.startsWith('|') && inScenario && currentStep) {
                datatableLines.push(trimmed);
            }
            else if (trimmed.startsWith('#') && inScenario && currentStep && datatableLines.length === 0) {
                const commentText = trimmed.replace(/^#+\s*/, '');
                if (commentText) {
                    commentLines.push(commentText);
                }
            }
        }
        if (currentStep) {
            if (datatableLines.length > 0) {
                currentStep.datatable = datatableLines.join('\n');
            }
            if (commentLines.length > 0) {
                currentStep.comment = commentLines.join('\n');
            }
            steps.push(currentStep);
        }
        return steps;
    }
    parseDatasets(featureContent) {
        const datasets = [];
        const lines = featureContent.split('\n');
        let currentTag = '';
        let inExamples = false;
        let headers = [];
        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (trimmed.startsWith('@')) {
                currentTag = trimmed.substring(1);
                continue;
            }
            if (trimmed.match(/^Examples:/i)) {
                inExamples = true;
                headers = [];
                continue;
            }
            if (trimmed.match(/^(Scenario|Scenario Outline):/i)) {
                inExamples = false;
                currentTag = '';
                headers = [];
                continue;
            }
            if (inExamples && trimmed.startsWith('|')) {
                const cells = trimmed.split('|').map(c => c.trim()).filter(c => c);
                if (headers.length === 0) {
                    headers = cells;
                }
                else {
                    const cleanedValues = cells.map(value => value.replace(/^["'](.*)["']$/, '$1'));
                    datasets.push({
                        tag: currentTag,
                        name: currentTag,
                        params: headers,
                        values: cleanedValues
                    });
                }
            }
        }
        return datasets;
    }
}
//# sourceMappingURL=squashClient.js.map