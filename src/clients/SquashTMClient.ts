import { TestCaseClient } from './TestCaseClient.js';
import { TestStepClient } from './TestStepClient.js';
import { ParameterClient } from './ParameterClient.js';
import { DatasetClient } from './DatasetClient.js';
import { AutomationClient } from './AutomationClient.js';
import { ParserClient } from './ParserClient.js';
import { ProjectClient } from './ProjectClient.js';
import {
  GherkinStep,
  SquashStep,
  TestCase,
  Project,
  ProjectTemplate,
  PagedResponse,
  CreateProjectParams,
  CreateProjectFromTemplateParams,
  CreateTemplateParams,
  CreateTemplateFromProjectParams,
  ProjectClearances,
  CreateKeywordTestCaseParams,
  CreateBDDTestCaseParams,
  UpdateBDDTestCaseParams,
  AddStepParams,
  UpdateStepParams
} from '../types.js';

/**
 * Unified Squash TM Client
 * Combines all specialized clients into a single interface
 * Provides backward compatibility with the original SquashTMClient
 */
export class SquashTMClient {
  // Specialized clients
  private testCaseClient: TestCaseClient;
  private testStepClient: TestStepClient;
  private parameterClient: ParameterClient;
  private datasetClient: DatasetClient;
  private automationClient: AutomationClient;
  private parserClient: ParserClient;
  private projectClient: ProjectClient;

  constructor() {
    this.testCaseClient = new TestCaseClient();
    this.testStepClient = new TestStepClient();
    this.parameterClient = new ParameterClient();
    this.datasetClient = new DatasetClient();
    this.automationClient = new AutomationClient();
    this.parserClient = new ParserClient();
    this.projectClient = new ProjectClient();
  }

  // ===== Test Case Methods =====
  async getTestCase(testCaseId: number): Promise<TestCase> {
    return this.testCaseClient.getTestCase(testCaseId);
  }

  async getAllTestCases(): Promise<TestCase[]> {
    return this.testCaseClient.getAllTestCases();
  }

  async getTestCasesByMilestone(milestoneId: number): Promise<TestCase[]> {
    return this.testCaseClient.getTestCasesByMilestone(milestoneId);
  }

  async createKeywordTestCase(params: CreateKeywordTestCaseParams): Promise<TestCase> {
    return this.testCaseClient.createKeywordTestCase(params);
  }

  async createTestCase(data: any): Promise<TestCase> {
    return this.testCaseClient.createTestCase(data);
  }

  async modifyTestCase(testCaseId: number, data: any): Promise<TestCase> {
    return this.testCaseClient.modifyTestCase(testCaseId, data);
  }

  async deleteTestCase(testCaseId: number): Promise<void> {
    return this.testCaseClient.deleteTestCase(testCaseId);
  }

  // ===== BDD Test Case Methods =====
  async createBDDTestCase(params: CreateBDDTestCaseParams): Promise<TestCase> {
    return this.testCaseClient.createBDDTestCase(params);
  }

  async updateBDDTestCase(testCaseId: number, params: UpdateBDDTestCaseParams): Promise<TestCase> {
    return this.testCaseClient.updateBDDTestCase(testCaseId, params);
  }

  async addStepToBDDTestCase(params: AddStepParams): Promise<TestCase> {
    return this.testCaseClient.addStepToBDDTestCase(params);
  }

  async updateStepInBDDTestCase(params: UpdateStepParams): Promise<TestCase> {
    return this.testCaseClient.updateStepInBDDTestCase(params);
  }

  // ===== Test Step Methods =====
  async getAllSteps(testCaseId: number): Promise<SquashStep[]> {
    return this.testStepClient.getAllSteps(testCaseId);
  }

  async getTestStep(stepId: number): Promise<SquashStep> {
    return this.testStepClient.getTestStep(stepId);
  }

  async createKeywordStep(testCaseId: number, keyword: string, action: string, datatable?: string, comment?: string) {
    return this.testStepClient.createKeywordStep(testCaseId, keyword, action, datatable, comment);
  }

  async createTestStep(testCaseId: number, stepData: any): Promise<any> {
    return this.testStepClient.createTestStep(testCaseId, stepData);
  }

  async updateKeywordStep(stepId: number, keyword: string, action: string, datatable?: string, comment?: string) {
    return this.testStepClient.updateKeywordStep(stepId, keyword, action, datatable, comment);
  }

  async modifyTestStep(stepId: number, stepData: any): Promise<any> {
    return this.testStepClient.modifyTestStep(stepId, stepData);
  }

  async deleteTestSteps(stepIds: number[]): Promise<void> {
    return this.testStepClient.deleteTestSteps(stepIds);
  }

  async deleteTestStep(stepId: number): Promise<void> {
    return this.testStepClient.deleteTestStep(stepId);
  }

  async getIssuesOfTestCase(testCaseId: number): Promise<any[]> {
    return this.testStepClient.getIssuesOfTestCase(testCaseId);
  }

