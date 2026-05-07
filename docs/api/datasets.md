# Squash TM Datasets API Reference

This document describes the Squash TM REST API endpoints for dataset operations.

## Overview

Datasets are collections of parameter values used in parameterized test cases. They allow you to run the same test case with different input data.

## Endpoints

### GET /datasets/{id}

Retrieves a dataset by its ID.

**Path Parameters:**
- `id` (number): The ID of the dataset

**Query Parameters:**
- `fields` (optional): Which fields of the elements should be returned

**Example Request:**
```http
GET /api/rest/latest/datasets/7 HTTP/1.1
Accept: application/json
Host: localhost:8080
```

**Example Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "_type": "dataset",
  "id": 7,
  "name": "sample dataset",
  "parameters": [
    {
      "_type": "parameter",
      "id": 1,
      "name": "param_1"
    },
    {
      "_type": "parameter",
      "id": 2,
      "name": "param_2"
    }
  ],
  "parameter_values": [
    {
      "parameter_test_case_id": 9,
      "parameter_value": "login_1",
      "parameter_name": "param_1",
      "parameter_id": 1
    },
    {
      "parameter_test_case_id": 9,
      "parameter_value": "password_1",
      "parameter_name": "param_2",
      "parameter_id": 2
    }
  ],
  "test_case": {
    "_type": "test-case",
    "id": 9,
    "name": "login test",
    "_links": {
      "self": {
        "href": "http://localhost:8080/api/rest/latest/test-cases/9"
      }
    }
  },
  "_links": {
    "self": {
      "href": "http://localhost:8080/api/rest/latest/datasets/7"
    }
  }
}
```

**Response Fields:**
- `id` (number): The ID of the dataset
- `_type` (string): The type of the entity ("dataset")
- `name` (string): The name of the dataset
- `parameters` (array): The parameters of the dataset
- `parameter_values` (array): The parameter values of the dataset
- `test_case` (object): The test case this dataset belongs to
- `_links` (object): Related links

**Links:**
- `self`: Link to this dataset

---

### POST /datasets

Creates a new dataset.

**Example Request:**
```http
POST /api/rest/latest/datasets HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "_type": "dataset",
  "name": "sample dataset",
  "parameter_values": [
    {
      "parameter_test_case_id": 238,
      "parameter_value": "login_1",
      "parameter_name": "param_1",
      "parameter_id": 1
    },
    {
      "parameter_test_case_id": 238,
      "parameter_value": "password_1",
      "parameter_name": "param_2",
      "parameter_id": 2
    }
  ],
  "test_case": {
    "_type": "test-case",
    "id": 238
  }
}
```

**Example Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "_type": "dataset",
  "id": 23,
  "name": "sample dataset",
  "parameters": [
    {
      "_type": "parameter",
      "id": 1
    },
    {
      "_type": "parameter",
      "id": 2
    }
  ],
  "parameter_values": [
    {
      "parameter_test_case_id": 238,
      "parameter_value": "login_1",
      "parameter_name": "param_1",
      "parameter_id": 1
    },
    {
      "parameter_test_case_id": 238,
      "parameter_value": "password_1",
      "parameter_name": "param_2",
      "parameter_id": 2
    }
  ],
  "test_case": {
    "_type": "test-case",
    "id": 238,
    "_links": {
      "self": {
        "href": "http://localhost:8080/api/rest/latest/test-cases/238"
      }
    }
  },
  "_links": {
    "self": {
      "href": "http://localhost:8080/api/rest/latest/datasets/23"
    },
    "test-case": {
      "href": "http://localhost:8080/api/rest/latest/test-cases/238"
    }
  }
}
```

---

### PATCH /datasets/{id}

Modifies an existing dataset. You can modify the name, parameter values, or both.

**Path Parameters:**
- `id` (number): The ID of the dataset

**Example Request:**
```http
PATCH /api/rest/latest/datasets/2 HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "_type": "dataset",
  "name": "modified data sample",
  "parameter_values": [
    {
      "parameter_value": "new_login_1",
      "parameter_name": "param_1",
      "parameter_id": 1
    }
  ]
}
```

**Example Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "_type": "dataset",
  "id": 23,
  "name": "modified data sample",
  "parameters": [
    {
      "_type": "parameter",
      "id": 1
    }
  ],
  "parameter_values": [
    {
      "parameter_test_case_id": 238,
      "parameter_value": "new_login_1",
      "parameter_name": "param_1",
      "parameter_id": 1
    }
  ],
  "test_case": {
    "_type": "test-case",
    "id": 238,
    "_links": {
      "self": {
        "href": "http://localhost:8080/api/rest/latest/test-cases/238"
      }
    }
  },
  "_links": {
    "self": {
      "href": "http://localhost:8080/api/rest/latest/datasets/23"
    },
    "test-case": {
      "href": "http://localhost:8080/api/rest/latest/test-cases/238"
    }
  }
}
```

---

### DELETE /datasets/{id}

Deletes one or several datasets with the given ID(s).

**Path Parameters:**
- `id` (number or comma-separated list): The ID(s) of the dataset(s) to delete

**Example Request:**
```http
DELETE /api/rest/latest/datasets/44 HTTP/1.1
Content-Type: application/json
Accept: application/json
Host: localhost:8080
```

**Example Response:**
```http
HTTP/1.1 204 No Content
```

## Data Structures

### Dataset Object

```typescript
{
  "_type": "dataset",
  "id": number,
  "name": string,
  "parameters": Parameter[],
  "parameter_values": ParameterValue[],
  "test_case": TestCase,
  "_links": {
    "self": { "href": string },
    "test-case"?: { "href": string }
  }
}
```

### Parameter Object

```typescript
{
  "_type": "parameter",
  "id": number,
  "name"?: string
}
```

### Parameter Value Object

```typescript
{
  "parameter_test_case_id": number,
  "parameter_value": string,
  "parameter_name": string,
  "parameter_id": number
}
```

### Test Case Reference

```typescript
{
  "_type": "test-case",
  "id": number,
  "name"?: string,
  "_links"?: {
    "self": { "href": string }
  }
}
```

## Usage Notes

1. **Parameter IDs**: When creating or modifying datasets, you need to reference existing parameter IDs from the test case
2. **Parameter Values**: Each parameter value must specify both the `parameter_id` and `parameter_name`
3. **Test Case Association**: Datasets must be associated with a test case via the `test_case` object
4. **Bulk Delete**: You can delete multiple datasets by providing comma-separated IDs in the path

## Related Documentation

- [DatasetClient Implementation](../../src/clients/DatasetClient.ts)
- [Dataset Types](../../src/types.ts)
- [CLAUDE.md - Dataset Sync](../../CLAUDE.md#dataset-parsing)
