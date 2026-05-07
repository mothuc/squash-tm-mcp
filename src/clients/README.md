# Squash TM Client Library

Modular client library for interacting with Squash TM REST API.

## Architecture

The client library is organized into specialized modules based on Squash TM API categories:

```
src/clients/
├── BaseClient.ts          # Base class with authentication & HTTP methods
├── TestCaseClient.ts      # Test case operations
├── TestStepClient.ts      # Test step operations
├── ParameterClient.ts     # Parameter operations
├── DatasetClient.ts       # Dataset operations
├── AutomationClient.ts    # Automation & transmit operations
├── ParserClient.ts        # Gherkin parsing utilities
├── ProjectClient.ts       # Project operations
├── SquashTMClient.ts      # Unified client (combines all above)
└── index.ts               # Public exports
```

## Usage

### Option 1: Use Unified Client (Recommended)

```typescript
import { SquashTMClient } from './clients/index.js';

const client = new SquashTMClient();

// All methods available in one place
await client.getTestCase(123);
await client.createKeywordStep(123, 'GIVEN', 'user is logged in');
await client.transmitTestCase('123');
```

### Option 2: Use Specialized Clients

```typescript
import { TestCaseClient, TestStepClient } from './clients/index.js';

const testCaseClient = new TestCaseClient();
const testStepClient = new TestStepClient();

await testCaseClient.getTestCase(123);
await testStepClient.createKeywordStep(123, 'GIVEN', 'user is logged in');
```

## Client Modules

### BaseClient
- **Purpose**: Base class for all clients
- **Features**:
  - Authentication (Bearer token or Basic Auth)
  - Common HTTP request handling
  - Environment variable configuration

### TestCaseClient
- **API Group**: Test Cases
- **Implemented**:
  - `getTestCase(testCaseId)` - Get test case by ID
- **Planned**:
  - `getAllTestCases()` - List all test cases
  - `getTestCasesByMilestone(milestoneId)` - Get test cases by milestone
  - `createTestCase(data)` - Create new test case
  - `modifyTestCase(testCaseId, data)` - Update test case
  - `deleteTestCase(testCaseId)` - Delete test case

### TestStepClient
- **API Group**: Test Steps
- **Implemented**:
  - `getAllSteps(testCaseId)` - Get all steps for test case
  - `getTestStep(stepId)` - Get single step
  - `createKeywordStep(...)` - Create Gherkin keyword step
  - `updateKeywordStep(...)` - Update keyword step
  - `deleteTestSteps(stepIds)` - Delete multiple steps
  - `deleteTestStep(stepId)` - Delete single step
- **Planned**:
  - `createTestStep(...)` - Generic step creation
  - `modifyTestStep(...)` - Generic step modification
  - `getIssuesOfTestCase(testCaseId)` - Get linked issues
  - `linkRequirementsToStep(...)` - Link requirements
  - `unlinkRequirementsFromStep(...)` - Unlink requirements

### ParameterClient
- **API Group**: Parameters
- **Implemented**:
  - `getParameter(parameterId)` - Get parameter by ID
  - `getParametersOfTestCase(testCaseId)` - Get all parameters for test case
  - `createParameter(testCaseId, name, description?)` - Create new parameter
  - `updateParameter(parameterId, updates)` - Update parameter
  - `deleteParameter(parameterId)` - Delete parameter
  - `deleteParameters(parameterIds[])` - Delete multiple parameters
  - `findParameterByName(testCaseId, name)` - Find parameter by name

### DatasetClient
- **API Group**: Datasets
- **Implemented**:
  - `getDatasetsOfTestCase(testCaseId)` - Get datasets
  - `syncDataset(...)` - Create or update dataset with auto-parameter creation
  - `deleteDatasets(datasetIds)` - Delete datasets
  - `cleanupUnusedParameters(testCaseId)` - Remove unused parameters
- **Planned**:
  - `createDataset(...)` - Create dataset
  - `modifyDataset(...)` - Update dataset

### AutomationClient
- **API Group**: Test Automation
- **Implemented**:
  - `transmitTestCase(testCaseId)` - Mark test as transmitted
- **Planned**:
  - `getAutomationRequests()` - List automation requests
  - `getAutomationRequestStatus(testCaseId)` - Get transmit status

### ParserClient
- **Purpose**: Parse Gherkin feature files (not API-based)
- **Implemented**:
  - `parseGherkinSteps(content)` - Extract steps from feature file
  - `parseDatasets(content)` - Extract Examples sections
- **Planned**:
  - `parseScenarios(content)` - Extract scenario names
  - `parseTags(content)` - Extract tags

## Adding New Functionality

### 1. Add to Existing Client

If the functionality fits an existing category, add it to the appropriate client:

```typescript
// In TestCaseClient.ts
async getTestCasesByMilestone(milestoneId: number): Promise<TestCase[]> {
  const response = await this.makeRequest(
    `${this.baseURL}/milestones/${milestoneId}/test-cases`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch test cases: ${response.status}`);
  }

  return await response.json() as TestCase[];
}
```

### 2. Expose in Unified Client

Add the method to `SquashTMClient.ts`:

```typescript
async getTestCasesByMilestone(milestoneId: number): Promise<TestCase[]> {
  return this.testCaseClient.getTestCasesByMilestone(milestoneId);
}
```

### 3. Create New Client (if needed)

For entirely new API groups, create a new client:

```typescript
// src/clients/RequirementClient.ts
import { BaseClient } from './BaseClient.js';

export class RequirementClient extends BaseClient {
  async getRequirement(requirementId: number) {
    // Implementation
  }
}
```

Then add to `SquashTMClient.ts` and `index.ts`.

## Environment Variables

All clients use these environment variables (inherited from BaseClient):

```env
SQUASH_TM_BASE_URL=https://your-instance/api/rest/latest
SQUASH_TM_API_TOKEN=your-api-token

# OR use Basic Auth:
SQUASH_TM_USERNAME=username
SQUASH_TM_PASSWORD=password
```

## Backward Compatibility

The unified `SquashTMClient` maintains full backward compatibility with the original monolithic client. Existing code doesn't need changes.

## Testing

Each client can be tested independently:

```typescript
import { TestStepClient } from './clients/TestStepClient.js';

const client = new TestStepClient();
const steps = await client.getAllSteps(123);
console.log(steps);
```
