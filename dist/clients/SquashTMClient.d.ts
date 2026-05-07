import { GherkinStep, SquashStep, TestCase, Project, ProjectTemplate, PagedResponse, CreateProjectParams, CreateProjectFromTemplateParams, CreateTemplateParams, CreateTemplateFromProjectParams, ProjectClearances, CreateKeywordTestCaseParams, CreateBDDTestCaseParams, UpdateBDDTestCaseParams, AddStepParams, UpdateStepParams } from '../types.js';
/**
 * Unified Squash TM Client
 * Combines all specialized clients into a single interface
 * Provides backward compatibility with the original SquashTMClient
 */
export declare class SquashTMClient {
    private testCaseClient;
    private testStepClient;
    private parameterClient;
    private datasetClient;
    private automationClient;
    private parserClient;
    private projectClient;
    constructor();
    getTestCase(testCaseId: number): Promise<TestCase>;
    getAllTestCases(): Promise<TestCase[]>;
    getTestCasesByMilestone(milestoneId: number): Promise<TestCase[]>;
    createKeywordTestCase(params: CreateKeywordTestCaseParams): Promise<TestCase>;
    createTestCase(data: any): Promise<TestCase>;
    modifyTestCase(testCaseId: number, data: any): Promise<TestCase>;
    deleteTestCase(testCaseId: number): Promise<void>;
    createBDDTestCase(params: CreateBDDTestCaseParams): Promise<TestCase>;
    updateBDDTestCase(testCaseId: number, params: UpdateBDDTestCaseParams): Promise<TestCase>;
    addStepToBDDTestCase(params: AddStepParams): Promise<TestCase>;
    updateStepInBDDTestCase(params: UpdateStepParams): Promise<TestCase>;
    getAllSteps(testCaseId: number): Promise<SquashStep[]>;
    getTestStep(stepId: number): Promise<SquashStep>;
    createKeywordStep(testCaseId: number, keyword: string, action: string, datatable?: string, comment?: string): Promise<unknown>;
    createTestStep(testCaseId: number, stepData: any): Promise<any>;
    updateKeywordStep(stepId: number, keyword: string, action: string, datatable?: string, comment?: string): Promise<unknown>;
    modifyTestStep(stepId: number, stepData: any): Promise<any>;
    deleteTestSteps(stepIds: number[]): Promise<void>;
    deleteTestStep(stepId: number): Promise<void>;
    getIssuesOfTestCase(testCaseId: number): Promise<any[]>;
    linkRequirementsToStep(stepId: number, requirementIds: number[]): Promise<void>;
    unlinkRequirementsFromStep(stepId: number, requirementIds: number[]): Promise<void>;
    getParameter(parameterId: number): Promise<any>;
    getParametersOfTestCase(testCaseId: number): Promise<any[]>;
    createParameter(testCaseId: number, parameterName: string, description?: string): Promise<any>;
    updateParameter(parameterId: number, updates: {
        name?: string;
        description?: string;
    }): Promise<any>;
    deleteParameter(parameterId: number): Promise<void>;
    deleteParameters(parameterIds: number[]): Promise<void>;
    findParameterByName(testCaseId: number, parameterName: string): Promise<any | undefined>;
    getDatasetsOfTestCase(testCaseId: number): Promise<any[]>;
    syncDataset(testCaseId: number, datasetName: string, parameters: any[], paramValues: string[]): Promise<void>;
    createDataset(testCaseId: number, datasetData: any): Promise<any>;
    modifyDataset(datasetId: number, datasetData: any): Promise<any>;
    deleteDatasets(datasetIds: number | number[]): Promise<void>;
    cleanupUnusedParameters(testCaseId: number): Promise<void>;
    transmitTestCase(testCaseId: string): Promise<{
        success: boolean;
        url: string;
    }>;
    getAutomationRequests(): Promise<any[]>;
    getAutomationRequestStatus(testCaseId: string): Promise<string>;
    parseGherkinSteps(featureContent: string): GherkinStep[];
    parseDatasets(featureContent: string): Array<{
        tag: string;
        name: string;
        params: string[];
        values: string[];
    }>;
    parseScenarios(featureContent: string): Array<{
        name: string;
        type: 'Scenario' | 'Scenario Outline';
    }>;
    parseTags(featureContent: string): string[];
    getAllProjects(options?: {
        page?: number;
        size?: number;
        type?: 'STANDARD' | 'TEMPLATE';
        milestoneId?: number;
        milestoneLabel?: string;
        fields?: string;
    }): Promise<PagedResponse>;
    getProject(projectId: number, fields?: string): Promise<Project>;
    getProjectByName(projectName: string, fields?: string): Promise<Project>;
    createProject(params: CreateProjectParams): Promise<Project>;
    createProjectFromTemplate(params: CreateProjectFromTemplateParams): Promise<Project>;
    createProjectTemplate(params: CreateTemplateParams): Promise<ProjectTemplate>;
    createTemplateFromProject(params: CreateTemplateFromProjectParams): Promise<ProjectTemplate>;
    getProjectClearances(projectId: number, fields?: string): Promise<ProjectClearances>;
}
//# sourceMappingURL=SquashTMClient.d.ts.map