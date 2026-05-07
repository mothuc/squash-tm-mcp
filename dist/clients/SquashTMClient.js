import { TestCaseClient } from './TestCaseClient.js';
import { TestStepClient } from './TestStepClient.js';
import { ParameterClient } from './ParameterClient.js';
import { DatasetClient } from './DatasetClient.js';
import { AutomationClient } from './AutomationClient.js';
import { ParserClient } from './ParserClient.js';
import { ProjectClient } from './ProjectClient.js';
/**
 * Unified Squash TM Client
 * Combines all specialized clients into a single interface
 * Provides backward compatibility with the original SquashTMClient
 */
export class SquashTMClient {
    // Specialized clients
    testCaseClient;
    testStepClient;
    parameterClient;
    datasetClient;
    automationClient;
    parserClient;
    projectClient;
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
    async getTestCase(testCaseId) {
        return this.testCaseClient.getTestCase(testCaseId);
    }
    async getAllTestCases() {
        return this.testCaseClient.getAllTestCases();
    }
    async getTestCasesByMilestone(milestoneId) {
        return this.testCaseClient.getTestCasesByMilestone(milestoneId);
    }
    async createKeywordTestCase(params) {
        return this.testCaseClient.createKeywordTestCase(params);
    }
    async createTestCase(data) {
        return this.testCaseClient.createTestCase(data);
    }
    async modifyTestCase(testCaseId, data) {
        return this.testCaseClient.modifyTestCase(testCaseId, data);
    }
    async deleteTestCase(testCaseId) {
        return this.testCaseClient.deleteTestCase(testCaseId);
    }
    // ===== BDD Test Case Methods =====
    async createBDDTestCase(params) {
        return this.testCaseClient.createBDDTestCase(params);
    }
    async updateBDDTestCase(testCaseId, params) {
        return this.testCaseClient.updateBDDTestCase(testCaseId, params);
    }
    async addStepToBDDTestCase(params) {
        return this.testCaseClient.addStepToBDDTestCase(params);
    }
    async updateStepInBDDTestCase(params) {
        return this.testCaseClient.updateStepInBDDTestCase(params);
    }
    // ===== Test Step Methods =====
    async getAllSteps(testCaseId) {
        return this.testStepClient.getAllSteps(testCaseId);
    }
    async getTestStep(stepId) {
        return this.testStepClient.getTestStep(stepId);
    }
    async createKeywordStep(testCaseId, keyword, action, datatable, comment) {
        return this.testStepClient.createKeywordStep(testCaseId, keyword, action, datatable, comment);
    }
    async createTestStep(testCaseId, stepData) {
        return this.testStepClient.createTestStep(testCaseId, stepData);
    }
    async updateKeywordStep(stepId, keyword, action, datatable, comment) {
        return this.testStepClient.updateKeywordStep(stepId, keyword, action, datatable, comment);
    }
    async modifyTestStep(stepId, stepData) {
        return this.testStepClient.modifyTestStep(stepId, stepData);
    }
    async deleteTestSteps(stepIds) {
        return this.testStepClient.deleteTestSteps(stepIds);
    }
    async deleteTestStep(stepId) {
        return this.testStepClient.deleteTestStep(stepId);
    }
    async getIssuesOfTestCase(testCaseId) {
        return this.testStepClient.getIssuesOfTestCase(testCaseId);
    }
    async linkRequirementsToStep(stepId, requirementIds) {
        return this.testStepClient.linkRequirementsToStep(stepId, requirementIds);
    }
    async unlinkRequirementsFromStep(stepId, requirementIds) {
        return this.testStepClient.unlinkRequirementsFromStep(stepId, requirementIds);
    }
    // ===== Parameter Methods =====
    async getParameter(parameterId) {
        return this.parameterClient.getParameter(parameterId);
    }
    async getParametersOfTestCase(testCaseId) {
        return this.parameterClient.getParametersOfTestCase(testCaseId);
    }
    async createParameter(testCaseId, parameterName, description) {
        return this.parameterClient.createParameter(testCaseId, parameterName, description);
    }
    async updateParameter(parameterId, updates) {
        return this.parameterClient.updateParameter(parameterId, updates);
    }
    async deleteParameter(parameterId) {
        return this.parameterClient.deleteParameter(parameterId);
    }
    async deleteParameters(parameterIds) {
        return this.parameterClient.deleteParameters(parameterIds);
    }
    async findParameterByName(testCaseId, parameterName) {
        return this.parameterClient.findParameterByName(testCaseId, parameterName);
    }
    // ===== Dataset Methods =====
    async getDatasetsOfTestCase(testCaseId) {
        return this.datasetClient.getDatasetsOfTestCase(testCaseId);
    }
    async syncDataset(testCaseId, datasetName, parameters, paramValues) {
        return this.datasetClient.syncDataset(testCaseId, datasetName, parameters, paramValues);
    }
    async createDataset(testCaseId, datasetData) {
        return this.datasetClient.createDataset(testCaseId, datasetData);
    }
    async modifyDataset(datasetId, datasetData) {
        return this.datasetClient.modifyDataset(datasetId, datasetData);
    }
    async deleteDatasets(datasetIds) {
        return this.datasetClient.deleteDatasets(datasetIds);
    }
    async cleanupUnusedParameters(testCaseId) {
        return this.datasetClient.cleanupUnusedParameters(testCaseId);
    }
    // ===== Automation Methods =====
    async transmitTestCase(testCaseId) {
        return this.automationClient.transmitTestCase(testCaseId);
    }
    async getAutomationRequests() {
        return this.automationClient.getAutomationRequests();
    }
    async getAutomationRequestStatus(testCaseId) {
        return this.automationClient.getAutomationRequestStatus(testCaseId);
    }
    // ===== Parser Methods =====
    parseGherkinSteps(featureContent) {
        return this.parserClient.parseGherkinSteps(featureContent);
    }
    parseDatasets(featureContent) {
        return this.parserClient.parseDatasets(featureContent);
    }
    parseScenarios(featureContent) {
        return this.parserClient.parseScenarios(featureContent);
    }
    parseTags(featureContent) {
        return this.parserClient.parseTags(featureContent);
    }
    // ===== Project Methods =====
    async getAllProjects(options) {
        return this.projectClient.getAllProjects(options);
    }
    async getProject(projectId, fields) {
        return this.projectClient.getProject(projectId, fields);
    }
    async getProjectByName(projectName, fields) {
        return this.projectClient.getProjectByName(projectName, fields);
    }
    async createProject(params) {
        return this.projectClient.createProject(params);
    }
    async createProjectFromTemplate(params) {
        return this.projectClient.createProjectFromTemplate(params);
    }
    async createProjectTemplate(params) {
        return this.projectClient.createProjectTemplate(params);
    }
    async createTemplateFromProject(params) {
        return this.projectClient.createTemplateFromProject(params);
    }
    async getProjectClearances(projectId, fields) {
        return this.projectClient.getProjectClearances(projectId, fields);
    }
}
//# sourceMappingURL=SquashTMClient.js.map