  async linkRequirementsToStep(stepId: number, requirementIds: number[]): Promise<void> {
    return this.testStepClient.linkRequirementsToStep(stepId, requirementIds);
  }

  async unlinkRequirementsFromStep(stepId: number, requirementIds: number[]): Promise<void> {
    return this.testStepClient.unlinkRequirementsFromStep(stepId, requirementIds);
  }

  // ===== Parameter Methods =====
  async getParameter(parameterId: number): Promise<any> {
    return this.parameterClient.getParameter(parameterId);
  }

  async getParametersOfTestCase(testCaseId: number): Promise<any[]> {
    return this.parameterClient.getParametersOfTestCase(testCaseId);
  }

  async createParameter(testCaseId: number, parameterName: string, description?: string): Promise<any> {
    return this.parameterClient.createParameter(testCaseId, parameterName, description);
  }

  async updateParameter(parameterId: number, updates: { name?: string; description?: string }): Promise<any> {
    return this.parameterClient.updateParameter(parameterId, updates);
  }

  async deleteParameter(parameterId: number): Promise<void> {
    return this.parameterClient.deleteParameter(parameterId);
  }

  async deleteParameters(parameterIds: number[]): Promise<void> {
    return this.parameterClient.deleteParameters(parameterIds);
  }

  async findParameterByName(testCaseId: number, parameterName: string): Promise<any | undefined> {
    return this.parameterClient.findParameterByName(testCaseId, parameterName);
  }

  // ===== Dataset Methods =====
  async getDatasetsOfTestCase(testCaseId: number): Promise<any[]> {
    return this.datasetClient.getDatasetsOfTestCase(testCaseId);
  }

  async syncDataset(testCaseId: number, datasetName: string, parameters: any[], paramValues: string[]): Promise<void> {
    return this.datasetClient.syncDataset(testCaseId, datasetName, parameters, paramValues);
  }

  async createDataset(testCaseId: number, datasetData: any): Promise<any> {
    return this.datasetClient.createDataset(testCaseId, datasetData);
  }

  async modifyDataset(datasetId: number, datasetData: any): Promise<any> {
    return this.datasetClient.modifyDataset(datasetId, datasetData);
  }

  async deleteDatasets(datasetIds: number | number[]): Promise<void> {
    return this.datasetClient.deleteDatasets(datasetIds);
  }

  async cleanupUnusedParameters(testCaseId: number): Promise<void> {
    return this.datasetClient.cleanupUnusedParameters(testCaseId);
  }

  // ===== Automation Methods =====
  async transmitTestCase(testCaseId: string): Promise<{ success: boolean; url: string }> {
    return this.automationClient.transmitTestCase(testCaseId);
  }

  async markTestCaseAutomated(testCaseId: string): Promise<{ success: boolean; url: string }> {
    return this.automationClient.markTestCaseAutomated(testCaseId);
  }

  async getAutomationRequests(): Promise<any[]> {
    return this.automationClient.getAutomationRequests();
  }

  async getAutomationRequestStatus(testCaseId: string): Promise<string> {
    return this.automationClient.getAutomationRequestStatus(testCaseId);
  }

  // ===== Parser Methods =====
  parseGherkinSteps(featureContent: string): GherkinStep[] {
    return this.parserClient.parseGherkinSteps(featureContent);
  }

  parseDatasets(featureContent: string): Array<{ tag: string; name: string; params: string[]; values: string[] }> {
    return this.parserClient.parseDatasets(featureContent);
  }

  parseScenarios(featureContent: string): Array<{ name: string; type: 'Scenario' | 'Scenario Outline' }> {
    return this.parserClient.parseScenarios(featureContent);
  }

  parseTags(featureContent: string): string[] {
    return this.parserClient.parseTags(featureContent);
  }

  // ===== Project Methods =====
  async getAllProjects(options?: {
    page?: number;
    size?: number;
    type?: 'STANDARD' | 'TEMPLATE';
    milestoneId?: number;
    milestoneLabel?: string;
    fields?: string;
  }): Promise<PagedResponse> {
    return this.projectClient.getAllProjects(options);
  }

  async getProject(projectId: number, fields?: string): Promise<Project> {
    return this.projectClient.getProject(projectId, fields);
  }

  async getProjectByName(projectName: string, fields?: string): Promise<Project> {
    return this.projectClient.getProjectByName(projectName, fields);
  }

  async createProject(params: CreateProjectParams): Promise<Project> {
    return this.projectClient.createProject(params);
  }

  async createProjectFromTemplate(params: CreateProjectFromTemplateParams): Promise<Project> {
    return this.projectClient.createProjectFromTemplate(params);
  }

  async createProjectTemplate(params: CreateTemplateParams): Promise<ProjectTemplate> {
    return this.projectClient.createProjectTemplate(params);
  }

  async createTemplateFromProject(params: CreateTemplateFromProjectParams): Promise<ProjectTemplate> {
    return this.projectClient.createTemplateFromProject(params);
  }

  async getProjectClearances(projectId: number, fields?: string): Promise<ProjectClearances> {
    return this.projectClient.getProjectClearances(projectId, fields);
  }
}
