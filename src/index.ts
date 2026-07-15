#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { SquashTMClient } from './clients/index.js';
import { SyncResult } from './types.js';

dotenv.config();

const server = new Server(
  {
    name: 'squash-tm-mcp-agent',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'sync_feature_to_squash',
        description: 'Sync a Gherkin feature file to a Squash TM test case. Handles steps (Given/When/Then), datatables, comments, and Examples sections as datasets.',
        inputSchema: {
          type: 'object',
          properties: {
            featureFilePath: {
              type: 'string',
              description: 'Path to the .feature file to sync',
            },
            testCaseId: {
              type: 'number',
              description: 'Squash TM test case ID',
            },
          },
          required: ['featureFilePath', 'testCaseId'],
        },
      },
      {
        name: 'get_test_case',
        description: 'Get details of a Squash TM test case including name, description, steps, and datasets.',
        inputSchema: {
          type: 'object',
          properties: {
            testCaseId: {
              type: 'number',
              description: 'Squash TM test case ID',
            },
          },
          required: ['testCaseId'],
        },
      },
      {
        name: 'create_test_step',
        description: 'Create a new keyword step (Given/When/Then) in a Squash TM test case.',
        inputSchema: {
          type: 'object',
          properties: {
            testCaseId: {
              type: 'number',
              description: 'Squash TM test case ID',
            },
            keyword: {
              type: 'string',
              description: 'Step keyword (GIVEN, WHEN, THEN, AND, BUT)',
              enum: ['GIVEN', 'WHEN', 'THEN', 'AND', 'BUT'],
            },
            action: {
              type: 'string',
              description: 'Step action/text',
            },
            datatable: {
              type: 'string',
              description: 'Optional datatable in pipe format (|col1|col2|)',
            },
            comment: {
              type: 'string',
              description: 'Optional comment',
            },
          },
          required: ['testCaseId', 'keyword', 'action'],
        },
      },
      {
        name: 'update_test_step',
        description: 'Update an existing keyword step in Squash TM.',
        inputSchema: {
          type: 'object',
          properties: {
            stepId: {
              type: 'number',
              description: 'Squash TM step ID',
            },
            keyword: {
              type: 'string',
              description: 'Step keyword (GIVEN, WHEN, THEN, AND, BUT)',
              enum: ['GIVEN', 'WHEN', 'THEN', 'AND', 'BUT'],
            },
            action: {
              type: 'string',
              description: 'Step action/text',
            },
            datatable: {
              type: 'string',
              description: 'Optional datatable in pipe format',
            },
            comment: {
              type: 'string',
              description: 'Optional comment',
            },
          },
          required: ['stepId', 'keyword', 'action'],
        },
      },
      {
        name: 'delete_test_steps',
        description: 'Delete one or more test steps from Squash TM.',
        inputSchema: {
          type: 'object',
          properties: {
            stepIds: {
              type: 'array',
              items: { type: 'number' },
              description: 'Array of step IDs to delete',
            },
          },
          required: ['stepIds'],
        },
      },
      {
        name: 'transmit_test_case',
        description: 'Mark a test case as transmitted in Squash TM (requires web session)',
        inputSchema: {
          type: 'object',
          properties: {
            testCaseId: {
              type: 'string',
              description: 'Squash TM test case ID',
            },
          },
          required: ['testCaseId'],
        },
      },
      {
        name: 'mark_test_case_automated',
        description: 'Mark a test case automation request as AUTOMATED, so it is ready to be run in an execution (requires web session).',
        inputSchema: {
          type: 'object',
          properties: {
            testCaseId: {
              type: 'string',
              description: 'Squash TM test case ID',
            },
          },
          required: ['testCaseId'],
        },
      },
      {
        name: 'create_keyword_test_case',
        description: 'Create a new keyword-test-case (BDD format with individual keyword steps) in Squash TM. This creates an empty test case shell that can be populated with keyword steps using create_test_step.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Test case name',
            },
            parentType: {
              type: 'string',
              enum: ['project', 'test-case-folder'],
              description: 'Parent type',
            },
            parentId: {
              type: 'number',
              description: 'Parent ID (project or folder)',
            },
            description: {
              type: 'string',
              description: 'HTML description (optional)',
            },
            prerequisite: {
              type: 'string',
              description: 'HTML prerequisite (optional)',
            },
            importance: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'],
              description: 'Importance level (optional, default: VERY_HIGH)',
            },
            status: {
              type: 'string',
              enum: ['WORK_IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'OBSOLETE'],
              description: 'Status (optional, default: WORK_IN_PROGRESS)',
            },
            automatedTestTechnology: {
              type: 'string',
              description: 'Automation technology (optional, default: Playwright)',
            },
          },
          required: ['name', 'parentType', 'parentId'],
        },
      },
      {
        name: 'create_bdd_test_case',
        description: 'Create a new BDD test case with Gherkin script in Squash TM.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Test case name',
            },
            parentType: {
              type: 'string',
              enum: ['project', 'test-case-folder'],
              description: 'Parent type',
            },
            parentId: {
              type: 'number',
              description: 'Parent ID (project or folder)',
            },
            script: {
              type: 'string',
              description: 'Gherkin script content',
            },
            description: {
              type: 'string',
              description: 'HTML description (optional)',
            },
            prerequisite: {
              type: 'string',
              description: 'HTML prerequisite (optional)',
            },
            importance: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'],
              description: 'Importance level (optional)',
            },
            status: {
              type: 'string',
              enum: ['WORK_IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'OBSOLETE'],
              description: 'Status (optional)',
            },
          },
          required: ['name', 'parentType', 'parentId', 'script'],
        },
      },
      {
        name: 'update_bdd_test_case',
        description: 'Update an existing BDD test case (script, name, description, etc.).',
        inputSchema: {
          type: 'object',
          properties: {
            testCaseId: {
              type: 'number',
              description: 'Squash TM test case ID',
            },
            script: {
              type: 'string',
              description: 'Updated Gherkin script (optional)',
            },
            name: {
              type: 'string',
              description: 'Updated name (optional)',
            },
            description: {
              type: 'string',
              description: 'Updated description (optional)',
            },
            prerequisite: {
              type: 'string',
              description: 'Updated prerequisite (optional)',
            },
            importance: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'],
              description: 'Updated importance (optional)',
            },
            status: {
              type: 'string',
              enum: ['WORK_IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'OBSOLETE'],
              description: 'Updated status (optional)',
            },
          },
          required: ['testCaseId'],
        },
      },
      {
        name: 'delete_test_case',
        description: 'Delete a test case from Squash TM by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            testCaseId: {
              type: 'number',
              description: 'Squash TM test case ID to delete',
            },
          },
          required: ['testCaseId'],
        },
      },
      {
        name: 'add_step_to_bdd_test_case',
        description: 'Add a Gherkin step (Given/When/Then/And/But) to an existing BDD test case.',
        inputSchema: {
          type: 'object',
          properties: {
            testCaseId: {
              type: 'number',
              description: 'Squash TM test case ID',
            },
            keyword: {
              type: 'string',
              enum: ['Given', 'When', 'Then', 'And', 'But'],
              description: 'Step keyword',
            },
            text: {
              type: 'string',
              description: 'Step text',
            },
            position: {
              description: 'Position to insert step: "end" or line number (optional, defaults to "end")',
            },
          },
          required: ['testCaseId', 'keyword', 'text'],
        },
      },
      {
        name: 'update_step_in_bdd_test_case',
        description: 'Update a specific step in a BDD test case by step index.',
        inputSchema: {
          type: 'object',
          properties: {
            testCaseId: {
              type: 'number',
              description: 'Squash TM test case ID',
            },
            stepIndex: {
              type: 'number',
              description: 'Step index (0-based) to update',
            },
            keyword: {
              type: 'string',
              enum: ['Given', 'When', 'Then', 'And', 'But'],
              description: 'Updated keyword (optional)',
            },
            text: {
              type: 'string',
              description: 'Updated step text (optional)',
            },
          },
          required: ['testCaseId', 'stepIndex'],
        },
      },
      {
        name: 'get_all_projects',
        description: 'Get all projects (standard and/or templates) that the user is allowed to read. Supports filtering by type, milestone, and pagination.',
        inputSchema: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              description: 'Page number (default: 0)',
            },
            size: {
              type: 'number',
              description: 'Page size (default: 20)',
            },
            type: {
              type: 'string',
              enum: ['STANDARD', 'TEMPLATE'],
              description: 'Filter by project type (optional)',
            },
            milestoneId: {
              type: 'number',
              description: 'Filter by milestone ID (optional)',
            },
            milestoneLabel: {
              type: 'string',
              description: 'Filter by milestone label (optional)',
            },
          },
        },
      },
      {
        name: 'get_project',
        description: 'Get a specific project by ID (requires administrator privileges).',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: 'Squash TM project ID',
            },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'get_project_by_name',
        description: 'Get a project by name (requires administrator privileges). Note: projectName is case-sensitive.',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: {
              type: 'string',
              description: 'Name of the project (case-sensitive)',
            },
          },
          required: ['projectName'],
        },
      },
      {
        name: 'create_project',
        description: 'Create a new standard project in Squash TM.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Project name',
            },
            label: {
              type: 'string',
              description: 'Project label (optional)',
            },
            description: {
              type: 'string',
              description: 'Project description in HTML format (optional)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'create_project_from_template',
        description: 'Create a new project from a project template with customizable copy options.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Project name',
            },
            label: {
              type: 'string',
              description: 'Project label (optional)',
            },
            description: {
              type: 'string',
              description: 'Project description in HTML format (optional)',
            },
            template_id: {
              type: 'number',
              description: 'ID of the project template to use',
            },
            params: {
              type: 'object',
              description: 'Copy options (all optional, default to false)',
              properties: {
                copy_permissions: { type: 'boolean' },
                copy_cuf: { type: 'boolean' },
                copy_bugtracker_binding: { type: 'boolean' },
                copy_ai_server_binding: { type: 'boolean' },
                copy_automated_projects: { type: 'boolean' },
                copy_infolists: { type: 'boolean' },
                copy_milestone: { type: 'boolean' },
                copy_allow_tc_modif_from_exec: { type: 'boolean' },
                copy_optional_exec_statuses: { type: 'boolean' },
                copy_plugins_activation: { type: 'boolean' },
                keep_template_binding: { type: 'boolean' },
                copy_plugins_configuration: { type: 'boolean' },
                keep_plugins_binding: { type: 'boolean' },
              },
            },
          },
          required: ['name', 'template_id'],
        },
      },
      {
        name: 'get_project_clearances',
        description: 'Get clearances (permissions) grouped by profiles for a project.',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: 'Squash TM project ID',
            },
          },
          required: ['projectId'],
        },
      },
    ],
  };
});

