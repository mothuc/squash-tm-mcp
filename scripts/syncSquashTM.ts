import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

interface GherkinStep {
  keyword: string;
  text: string;
  datatable?: string;
  comment?: string;
}

interface SquashStep {
  id: number;
  index: number;
  _type: string;
  keyword?: string;
  action?: string;
  datatable?: string;
  comment?: string;
}

interface Dataset {
  id: number;
  name: string;
  parameters: Array<{ id: number; name: string }>;
  parameter_values: Array<{
    parameter_id: number;
    parameter_name: string;
    parameter_value: string;
  }>;
}

// Helper function for API requests
async function makeRequest(url: string, options: RequestInit = {}) {
  const apiToken = process.env.SQUASH_TM_API_TOKEN;
  const username = process.env.SQUASH_TM_USERNAME;
  const password = process.env.SQUASH_TM_PASSWORD;

  let authHeader: string;

  // Prefer API token if available, otherwise use Basic Auth
  if (apiToken) {
    authHeader = `Bearer ${apiToken}`;
  } else if (username && password) {
    const authBase64 = Buffer.from(`${username}:${password}`).toString('base64');
    authHeader = `Basic ${authBase64}`;
  } else {
    throw new Error('No authentication credentials found. Set SQUASH_TM_API_TOKEN or SQUASH_TM_USERNAME/PASSWORD');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': authHeader,
      ...options.headers
    }
  });

  return response;
}

