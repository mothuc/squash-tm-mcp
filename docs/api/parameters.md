# Squash TM Parameters API Reference

This document describes the Squash TM REST API endpoints for parameter operations.

## Overview

Parameters are variables used in parameterized test cases. They define the columns in dataset tables and are referenced in test steps using placeholder syntax (e.g., `<username>`, `<password>`).

**Key Concepts:**
- Parameters belong to a specific test case
- Parameter names must be unique within a test case
- Parameters are used in datasets to define test data variations
- Parameters are created automatically when syncing Gherkin feature files

## Endpoints

### GET /parameters/{id}

Retrieves a parameter by its ID.

**Path Parameters:**
- `id` (number): The ID of the parameter

**Query Parameters:**
- `fields` (optional): Which fields of the elements should be returned

**Example Request:**
```http
GET /api/rest/latest/parameters/47 HTTP/1.1
Accept: application/json
Host: localhost:8080
```

**Example Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "_type": "parameter",
  "id": 47,
  "name": "sampleParameter",
  "description": "<p>My parameter</p>",
  "test_case": {
    "_type": "test-case",
    "id": 102,
    "name": "sample test case",
    "_links": {
      "self": {
        "href": "http://localhost:8080/api/rest/latest/test-cases/102"
      }
    }
  },
  "_links": {
    "self": {
      "href": "http://localhost:8080/api/rest/latest/parameters/47"
    }
  }
}
```

**Response Fields:**
- `id` (number): The ID of the parameter
- `_type` (string): The type of the entity ("parameter")
- `name` (string): The name of the parameter
- `description` (string): The description of the parameter (HTML format)
- `test_case` (object): The test case this parameter belongs to
- `_links` (object): Related links

**Links:**
- `self`: Link to this parameter

---

### POST /parameters

Creates a new parameter.

**Request Body:**
```typescript
{
  "_type": "parameter",
  "name": string,              // Required: Parameter name
  "description": string,       // Optional: HTML description
  "test_case": {              // Required: Test case reference
    "_type": "test-case",
    "id": number
  }
}
```

**Example Request:**
```http
POST /api/rest/latest/parameters HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "_type": "parameter",
  "name": "username",
  "description": "<p>User login name</p>",
  "test_case": {
    "_type": "test-case",
    "id": 102
  }
}
```

**Example Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "_type": "parameter",
  "id": 47,
  "name": "username",
  "description": "<p>User login name</p>",
  "test_case": {
    "_type": "test-case",
    "id": 102,
    "name": "sample test case",
    "_links": {
      "self": {
        "href": "http://localhost:8080/api/rest/latest/test-cases/102"
      }
    }
  },
  "_links": {
    "self": {
      "href": "http://localhost:8080/api/rest/latest/parameters/47"
    }
  }
}
```

---

### PATCH /parameters/{id}

Modifies an existing parameter. You can modify the name and/or description.

**Path Parameters:**
- `id` (number): The ID of the parameter

**Request Body:**
```typescript
{
  "_type": "parameter",
  "name"?: string,        // Optional: New parameter name
  "description"?: string  // Optional: New description (HTML)
}
```

**Example Request:**
```http
PATCH /api/rest/latest/parameters/47 HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "_type": "parameter",
  "name": "user_login",
  "description": "<p>Updated: User login name</p>"
}
```

**Example Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "_type": "parameter",
  "id": 47,
  "name": "user_login",
  "description": "<p>Updated: User login name</p>",
  "test_case": {
    "_type": "test-case",
    "id": 102,
    "name": "sample test case",
    "_links": {
      "self": {
        "href": "http://localhost:8080/api/rest/latest/test-cases/102"
      }
    }
  },
  "_links": {
    "self": {
      "href": "http://localhost:8080/api/rest/latest/parameters/47"
    }
  }
}
```

---

### DELETE /parameters/{id}

Deletes one parameter with the given ID.

**Path Parameters:**
- `id` (number): The ID of the parameter to delete

**Example Request:**
```http
DELETE /api/rest/latest/parameters/169 HTTP/1.1
Content-Type: application/json
Accept: application/json
Host: localhost:8080
```

**Example Response:**
```http
HTTP/1.1 204 No Content
```

**Important Notes:**
- Deleting a parameter will also remove it from all associated datasets
- Parameters that are actively used in test steps should be handled carefully
- The API does not support bulk deletion via comma-separated IDs (unlike datasets)

---

## Data Structures

### Parameter Object

```typescript
{
  "_type": "parameter",
  "id": number,
  "name": string,
  "description": string,  // HTML format
  "test_case": {
    "_type": "test-case",
    "id": number,
    "name"?: string,
    "_links"?: {
      "self": { "href": string }
    }
  },
  "_links": {
    "self": { "href": string }
  }
}
```

## Usage Examples

### TypeScript Client Usage

```typescript
import { ParameterClient } from './clients/ParameterClient.js';

const client = new ParameterClient();

// Create a parameter
const param = await client.createParameter(
  2709,
  'email',
  '<p>User email address</p>'
);
console.log('Created parameter:', param.id);