// Tool execution handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const client = new SquashTMClient();

    switch (name) {
      case 'sync_feature_to_squash': {
        const { featureFilePath, testCaseId } = args as { featureFilePath: string; testCaseId: number };

        if (!fs.existsSync(featureFilePath)) {
          throw new McpError(ErrorCode.InvalidParams, `Feature file not found: ${featureFilePath}`);
        }

        const result = await syncFeatureToSquashTM(client, featureFilePath, testCaseId);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_test_case': {
        const { testCaseId } = args as { testCaseId: number };
        const testCase = await client.getTestCase(testCaseId);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(testCase, null, 2),
            },
          ],
        };
      }

      case 'create_test_step': {
        const { testCaseId, keyword, action, datatable, comment } = args as {
          testCaseId: number;
          keyword: string;
          action: string;
          datatable?: string;
          comment?: string;
        };

        const step = await client.createKeywordStep(testCaseId, keyword, action, datatable, comment);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(step, null, 2),
            },
          ],
        };
      }

      case 'update_test_step': {
        const { stepId, keyword, action, datatable, comment } = args as {
          stepId: number;
          keyword: string;
          action: string;
          datatable?: string;
          comment?: string;
        };

        const step = await client.updateKeywordStep(stepId, keyword, action, datatable, comment);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(step, null, 2),
            },
          ],
        };
      }

      case 'delete_test_steps': {
        const { stepIds } = args as { stepIds: number[] };
        await client.deleteTestSteps(stepIds);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, deleted: stepIds.length }),
            },
          ],
        };
      }

      case 'transmit_test_case': {
        const { testCaseId } = args as { testCaseId: string };

        const result = await client.transmitTestCase(testCaseId);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'mark_test_case_automated': {
        const { testCaseId } = args as { testCaseId: string };

        const result = await client.markTestCaseAutomated(testCaseId);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_keyword_test_case': {
        const { name, parentType, parentId, description, prerequisite, importance, status, automatedTestTechnology } = args as {
          name: string;
          parentType: 'project' | 'test-case-folder';
          parentId: number;
          description?: string;
          prerequisite?: string;
          importance?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
          status?: 'WORK_IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED' | 'OBSOLETE';
          automatedTestTechnology?: string;
        };

        const result = await client.createKeywordTestCase({
          name,
          parent: { _type: parentType, id: parentId },
          description,
          prerequisite,
          importance,
          status,
          automated_test_technology: automatedTestTechnology,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Keyword test case created successfully!\nID: ${result.id}\nType: ${result._type}\nName: ${result.name}\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'create_bdd_test_case': {
        const { name, parentType, parentId, script, description, prerequisite, importance, status } = args as {
          name: string;
          parentType: 'project' | 'test-case-folder';
          parentId: number;
          script: string;
          description?: string;
          prerequisite?: string;
          importance?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
          status?: 'WORK_IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED' | 'OBSOLETE';
        };

        const result = await client.createBDDTestCase({
          name,
          parent: { _type: parentType, id: parentId },
          script,
          description,
          prerequisite,
          importance,
          status,
        });

        return {
          content: [
            {
              type: 'text',
              text: `BDD test case created successfully!\nID: ${result.id}\nName: ${result.name}\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'update_bdd_test_case': {
        const { testCaseId, script, name, description, prerequisite, importance, status } = args as {
          testCaseId: number;
          script?: string;
          name?: string;
          description?: string;
          prerequisite?: string;
          importance?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
          status?: 'WORK_IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED' | 'OBSOLETE';
        };

        const result = await client.updateBDDTestCase(testCaseId, {
          script,
          name,
          description,
          prerequisite,
          importance,
          status,
        });

        return {
          content: [
            {
              type: 'text',
              text: `BDD test case updated successfully!\nID: ${result.id}\nName: ${result.name}\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'delete_test_case': {
        const { testCaseId } = args as { testCaseId: number };

        await client.deleteTestCase(testCaseId);

        return {
          content: [
            {
              type: 'text',
              text: `Test case ${testCaseId} deleted successfully.`,
            },
          ],
        };
      }

      case 'add_step_to_bdd_test_case': {
        const { testCaseId, keyword, text, position } = args as {
          testCaseId: number;
          keyword: 'Given' | 'When' | 'Then' | 'And' | 'But';
          text: string;
          position?: 'end' | number;
        };

        const result = await client.addStepToBDDTestCase({
          testCaseId,
          keyword,
          text,
          position,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Step added successfully!\n${keyword} ${text}\n\nUpdated script:\n${result.script}`,
            },
          ],
        };
      }

      case 'update_step_in_bdd_test_case': {
        const { testCaseId, stepIndex, keyword, text } = args as {
          testCaseId: number;
          stepIndex: number;
          keyword?: 'Given' | 'When' | 'Then' | 'And' | 'But';
          text?: string;
        };

        const result = await client.updateStepInBDDTestCase({
          testCaseId,
          stepIndex,
          keyword,
          text,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Step ${stepIndex} updated successfully!\n\nUpdated script:\n${result.script}`,
            },
          ],
        };
      }

      case 'get_all_projects': {
        const { page, size, type, milestoneId, milestoneLabel } = args as {
          page?: number;
          size?: number;
          type?: 'STANDARD' | 'TEMPLATE';
          milestoneId?: number;
          milestoneLabel?: string;
        };

        const projects = await client.getAllProjects({ page, size, type, milestoneId, milestoneLabel });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(projects, null, 2),
            },
          ],
        };
      }

      case 'get_project': {
        const { projectId } = args as { projectId: number };
        const project = await client.getProject(projectId);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(project, null, 2),
            },
          ],
        };
      }

      case 'get_project_by_name': {
        const { projectName } = args as { projectName: string };
        const project = await client.getProjectByName(projectName);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(project, null, 2),
            },
          ],
        };
      }

      case 'create_project': {
        const { name, label, description } = args as {
          name: string;
          label?: string;
          description?: string;
        };

        const project = await client.createProject({ name, label, description });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(project, null, 2),
            },
          ],
        };
      }

      case 'create_project_from_template': {
        const { name, label, description, template_id, params } = args as {
          name: string;
          label?: string;
          description?: string;
          template_id: number;
          params?: any;
        };

        const project = await client.createProjectFromTemplate({
          name,
          label,
          description,
          template_id,
          params,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(project, null, 2),
            },
          ],
        };
      }

      case 'get_project_clearances': {
        const { projectId } = args as { projectId: number };
        const clearances = await client.getProjectClearances(projectId);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(clearances, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new McpError(ErrorCode.InternalError, errorMessage);
  }
});

