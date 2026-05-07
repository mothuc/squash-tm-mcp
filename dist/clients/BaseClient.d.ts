/**
 * Base client class for Squash TM API
 * Handles authentication and common request functionality
 */
export declare class BaseClient {
    protected baseURL: string;
    protected authHeader: string;
    constructor();
    protected makeRequest(url: string, options?: RequestInit): Promise<Response>;
    protected getWebBaseURL(): string;
}
//# sourceMappingURL=BaseClient.d.ts.map