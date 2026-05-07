/**
 * Base client class for Squash TM API
 * Handles authentication and common request functionality
 */
export class BaseClient {
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
    getWebBaseURL() {
        return this.baseURL.replace('/api/rest/latest', '');
    }
}
//# sourceMappingURL=BaseClient.js.map