// Parse Gherkin steps from feature file (handles Scenario Outline + Examples + Comments)
function parseGherkinSteps(featureContent: string): GherkinStep[] {
  const steps: GherkinStep[] = [];
  const lines = featureContent.split('\n');
  let currentStep: GherkinStep | null = null;
  let datatableLines: string[] = [];
  let commentLines: string[] = [];
  let inScenario = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Track scenario boundaries
    if (trimmed.match(/^(Scenario|Scenario Outline):/i)) {
      inScenario = true;
      continue;
    }
    if (trimmed.match(/^(Examples|@):/i) || trimmed.startsWith('@')) {
      inScenario = false;
      continue;
    }
    if (!inScenario) {
      // Skip comments outside scenarios
      continue;
    }

    // Match step keywords
    const stepMatch = trimmed.match(/^(Given|When|Then|And|But)\s+(.+)$/i);
    if (stepMatch) {
      // Save previous step with its datatable and comments
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
    // Match datatable rows
    else if (trimmed.startsWith('|') && inScenario && currentStep) {
      datatableLines.push(trimmed);
    }
    // Match comments (only after steps, not within datatables)
    else if (trimmed.startsWith('#') && inScenario && currentStep && datatableLines.length === 0) {
      // Remove all leading # characters and trim
      const commentText = trimmed.replace(/^#+\s*/, '');
      if (commentText) {
        commentLines.push(commentText);
      }
    }
  }

  // Save last step
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

// Parse datasets from feature file Examples sections
function parseDatasets(featureContent: string): Array<{ tag: string; name: string; params: string[]; values: string[] }> {
  const datasets: Array<{ tag: string; name: string; params: string[]; values: string[] }> = [];
  const lines = featureContent.split('\n');
  let currentTag = '';
  let inExamples = false;
  let headers: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Match tags
    if (trimmed.startsWith('@')) {
      currentTag = trimmed.substring(1);
      continue;
    }

    // Match Examples section
    if (trimmed.match(/^Examples:/i)) {
      inExamples = true;
      headers = []; // Reset headers for new Examples section
      continue;
    }

    // Match Scenario to exit Examples
    if (trimmed.match(/^(Scenario|Scenario Outline):/i)) {
      inExamples = false;
      currentTag = '';
      headers = [];
      continue;
    }

    if (inExamples && trimmed.startsWith('|')) {
      const cells = trimmed.split('|').map(c => c.trim()).filter(c => c);

      if (headers.length === 0) {
        // This is the header row
        headers = cells;
      } else {
        // This is a data row
        // Remove surrounding quotes from values if present
        const cleanedValues = cells.map(value => {
          // Remove leading and trailing quotes (both single and double)
          return value.replace(/^["'](.*)["']$/, '$1');
        });

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

// Fetch all steps (handles pagination)
async function getAllSteps(testCaseId: number): Promise<SquashStep[]> {
  const baseURL = process.env.SQUASH_TM_BASE_URL;
  const url = `${baseURL}/test-cases/${testCaseId}/steps?page=0&size=100`;
  const response = await makeRequest(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch steps: ${response.status} ${response.statusText}\n${errorText}`);
  }

  const data = await response.json();
  return data._embedded?.steps || [];
}

// Get test case details
async function getTestCase(testCaseId: number) {
  const baseURL = process.env.SQUASH_TM_BASE_URL;
  const response = await makeRequest(`${baseURL}/test-cases/${testCaseId}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch test case: ${response.status} ${response.statusText}\n${errorText}`);
  }

  return await response.json();
}

// Create keyword step
async function createKeywordStep(testCaseId: number, keyword: string, action: string, datatable?: string, comment?: string) {
  const baseURL = process.env.SQUASH_TM_BASE_URL;
  const stepData = {
    _type: 'keyword-step',
    keyword,
    action,
    datatable: datatable || '',
    docstring: '',
    comment: comment || ''
  };

  const response = await makeRequest(`${baseURL}/test-cases/${testCaseId}/steps`, {
    method: 'POST',
    body: JSON.stringify(stepData)
  });

  return await response.json();
}

// Update keyword step
async function updateKeywordStep(stepId: number, keyword: string, action: string, datatable?: string, comment?: string) {
  const baseURL = process.env.SQUASH_TM_BASE_URL;
  const patchData = {
    _type: 'keyword-step',
    keyword,
    action,
    datatable: datatable || '',
    comment: comment || ''
  };

  const response = await makeRequest(`${baseURL}/test-steps/${stepId}`, {
    method: 'PATCH',
    body: JSON.stringify(patchData)
  });

  return await response.json();
}

// Delete test steps (bulk)
async function deleteTestSteps(stepIds: number[]) {
  if (stepIds.length === 0) return;

  const baseURL = process.env.SQUASH_TM_BASE_URL;
  const idsParam = stepIds.join(',');
  const response = await makeRequest(`${baseURL}/test-steps/${idsParam}`, {
    method: 'DELETE'
  });

  if (response.status === 204) {
    console.log(`✅ Successfully deleted ${stepIds.length} step(s)`);
  }
}

// Create a parameter for a test case
async function createParameter(testCaseId: number, parameterName: string) {
  const baseURL = process.env.SQUASH_TM_BASE_URL;
  const parameterData = {
    _type: 'parameter',
    name: parameterName,
    description: '',
    test_case: {
      _type: 'test-case',
      id: testCaseId
    }
  };

  const response = await makeRequest(`${baseURL}/parameters`, {
    method: 'POST',
    body: JSON.stringify(parameterData)
  });

  if (response.ok) {
    console.log(`   ✅ Created parameter: ${parameterName}`);
    return await response.json();
  } else {
    const errorText = await response.text();
    console.log(`   ❌ Failed to create parameter "${parameterName}": ${response.status} ${response.statusText}`);
    console.log(`   Error:`, errorText);
    throw new Error(`Failed to create parameter "${parameterName}": ${response.status} ${errorText}`);
  }
}

// Cleanup unused parameters from a test case
async function cleanupUnusedParameters(testCaseId: number) {
  const testCase = await getTestCase(testCaseId);
  const datasets = testCase.datasets || [];
  const parameters = testCase.parameters || [];

  // Collect all parameter IDs used in datasets
  const usedParamIds = new Set<number>();
  for (const dataset of datasets) {
    for (const paramValue of dataset.parameter_values || []) {
      usedParamIds.add(paramValue.parameter_id);
    }
  }

  // Find unused parameters
  const unusedParams = parameters.filter((p: any) => !usedParamIds.has(p.id));

  if (unusedParams.length > 0) {
    console.log(`\n🧹 Cleaning up ${unusedParams.length} unused parameter(s): ${unusedParams.map((p: any) => p.name).join(', ')}`);

    const baseURL = process.env.SQUASH_TM_BASE_URL;
    for (const param of unusedParams) {
      const response = await makeRequest(`${baseURL}/parameters/${param.id}`, {
        method: 'DELETE'
      });

      if (response.ok || response.status === 204) {
        console.log(`   ✅ Deleted parameter: ${param.name}`);
      } else {
        const errorText = await response.text();
        console.log(`   ⚠️  Failed to delete parameter "${param.name}": ${response.status} ${response.statusText}`);
      }
    }
  }
}

// Create or update dataset
// Note: Squash TM API has a limitation of 7 parameter values per PATCH request
async function syncDataset(testCaseId: number, datasetName: string, parameters: any[], paramValues: string[]) {
  const baseURL = process.env.SQUASH_TM_BASE_URL;
  const testCase = await getTestCase(testCaseId);

  // Find existing dataset by name
  const existingDataset = testCase.datasets?.find((ds: any) => ds.name === datasetName);

  // Build parameter values array, filtering out empty values
  // Squash TM API doesn't accept empty string values, so we skip them
  const parameter_values = parameters
    .map((param, index) => ({
      _type: 'parameter-value',
      parameter_test_case_id: testCaseId,
      parameter_id: param.id,
      parameter_name: param.name,
      parameter_value: paramValues[index]
    }))
    .filter(pv => pv.parameter_value !== '');

  if (existingDataset) {
    // Update existing dataset (don't include 'name' field to avoid 412 error)
    // Squash TM API limitation: max 7 parameter values per PATCH request
    const BATCH_SIZE = 7;

    if (parameter_values.length <= BATCH_SIZE) {
      // Simple case: update all at once
      const patchData = {
        _type: 'dataset',
        parameter_values
      };

      const response = await makeRequest(`${baseURL}/datasets/${existingDataset.id}`, {
        method: 'PATCH',
        body: JSON.stringify(patchData)
      });

      if (response.ok) {
        console.log(`   ✅ Updated dataset: ${datasetName}`);
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Failed to update dataset "${datasetName}": ${response.status} ${response.statusText}`);
        console.log(`   Error:`, errorText);
      }
    } else {
      // Batch case: split into chunks of 7
      console.log(`   ℹ️  Dataset has ${parameter_values.length} parameters, batching in chunks of ${BATCH_SIZE}...`);

      for (let i = 0; i < parameter_values.length; i += BATCH_SIZE) {
        const batch = parameter_values.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(parameter_values.length / BATCH_SIZE);

        const patchData = {
          _type: 'dataset',
          parameter_values: batch
        };

        const response = await makeRequest(`${baseURL}/datasets/${existingDataset.id}`, {
          method: 'PATCH',
          body: JSON.stringify(patchData)
        });

        if (response.ok) {
          console.log(`   ✅ Updated dataset "${datasetName}" batch ${batchNum}/${totalBatches} (${batch.length} parameters)`);
        } else {
          const errorText = await response.text();
          console.log(`   ❌ Failed to update dataset "${datasetName}" batch ${batchNum}: ${response.status} ${response.statusText}`);
          console.log(`   Error:`, errorText);
        }
      }
    }
  } else {
    // Create new dataset - API allows all parameters on creation
    const datasetData = {
      _type: 'dataset',
      name: datasetName,
      test_case: {
        _type: 'test-case',
        id: testCaseId
      },
      parameter_values
    };

    const response = await makeRequest(`${baseURL}/datasets`, {
      method: 'POST',
      body: JSON.stringify(datasetData)
    });

    if (response.ok) {
      console.log(`   ✅ Created dataset: ${datasetName}`);
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Failed to create dataset "${datasetName}": ${response.status} ${response.statusText}`);
      console.log(`   Error:`, errorText);
    }
  }
}

// Sync feature file to SquashTM
async function syncFeatureToSquashTM(featureFilePath: string, testCaseId: number) {
  console.log(`\n🔄 Syncing feature file to SquashTM test case ${testCaseId}...\n`);

  // Read and parse feature file
  const featureContent = fs.readFileSync(featureFilePath, 'utf-8');
  const gherkinSteps = parseGherkinSteps(featureContent);
  const datasets = parseDatasets(featureContent);

  console.log(`📄 Parsed ${gherkinSteps.length} steps from feature file`);
  console.log(`📊 Parsed ${datasets.length} datasets from Examples sections\n`);

  // Fetch current steps from SquashTM
  const squashSteps = await getAllSteps(testCaseId);
  console.log(`📥 Fetched ${squashSteps.length} steps from SquashTM\n`);

  // Compare and sync steps
  const stepsToDelete: number[] = [];
  const stepsToUpdate: Array<{ id: number; step: GherkinStep }> = [];
  const stepsToCreate: GherkinStep[] = [];

  // Check which steps need to be deleted (extra steps in SquashTM)
  if (squashSteps.length > gherkinSteps.length) {
    for (let i = gherkinSteps.length; i < squashSteps.length; i++) {
      stepsToDelete.push(squashSteps[i].id);
    }
  }

  // Check which steps need to be updated or created
  for (let i = 0; i < gherkinSteps.length; i++) {
    if (i < squashSteps.length) {
      // Step exists, check if it needs update
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
      // New step needs to be created
      stepsToCreate.push(gherkinSteps[i]);
    }
  }

  console.log(`📋 Sync plan:`);
  console.log(`   - Delete: ${stepsToDelete.length} step(s)`);
  console.log(`   - Update: ${stepsToUpdate.length} step(s)`);
  console.log(`   - Create: ${stepsToCreate.length} step(s)\n`);

  // Execute sync operations

  // 1. Delete extra steps
  if (stepsToDelete.length > 0) {
    console.log(`🗑️  Deleting ${stepsToDelete.length} extra step(s)...`);
    await deleteTestSteps(stepsToDelete);
  }

  // 2. Update changed steps
  if (stepsToUpdate.length > 0) {
    console.log(`\n✏️  Updating ${stepsToUpdate.length} step(s)...`);
    for (const { id, step } of stepsToUpdate) {
      await updateKeywordStep(id, step.keyword, step.text, step.datatable, step.comment);
      console.log(`   ✅ Updated step ${id}: ${step.keyword} ${step.text.substring(0, 50)}...`);
    }
  }

  // 3. Create new steps
  if (stepsToCreate.length > 0) {
    console.log(`\n➕ Creating ${stepsToCreate.length} new step(s)...`);
    for (const step of stepsToCreate) {
      await createKeywordStep(testCaseId, step.keyword, step.text, step.datatable, step.comment);
      console.log(`   ✅ Created step: ${step.keyword} ${step.text.substring(0, 50)}...`);
    }
  }

  // ALWAYS check and delete extra datasets in Squash TM (even if local has no datasets)
  // This ensures Squash TM stays in sync with local feature files
  let testCase = await getTestCase(testCaseId);

  console.log(`\n📋 Existing datasets in Squash TM:`);
  if (testCase.datasets && testCase.datasets.length > 0) {
    testCase.datasets.forEach((ds: any) => {
      console.log(`   - ID: ${ds.id} | Name: "${ds.name}"`);
    });
  } else {
    console.log(`   (No datasets found)`);
  }

  // Delete datasets that don't exist in local feature file
  const localDatasetNames = new Set(datasets.map(ds => ds.name));
  const datasetsToDelete = testCase.datasets?.filter((ds: any) => !localDatasetNames.has(ds.name)) || [];

  if (datasetsToDelete.length > 0) {
    console.log(`\n🗑️  Deleting ${datasetsToDelete.length} dataset(s) not in local file...`);
    const baseURL = process.env.SQUASH_TM_BASE_URL;

    for (const ds of datasetsToDelete) {
      const response = await makeRequest(`${baseURL}/datasets/${ds.id}`, {
        method: 'DELETE'
      });

      if (response.ok || response.status === 204) {
        console.log(`   ✅ Deleted dataset: ${ds.name} (ID: ${ds.id})`);
      } else {
        console.log(`   ⚠️  Failed to delete dataset "${ds.name}": ${response.status} ${response.statusText}`);
      }
    }

    // Refresh test case data after deleting datasets
    testCase = await getTestCase(testCaseId);
  }

  // THEN sync new datasets if local has any
  if (datasets.length > 0) {
    console.log(`\n📊 Syncing ${datasets.length} dataset(s)...`);

    // Auto-create missing parameters
    const allParamNames = new Set<string>();
    datasets.forEach(ds => ds.params.forEach(p => allParamNames.add(p)));

    const missingParams: string[] = [];
    for (const paramName of allParamNames) {
      const param = testCase.parameters?.find((p: any) => p.name === paramName);
      if (!param) {
        missingParams.push(paramName);
      }
    }

    if (missingParams.length > 0) {
      console.log(`\n🔧 Auto-creating ${missingParams.length} missing parameter(s): ${missingParams.join(', ')}`);
      for (const paramName of missingParams) {
        await createParameter(testCaseId, paramName);
      }
      // Refresh test case data after creating parameters
      testCase = await getTestCase(testCaseId);
    }

    for (const dataset of datasets) {
      // Map parameter names to parameter objects (should all exist now)
      const parameters = dataset.params.map(paramName => {
        const param = testCase.parameters.find((p: any) => p.name === paramName);
        if (!param) {
          console.warn(`   ⚠️  Parameter '${paramName}' not found after creation. This should not happen.`);
        }
        return param;
      }).filter(Boolean);

      if (parameters.length === dataset.params.length) {
        await syncDataset(testCaseId, dataset.name, parameters, dataset.values);
      }
    }

    // Cleanup unused parameters
    // Note: Commented out due to timing issue - cleanup happens before datasets are fully populated
    // This can cause false positives where newly created parameters get deleted
    // await cleanupUnusedParameters(testCaseId);
  }

  console.log(`\n✅ Sync complete!\n`);
}

// Main execution
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: npx ts-node syncSquashTM.ts <feature-file-path> <test-case-id>');
  console.error('Example: npx ts-node syncSquashTM.ts features/Admin_features/Order/2641_Create_Pickup_order.feature 2641');
  process.exit(1);
}

const featureFilePath = args[0];
const testCaseId = parseInt(args[1], 10);

if (!fs.existsSync(featureFilePath)) {
  console.error(`Error: Feature file not found: ${featureFilePath}`);
  process.exit(1);
}

syncFeatureToSquashTM(featureFilePath, testCaseId)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