// Sync feature file to Squash TM
async function syncFeatureToSquashTM(
  client: SquashTMClient,
  featureFilePath: string,
  testCaseId: number
): Promise<SyncResult> {
  const featureContent = fs.readFileSync(featureFilePath, 'utf-8');
  const gherkinSteps = client.parseGherkinSteps(featureContent);
  const datasets = client.parseDatasets(featureContent);

  const squashSteps = await client.getAllSteps(testCaseId);

  const stepsToDelete: number[] = [];
  const stepsToUpdate: Array<{ id: number; step: any }> = [];
  const stepsToCreate: any[] = [];

  if (squashSteps.length > gherkinSteps.length) {
    for (let i = gherkinSteps.length; i < squashSteps.length; i++) {
      stepsToDelete.push(squashSteps[i].id);
    }
  }

  for (let i = 0; i < gherkinSteps.length; i++) {
    if (i < squashSteps.length) {
      const squashStep = squashSteps[i];
      const gherkinStep = gherkinSteps[i];

      const keywordChanged = squashStep.keyword !== gherkinStep.keyword;
      const actionChanged = squashStep.action !== gherkinStep.text;
      const datatableChanged = (squashStep.datatable || '') !== (gherkinStep.datatable || '');
      const commentChanged = (squashStep.comment || '') !== (gherkinStep.comment || '');

      if (keywordChanged || actionChanged || datatableChanged || commentChanged) {
        stepsToUpdate.push({ id: squashStep.id, step: gherkinStep });
      }
    } else {
      stepsToCreate.push(gherkinSteps[i]);
    }
  }

  // Execute sync
  if (stepsToDelete.length > 0) {
    await client.deleteTestSteps(stepsToDelete);
  }

  for (const { id, step } of stepsToUpdate) {
    await client.updateKeywordStep(id, step.keyword, step.text, step.datatable, step.comment);
  }

  for (const step of stepsToCreate) {
    await client.createKeywordStep(testCaseId, step.keyword, step.text, step.datatable, step.comment);
  }

  // Sync datasets
  const testCase = await client.getTestCase(testCaseId);
  const localDatasetNames = new Set(datasets.map(ds => ds.name));
  const remoteDatasets = testCase.datasets || [];

  // Delete datasets that exist in Squash TM but not in feature file
  const datasetsToDelete = remoteDatasets
    .filter((ds: any) => !localDatasetNames.has(ds.name))
    .map((ds: any) => ds.id);

  if (datasetsToDelete.length > 0) {
    await client.deleteDatasets(datasetsToDelete);
  }

  // Sync datasets from feature file (create or update)
  // Parameters will be auto-created if they don't exist
  let datasetsSynced = 0;
  for (const dataset of datasets) {
    await client.syncDataset(testCaseId, dataset.name, dataset.params, dataset.values);
    datasetsSynced++;
  }

  // Cleanup unused parameters after dataset sync
  // Note: Disabled due to timing issue - cleanup happens before datasets are fully populated
  // This can cause false positives where newly created parameters get deleted
  // await client.cleanupUnusedParameters(testCaseId);

  return {
    success: true,
    message: `Synced ${gherkinSteps.length} steps to test case ${testCaseId}`,
    details: {
      stepsDeleted: stepsToDelete.length,
      stepsUpdated: stepsToUpdate.length,
      stepsCreated: stepsToCreate.length,
      datasetsSynced,
      datasetsDeleted: datasetsToDelete.length,
    },
  };
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Squash TM MCP Agent running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
