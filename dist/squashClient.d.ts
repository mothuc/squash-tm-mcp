import { GherkinStep, SquashStep, TestCase } from './types.js';
export declare class SquashTMClient {
    private baseURL;
    private authHeader;
    constructor();
    private makeRequest;
    getTestCase(testCaseId: number): Promise<TestCase>;
    getAllSteps(testCaseId: number): Promise<SquashStep[]>;
    createKeywordStep(testCaseId: number, keyword: string, action: string, datatable?: string, comment?: string): Promise<unknown>;
    updateKeywordStep(stepId: number, keyword: string, action: string, datatable?: string, comment?: string): Promise<unknown>;
    deleteTestSteps(stepIds: number[]): Promise<void>;
    transmitTestCase(testCaseId: string): Promise<{
        success: boolean;
        url: string;
    }>;
    syncDataset(testCaseId: number, datasetName: string, parameters: any[], paramValues: string[]): Promise<void>;
    parseGherkinSteps(featureContent: string): GherkinStep[];
    parseDatasets(featureContent: string): Array<{
        tag: string;
        name: string;
        params: string[];
        values: string[];
    }>;
}
//# sourceMappingURL=squashClient.d.ts.map