// Get all parameters of a test case
const params = await client.getParametersOfTestCase(2709);
console.log('Test case has', params.length, 'parameters');

// Find parameter by name
const found = await client.findParameterByName(2709, 'email');
if (found) {
  console.log('Found parameter ID:', found.id);
}

// Update parameter
const updated = await client.updateParameter(param.id, {
  name: 'user_email',
  description: '<p>Updated description</p>'
});

// Delete parameter
await client.deleteParameter(param.id);
```

### Common Workflows

#### 1. Auto-create Parameters from Feature File

```typescript
// Example: Feature file has parameters: username, password, role
const featureParams = ['username', 'password', 'role'];
const testCaseId = 2709;

// Get existing parameters
const existing = await client.getParametersOfTestCase(testCaseId);
const existingNames = existing.map(p => p.name);

// Create missing parameters
for (const paramName of featureParams) {
  if (!existingNames.includes(paramName)) {
    await client.createParameter(testCaseId, paramName);
    console.log(`Created parameter: ${paramName}`);
  }
}
```

#### 2. Cleanup Unused Parameters

```typescript
// Get all parameters and datasets
const params = await client.getParametersOfTestCase(testCaseId);
const datasets = await datasetClient.getDatasetsOfTestCase(testCaseId);

// Find parameters used in datasets
const usedParamIds = new Set<number>();
for (const dataset of datasets) {
  for (const pv of dataset.parameter_values || []) {
    usedParamIds.add(pv.parameter_id);
  }
}

// Delete unused parameters
for (const param of params) {
  if (!usedParamIds.has(param.id)) {
    await client.deleteParameter(param.id);
    console.log(`Deleted unused parameter: ${param.name}`);
  }
}
```

#### 3. Rename Parameter Across Test Case

```typescript
// Rename parameter from 'login' to 'username'
const param = await client.findParameterByName(testCaseId, 'login');
if (param) {
  await client.updateParameter(param.id, { name: 'username' });
  console.log('Parameter renamed successfully');
}
```

## Usage Notes

### 1. Parameter Naming Conventions

- Use lowercase with underscores: `user_name`, `order_type`
- Match Gherkin placeholder names: If step uses `<username>`, parameter should be `username`
- Avoid special characters except underscore
- Keep names concise and descriptive

### 2. Parameter Creation Best Practices

**Auto-creation Pattern** (Recommended for Gherkin sync):
```typescript
// Check existence before creating
const existing = await client.findParameterByName(testCaseId, paramName);
if (!existing) {
  await client.createParameter(testCaseId, paramName);
}
```

**Batch Creation:**
```typescript
// Create multiple parameters efficiently
const paramsToCreate = ['username', 'password', 'role'];
for (const name of paramsToCreate) {
  await client.createParameter(testCaseId, name);
}
```

### 3. Parameter Lifecycle

```
1. CREATE → Parameter is created via POST /parameters
2. USE → Parameter is referenced in datasets and test steps
3. UPDATE → Parameter name/description can be modified via PATCH
4. DELETE → Parameter is removed (also removes from datasets)
```

### 4. Error Handling

**Common Errors:**

- **500 Internal Server Error**: Missing required `test_case` field in POST body
- **405 Method Not Allowed**: Using wrong endpoint (e.g., POST to `/test-cases/{id}/parameters`)
- **404 Not Found**: Parameter ID doesn't exist
- **409 Conflict**: Parameter name already exists in test case

**Example Error Handling:**
```typescript
try {
  await client.createParameter(testCaseId, 'username');
} catch (error) {
  if (error.message.includes('409')) {
    console.log('Parameter already exists');
  } else {
    throw error;
  }
}
```

### 5. Parameter vs Dataset Relationship

**Important:** Parameters and datasets work together:

```
Test Case (ID: 2709)
├── Parameters
│   ├── username (ID: 123)
│   ├── password (ID: 124)
│   └── role (ID: 125)
└── Datasets
    ├── Dataset1
    │   ├── username = "admin"
    │   ├── password = "pass123"
    │   └── role = "manager"
    └── Dataset2
        ├── username = "user1"
        ├── password = "test456"
        └── role = "staff"
```

**Creation Order:**
1. Create parameters FIRST
2. Create datasets that reference parameter IDs

## API Limitations

1. **No Bulk Operations**: Cannot create/update/delete multiple parameters in one request
2. **No Direct Endpoint for Test Case Parameters**: Must use `GET /test-cases/{id}` and extract `parameters` field
3. **Description Format**: Descriptions must be HTML-formatted strings
4. **No Parameter Value Constraints**: API doesn't validate parameter values used in datasets

## Related Documentation

- [ParameterClient Implementation](../../src/clients/ParameterClient.ts)
- [DatasetClient Implementation](../../src/clients/DatasetClient.ts)
- [Datasets API](./datasets.md)
- [Parameter Types](../../src/types.ts)
- [CLAUDE.md - Parameter Auto-creation](../../CLAUDE.md#sync-algorithm)
