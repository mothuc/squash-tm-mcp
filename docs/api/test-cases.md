# Squash TM Test Cases API Reference

This document describes the Squash TM REST API endpoints for test case operations.

## Overview

Squash TM supports 4 types of test cases:

- **Standard** (`test-case`): Traditional test cases with action steps
- **Scripted** (`scripted-test-case`): Gherkin-based test cases
- **Keyword** (`keyword-test-case`): Keyword-driven test cases
- **Exploratory** (`exploratory-test-case`): Exploratory testing sessions

### Version 1.2.0+ Changes

- `kind` property replaced by `_type` property
- `script` property only available for scripted test cases
- `language` property removed (Gherkin is default for scripted)

## Endpoints

### GET /test-cases

Returns all test cases the user is allowed to read.

**Query Parameters:**

- `page` (optional): Page number to retrieve
- `size` (optional): Page size
- `sort` (optional): Attributes to sort on
- `fields` (optional): Which fields to return
- `type` (optional): Filter by type: `all`, `standard`, `scripted`, `keyword`, `exploratory`
- `milestoneId` (optional): Filter by milestone ID
- `milestoneLabel` (optional): Filter by milestone label

**Example Request:**

```http
GET /api/rest/latest/test-cases?page=1&size=4&fields=name,reference,script,charter,session_duration HTTP/1.1
Accept: application/json
```

**Example Response:**

```json
{
  "_embedded": {
    "test-cases": [
      {
        "_type": "test-case",
        "id": 7,
        "name": "sample standard test case",
        "reference": "TC1",
        "_links": {
          "self": {
            "href": "http://localhost:8080/api/rest/latest/test-cases/7"
          }
        }
      },
      {
        "_type": "scripted-test-case",
        "id": 11,
        "name": "sample script test case",
        "reference": "TC2",
        "script": "This is a new Gherkin test",
        "_links": {
          "self": {
            "href": "http://localhost:8080/api/rest/latest/test-cases/11"
          }
        }
      },
      {
        "_type": "keyword-test-case",
        "id": 23,
        "name": "sample keyword test case",
        "reference": "TC3",
        "_links": {
          "self": {
            "href": "http://localhost:8080/api/rest/latest/test-cases/23"
          }
        }
      },
      {
        "_type": "exploratory-test-case",
        "id": 71,
        "name": "sample exploratory test case",
        "reference": "TC4",
        "charter": "This is a new exploratory test",
        "session_duration": 30,
        "_links": {
          "self": {
            "href": "http://localhost:8080/api/rest/latest/test-cases/71"
          }
        }
      }
    ]
  },
  "_links": {
    "first": { "href": "..." },
    "prev": { "href": "..." },
    "self": { "href": "..." },
    "next": { "href": "..." },
    "last": { "href": "..." }
  },
  "page": {
    "size": 4,
    "totalElements": 8,
    "totalPages": 2,
    "number": 1
  }
}
```

---

### GET /test-cases/{id}

Returns a test case by ID.

**Path Parameters:**

- `id` (number): Test case ID

**Query Parameters:**

- `fields` (optional): Which fields to return

**Example Request:**

```http
GET /api/rest/latest/test-cases/238 HTTP/1.1
Accept: application/json
```

**Response Fields:**

- `id` (number): Test case ID
- `_type` (string): Entity type
- `name` (string): Test case name
- `reference` (string): Short identifier
- `project` (object): Parent project
- `path` (string): Full path in library
- `parent` (object): Parent folder or project
- `created_by` (string): Creator username
- `created_on` (string): Creation timestamp (ISO 8601)
- `last_modified_by` (string): Last modifier username
- `last_modified_on` (string): Last modification timestamp (ISO 8601)
- `importance` (string): Importance code (`LOW`, `MEDIUM`, `HIGH`, `VERY_HIGH`)
- `status` (string): Status code (`WORK_IN_PROGRESS`, `UNDER_REVIEW`, `APPROVED`, `OBSOLETE`)
- `nature` (object): Nature with code
- `type` (object): Type with code
- `description` (string): HTML description
- `prerequisite` (string): HTML prerequisites
- `drafted_by_ai` (boolean): AI-drafted flag
- `automated_test` (object): Associated automated test
- `automated_test_technology` (string): Automation technology
- `scm_repository_url` (string): SCM repository URL
- `scm_repository_id` (number): SCM repository ID
- `automated_test_reference` (string): Automation reference path
- `uuid` (string): Test case UUID
- `automatable` (string): Automation eligibility (`Y`, `N`, `M`)
- `automation_priority` (number): Automation priority
- `automation_status` (string): Automation status
- `custom_fields` (array): Custom field values
- `steps` (array): Test steps (see Test Steps documentation)
- `parameters` (array): Parameters
- `datasets` (array): Datasets
- `verified_requirements` (array): Verified requirements
- `milestones` (array): Linked milestones
- `attachments` (array): Attachments
- `script` (string): Gherkin script (scripted test cases only)
- `charter` (string): Charter text (exploratory test cases only)
- `session_duration` (number): Session duration in minutes (exploratory test cases only)

**Links:**

- `self`: Link to this test case
- `project`: Link to its project
- `steps`: Link to test steps
- `parameters`: Link to parameters
- `datasets`: Link to datasets
- `attachments`: Link to attachments
- `issues`: Link to issues

---

### POST /test-cases

Creates a new test case. Default type is `standard`. Use `_type` property to create other types.

#### Create Standard Test Case

**Example Request:**

```json
{
  "_type": "test-case",
  "name": "Christmas turkey test flight",
  "parent": {
    "_type": "project",
    "id": 15
  },
  "importance": "MEDIUM",
  "status": "UNDER_REVIEW",
  "nature": {
    "code": "NAT_FUNCTIONAL_TESTING"
  },
  "type": {
    "code": "TYP_COMPLIANCE_TESTING"
  },
  "prerequisite": "Weather should be cold",
  "description": "Check the ability of the turkey to reach a distant house",
  "custom_fields": [
    {
      "code": "wingspan",
      "value": "About 100cm"
    }
  ],
  "steps": [
    {
      "_type": "action-step",
      "action": "<p>flap its wings</p>",
      "expected_result": "<p>not much, it's lazy</p>"
    }
  ],
  "datasets": [
    {
      "name": "Add some weight lifting"
    }
  ],
  "verified_requirements": [
    {
      "id": 1664
    }
  ]
}
```

**Request Fields:**

- `_type` (string, required): `"test-case"`, `"scripted-test-case"`, `"keyword-test-case"`, or `"exploratory-test-case"`
- `name` (string): Test case name
- `parent` (object): Parent folder or project
  - `_type`: `"test-case-folder"` or `"project"`
  - `id`: Parent ID
- `importance` (string): Importance code
- `status` (string): Status code
- `nature.code` (string): Nature code
- `type.code` (string): Type code
- `prerequisite` (string): HTML prerequisites
- `description` (string): HTML description
- `custom_fields` (array): Custom fields
  - `code`: Custom field code
  - `value`: String or array of strings
- `steps` (array): Test steps
  - `_type`: `"action-step"` or `"call-step"`
  - `action` (string): HTML action (action-step)
  - `expected_result` (string): HTML expected result (action-step)
  - `called_test_case.id` (number): Called test ID (call-step)
  - `called_dataset.id` (number): Dataset ID (call-step, optional)
  - `delegate_parameter_values` (boolean): Delegate parameters (call-step)
- `datasets` (array): Datasets to create
  - `name`: Dataset name
- `verified_requirements` (array): Requirements
  - `id`: Requirement version ID

#### Create Scripted Test Case

**Example Request:**

```json
{
  "_type": "scripted-test-case",
  "name": "Christmas turkey test flight",
  "parent": {
    "_type": "project",
    "id": 15
  },
  "script": "Feature: Turkey flight\n  Scenario: Test flight\n    Given a turkey\n    When it tries to fly\n    Then it should fail"
}
```

#### Create Keyword Test Case

**Example Request:**

```json
{
  "_type": "keyword-test-case",
  "name": "Christmas turkey test flight",
  "parent": {
    "_type": "project",
    "id": 15
  },
  "steps": []
}
```

#### Create Exploratory Test Case

**Example Request:**

```json
{
  "_type": "exploratory-test-case",
  "name": "Christmas Turkey test flight",
  "parent": {
    "_type": "project",
    "id": 15
  },
  "charter": "This is an Exploratory Test Case Charter",
  "session_duration": 30
}
```

#### Create with Automation Attributes

**Example Request:**

```json
{
  "_type": "keyword-test-case",
  "name": "Christmas turkey test flight",
  "parent": {
    "_type": "project",
    "id": 15
  },
  "automated_test_technology": "Robot Framework",
  "scm_repository_id": 6,
  "automated_test_reference": ""
}
```

---

### PATCH /test-cases/{id}

Modifies an existing test case.

**Path Parameters:**

- `id` (number): Test case ID

#### Modify Standard Test Case

**Example Request:**

```json
{
  "_type": "test-case",
  "name": "Christmas turkey test launch"
}
```

#### Modify Scripted Test Case

**Example Request:**

```json
{
  "_type": "scripted-test-case",
  "name": "Christmas turkey test launch",
  "script": "Feature: Updated test\n  Scenario: New scenario"
}
```

#### Modify with Automation Attributes

**Example Request:**

```json
{
  "_type": "scripted-test-case",
  "name": "Christmas turkey test launch",
  "script": "this is Christmas Eve",
  "automated_test_technology": "Cucumber 4",
  "scm_repository_id": 6,
  "automated_test_reference": "",
  "automation_status": "AUTOMATED"
}
```

---

### GET /test-cases/{id}/datasets

Returns all datasets for a test case.

**Path Parameters:**

- `id` (number): Test case ID

**Query Parameters:**

- `page` (optional): Page number
- `size` (optional): Page size
- `fields` (optional): Which fields to return

**Example Request:**

```http
GET /api/rest/latest/test-cases/238/datasets HTTP/1.1
Accept: application/json
```

**Example Response:**

```json
{
  "_embedded": {
    "datasets": [
      {
        "_type": "dataset",
        "id": 1,
        "name": "big_cake",
        "parameters": [
          {
            "_type": "parameter",
            "id": 1,
            "name": "cocoa_purity"
          }
        ],
        "parameter_values": [
          {
            "parameter_test_case_id": 238,
            "parameter_value": "98%",
            "parameter_name": "cocoa_purity",
            "parameter_id": 1
          }
        ],
        "_links": {
          "self": {
            "href": "http://localhost:8080/api/rest/latest/datasets/1"
          }
        }
      }
    ]
  },
  "page": {
    "size": 20,
    "totalElements": 2,
    "totalPages": 1,
    "number": 0
  }
}
```

---

## Data Structures

### Test Case Object (Standard)

```typescript
{
  "_type": "test-case",
  "id": number,
  "name": string,
  "reference": string,
  "project": Project,
  "path": string,
  "parent": Folder | Project,
  "created_by": string,
  "created_on": string, // ISO 8601
  "last_modified_by": string,
  "last_modified_on": string, // ISO 8601
  "importance": "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
  "status": "WORK_IN_PROGRESS" | "UNDER_REVIEW" | "APPROVED" | "OBSOLETE",
  "nature": { "code": string },
  "type": { "code": string },
  "description": string, // HTML
  "prerequisite": string, // HTML
  "drafted_by_ai": boolean,
  "automated_test": AutomatedTest | null,
  "automated_test_technology": string | null,
  "scm_repository_url": string | null,
  "scm_repository_id": number | null,
  "automated_test_reference": string | null,
  "uuid": string,
  "automatable": "Y" | "N" | "M",
  "automation_priority": number,
  "automation_status": string,
  "custom_fields": CustomField[],
  "steps": Step[],
  "parameters": Parameter[],
  "datasets": Dataset[],
  "verified_requirements": Requirement[],
  "milestones": Milestone[],
  "attachments": Attachment[],
  "_links": Links
}
```

### Scripted Test Case Object

Extends standard test case with:

```typescript
{
  "_type": "scripted-test-case",
  "script": string, // Gherkin script
  // ... other standard fields
}
```

### Keyword Test Case Object

```typescript
{
  "_type": "keyword-test-case",
  // Same fields as standard test case
  // Steps are keyword steps instead of action steps
}
```

### Exploratory Test Case Object

Extends standard test case with:

```typescript
{
  "_type": "exploratory-test-case",
  "charter": string,
  "session_duration": number, // minutes
  // ... other standard fields
}
```

## Usage Notes

1. **Test Case Types**: Use `_type` to specify test case type when creating or modifying
2. **Parent Required**: All test cases must have a parent (project or folder)
3. **Custom Fields**: Custom field codes must be associated with the project
4. **Steps**: Standard and keyword test cases can have steps; scripted test cases use the `script` field
5. **Automation**: Set `automated_test_technology`, `scm_repository_id`, and `automated_test_reference` for automated tests
6. **Milestones**: Filter by `milestoneId` or `milestoneLabel` (mutually exclusive)
7. **Pagination**: Use `page` and `size` parameters for large result sets
8. **Parameters and Datasets**:
   - **Parameters** define variable placeholders (e.g., `username`, `password`)
   - **Datasets** contain actual values for those parameters
   - **Important**: Parameters must be created BEFORE datasets can reference them
   - When creating a test case, you can only create empty datasets (name only)
   - To add parameter values to datasets, use the [Parameters API](./parameters.md) and [Datasets API](./datasets.md)

## Common Status Values

- `WORK_IN_PROGRESS`: Test case is being developed
- `UNDER_REVIEW`: Test case is being reviewed
- `APPROVED`: Test case is approved for use
- `OBSOLETE`: Test case is no longer valid

## Common Importance Values

- `LOW`: Low importance
- `MEDIUM`: Medium importance
- `HIGH`: High importance
- `VERY_HIGH`: Critical importance

## Related Documentation

- [TestCaseClient Implementation](../../src/clients/TestCaseClient.ts)
- [Test Steps API](./test-steps.md)
- [Parameters API](./parameters.md) - Create and manage test parameters
- [Datasets API](./datasets.md) - Create and manage test datasets
- [Type Definitions](../../src/types.ts)
- [CLAUDE.md - Sync Algorithm](../../CLAUDE.md#sync-algorithm)

## [Test Cases](#_test_cases)

This chapter focuses on services for the test cases. There are 4 types of test case: standard, scripted, keyword and exploratory.

Updates from version 1.2.0:

- The "kind" property is no longer available in test case. The test case type is, instead, specified/defined by the "\_type" property.
- The "script" property is now available only for scripted test cases.
- There is no longer a "language" property in test cases. The language for scripted test case is always GHERKIN while there is no defined language for standard and keyword test cases.

### [![get](images/get.png) Get all test cases](#_get_all_test_cases)

A `GET` to `/test-cases` returns all the test cases that the user is allowed to read.

You can filter by test case type using the `type` query parameter. Accepted values: `all`, `standard`, `scripted`, `keyword`, `exploratory`. Only one value can be provided at a time.

You can also filter by milestone with `milestoneId` or `milestoneLabel`. These parameters are mutually exclusive: only one may be provided at a time.

#### [HTTP request](#_get_all_test_cases_http_request)

    GET /api/rest/latest/test-cases?page=1&size=4&fields=name,reference,script,charter,session_duration HTTP/1.1
    Accept: application/json
    Host: localhost:8080

#### [Query parameters](#_get_all_test_cases_query_parameters)

Parameter

Description

`page`

number of the page to retrieve (optional)

`size`

size of the page to retrieve (optional)

`sort`

which attributes of the returned entities should be sorted on (optional)

`fields`

which fields of the elements should be returned (optional)

`type`

which type of the element should be returned (optional)

`milestoneId`

filter by milestone ID (optional)

`milestoneLabel`

filter by milestone label (optional)

#### [Example response](#_get_all_test_cases_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 1966

    {
      "_embedded" : {
        "test-cases" : [ {
          "_type" : "test-case",
          "id" : 7,
          "name" : "sample standard test case",
          "reference" : "TC1",
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/test-cases/7"
            }
          }
        }, {
          "_type" : "scripted-test-case",
          "id" : 11,
          "name" : "sample script test case",
          "reference" : "TC2",
          "script" : "This is a new Gherkin test",
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/test-cases/11"
            }
          }
        }, {
          "_type" : "keyword-test-case",
          "id" : 23,
          "name" : "sample keyword test case",
          "reference" : "TC3",
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/test-cases/23"
            }
          }
        }, {
          "_type" : "exploratory-test-case",
          "id" : 71,
          "name" : "sample exploratory test case",
          "reference" : "TC4",
          "charter" : "This is a new exploratory test",
          "session_duration" : 30,
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/test-cases/71"
            }
          }
        } ]
      },
      "_links" : {
        "first" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases?fields=name,reference,script,charter,session_duration&page=0&size=4"
        },
        "prev" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases?fields=name,reference,script,charter,session_duration&page=0&size=4"
        },
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases?fields=name,reference,script,charter,session_duration&page=1&size=4"
        },
        "last" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases?fields=name,reference,script,charter,session_duration&page=1&size=4"
        }
      },
      "page" : {
        "size" : 4,
        "totalElements" : 8,
        "totalPages" : 2,
        "number" : 1
      }
    }

#### [Response fields](#_get_all_test_cases_response_fields)

Path

Type

Description

`_embedded.test-cases`

`Array`

the list of elements for that page

`page.size`

`Number`

the page size for that query

`page.totalElements`

`Number`

total number of elements the user is allowed to read

`page.totalPages`

`Number`

how many pages can be browsed

`page.number`

`Number`

the page number

`_links`

`Object`

related links

#### [Links](#_get_all_test_cases_links)

Relation

Description

`first`

link to the first page (optional)

`prev`

link to the previous page (optional)

`self`

link to this page

`next`

link to the next page (optional)

`last`

link to the last page (optional)

### [![get](images/get.png) Get test case](#_get_test_case)

A `GET` to `/test-cases/{id}` returns the test case with the given id.

#### [Path parameters](#_get_test_case_path_parameters)

Table 6. /api/rest/latest/test-cases/{id}

Parameter

Description

`id`

the id of the test case

#### [HTTP request](#_get_test_case_http_request)

    GET /api/rest/latest/test-cases/238 HTTP/1.1
    Accept: application/json
    Host: localhost:8080

#### [Query parameters](#_get_test_case_query_parameters)

Parameter

Description

`fields`

which fields of the elements should be returned (optional)

#### [Example response](#_get_test_case_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 6375

    {
      "_type" : "test-case",
      "id" : 238,
      "name" : "walking test",
      "reference" : "TC1",
      "project" : {
        "_type" : "project",
        "id" : 14,
        "name" : "sample project",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/14"
          }
        }
      },
      "path" : "/sample project/sample folder/walking test",
      "parent" : {
        "_type" : "test-case-folder",
        "id" : 237,
        "name" : "sample folder",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-case-folders/237"
          }
        }
      },
      "created_by" : "User-1",
      "created_on" : "2017-06-15T10:00:00.000+00:00",
      "last_modified_by" : "User-1",
      "last_modified_on" : "2017-06-15T10:00:00.000+00:00",
      "importance" : "LOW",
      "status" : "WORK_IN_PROGRESS",
      "nature" : {
        "code" : "NAT_USER_TESTING"
      },
      "type" : {
        "code" : "TYP_EVOLUTION_TESTING"
      },
      "prerequisite" : "<p>You must have legs with feet attached to them (one per leg)</p>\n",
      "description" : "<p>check that you can walk through the API (literally)</p>\n",
      "drafted_by_ai" : false,
      "automated_test" : {
        "_type" : "automated-test",
        "id" : 2,
        "name" : "script_custom_field_params_all.ta",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/automated-tests/2"
          }
        }
      },
      "automated_test_technology" : "Cucumber",
      "scm_repository_url" : "https://github.com/test/repo01 (master)",
      "scm_repository_id" : 2,
      "automated_test_reference" : "repo01/src/resources/script_custom_field_params_all.ta#Test_case_238",
      "uuid" : "2f7194ca-eb2e-4378-a82d-ddc207c866bd",
      "automatable" : "Y",
      "automation_status" : "WORK_IN_PROGRESS",
      "automation_priority" : 42,
      "custom_fields" : [ {
        "code" : "CF_TXT",
        "label" : "test level",
        "value" : "mandatory"
      }, {
        "code" : "CF_TAGS",
        "label" : "see also",
        "value" : [ "walking", "bipedal" ]
      } ],
      "steps" : [ {
        "_type" : "action-step",
        "id" : 165,
        "action" : "<p>move ${first_foot} forward</p>\n",
        "expected_result" : "<p>I just advanced by one step</p>\n",
        "index" : 0,
        "custom_fields" : [ {
          "code" : "CF_TXT",
          "label" : "test level",
          "value" : "mandatory"
        }, {
          "code" : "CF_TAGS",
          "label" : "see also",
          "value" : [ "basic", "walking" ]
        } ],
        "verified_requirements" : [ ],
        "attachments" : [ ],
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-steps/165"
          }
        }
      }, {
        "_type" : "action-step",
        "id" : 166,
        "action" : "<p>move ${second_foot}&nbsp;forward</p>\n",
        "expected_result" : "<p>and another step !</p>\n",
        "index" : 1,
        "custom_fields" : [ {
          "code" : "CF_TXT",
          "label" : "test level",
          "value" : "mandatory"
        }, {
          "code" : "CF_TAGS",
          "label" : "see also",
          "value" : [ "basic", "walking" ]
        } ],
        "verified_requirements" : [ ],
        "attachments" : [ ],
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-steps/166"
          }
        }
      }, {
        "_type" : "call-step",
        "id" : 167,
        "delegate_parameter_values" : false,
        "called_test_case" : {
          "_type" : "test-case",
          "id" : 239,
          "name" : "victory dance",
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/test-cases/239"
            }
          }
        },
        "called_dataset" : null,
        "index" : 2,
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-steps/167"
          }
        }
      }, {
        "_type" : "call-step",
        "id" : 168,
        "delegate_parameter_values" : false,
        "called_test_case" : {
          "_type" : "unauthorized-resource",
          "resource_type" : "test-case",
          "resource_id" : 240,
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/test-cases/240"
            }
          }
        },
        "called_dataset" : null,
        "index" : 3,
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-steps/168"
          }
        }
      } ],
      "parameters" : [ {
        "_type" : "parameter",
        "id" : 1,
        "name" : "first_foot",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/parameters/1"
          }
        }
      }, {
        "_type" : "parameter",
        "id" : 2,
        "name" : "second_foot",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/parameters/2"
          }
        }
      } ],
      "datasets" : [ {
        "_type" : "dataset",
        "id" : 1,
        "name" : "right handed people",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/datasets/1"
          }
        }
      }, {
        "_type" : "dataset",
        "id" : 2,
        "name" : "left handed people",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/datasets/2"
          }
        }
      } ],
      "verified_requirements" : [ {
        "_type" : "requirement-version",
        "id" : 255,
        "name" : "Must have legs",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/requirement-versions/255"
          }
        }
      }, {
        "_type" : "unauthorized-resource",
        "resource_type" : "requirement-version",
        "resource_id" : 256,
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/requirement-versions/256"
          }
        }
      } ],
      "milestones" : [ {
        "id" : 1,
        "label" : "milestone 1"
      } ],
      "script_auto" : "/ta-tests/script_custom_field_params_all.ta",
      "attachments" : [ ],
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/238"
        },
        "project" : {
          "href" : "http://localhost:8080/api/rest/latest/projects/14"
        },
        "steps" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/238/steps"
        },
        "parameters" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/238/parameters"
        },
        "datasets" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/238/datasets"
        },
        "attachments" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/238/attachments"
        },
        "issues" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/238/issues"
        }
      }
    }

#### [Response fields](#_get_test_case_response_fields)

Path

Type

Description

`id`

`Number`

the id of the entity

`_type`

`String`

the type of the entity

`name`

`String`

name of the test case

`project`

`Object`

project of the test case

`parent`

`Object`

the location of the test case (either a folder or the project if located at the root of the library)

`path`

`String`

the path of the test case

`created_by`

`String`

user that created the test case

`created_on`

`String`

timestamp of the creation (ISO 8601)

`last_modified_by`

`String`

user that modified the test case the most recently

`last_modified_on`

`String`

timestamp of last modification (ISO 8601)

`reference`

`String`

a shorter identifier for that test case

`importance`

`String`

code of the importance

`status`

`String`

code of the status

`nature.code`

`String`

code of the nature

`type.code`

`String`

code of the type of test case

`description`

`String`

description of the test case (html)

`prerequisite`

`String`

prerequisites that should be met before the execution of the test script (html)

`drafted_by_ai`

`Boolean`

indicates whether the test case has been drafted by ai

`automated_test`

`Object`

automated test of the test case (optional)

`script_auto`

`String`

automation script of the test case

`automated_test_technology`

`String`

automated test technology of the test case

`scm_repository_url`

`String`

scm repository url of the test case

`scm_repository_id`

`Number`

scm repository id of the test case

`automated_test_reference`

`String`

automated test reference of the test case

`uuid`

`String`

uuid of the test case

`automatable`

`String`

the eligibility for automation of the test case, one of "Y" (Yes), "N" (No) or "M" (Maybe).

`automation_priority`

`Number`

the automation priority of the test case

`automation_status`

`String`

the automation status of the test case

`custom_fields`

`Array`

array of custom fields

`custom_fields[].code`

`String`

code of the custom field

`custom_fields[].label`

`String`

label of the custom field

`custom_fields[].value`

`Varies`

the value of the custom field. The value is either a string (for most custom fields), or an array of strings (for multivalued custom fields eg a tag list)

`steps`

`Array`

the step list that constitute the script. Please refer to the test steps documentation.

`parameters`

`Array`

the list of parameters. Please refer to the parameters documentation.

`datasets`

`Array`

the list of datasets. Please refer to the datasets documentation.

`verified_requirements`

`Array`

the list of verified requirements. Please refer to the requirements documentation.

`milestones`

`Array`

the list of milestones linked to this test case

`attachments`

`Array`

the list of attachments.

`_links`

`Object`

related links

#### [Links](#_get_test_case_links)

Relation

Description

`self`

link to this test case

`project`

link to its project

`steps`

link to the test script

`parameters`

link to the parameters

`datasets`

link to the datasets

`attachments`

link to the attachments

`issues`

link to the issues

### [![get](images/get.png) Get test cases by milestone](#_get_test_cases_by_milestone)

A `GET` request to `/test-cases?milestoneId={id}` returns all the test cases that the user is allowed to read and that are associated with the specified milestone.

You can use either `milestoneId` or `milestoneLabel` to filter by milestone. These parameters are mutually exclusive: only one may be provided at a time.

You can also filter by test case type using the `type` query parameter. Accepted values: `all`, `standard`, `scripted`, `keyword`, `exploratory`. Only one value can be provided at a time.

Caution: Both the parameter name and its value are case-sensitive.

#### [HTTP request](#_get_test_cases_by_milestone_http_request)

    GET /api/rest/latest/test-cases?page=1&milestoneId=1 HTTP/1.1
    Accept: application/json
    Host: localhost:8080

#### [Query parameters](#_get_test_cases_by_milestone_query_parameters)

Parameter

Description

`page`

number of the page to retrieve (optional)

`size`

size of the page to retrieve (optional)

`sort`

which attributes of the returned entities should be sorted on (optional)

`fields`

which fields of the elements should be returned (optional)

`type`

which type of the element should be returned (optional)

`milestoneId`

filter by milestone ID (optional)

`milestoneLabel`

filter by milestone label (optional)

The response format is the same as **Get all test cases**.

### [![post](images/post.png) Create test case](#_create_test_case)

A `POST` to `/test-cases` creates a new test case. By default, the created test case will be of "standard" type. To create a "scripted", "keyword" or "exploratory" test case, include the "\_type" property in your payload with one of the following values: "scripted-test-case", "keyword-test-case", or "exploratory-test-case".

#### [Create a standard test case](#_create_a_standard_test_case)

##### [HTTP request](#_create_a_standard_test_case_http_request)

    POST /api/rest/latest/test-cases HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Content-Length: 1422
    Host: localhost:8080

    {
      "_type" : "test-case",
      "name" : "Christmas turkey test flight",
      "parent" : {
        "_type" : "project",
        "id" : 15
      },
      "importance" : "MEDIUM",
      "status" : "UNDER_REVIEW",
      "nature" : {
        "code" : "NAT_FUNCTIONAL_TESTING"
      },
      "type" : {
        "code" : "TYP_COMPLIANCE_TESTING"
      },
      "prerequisite" : "Weather should be cold",
      "description" : "Check the ability of the turkey to reach a distant house",
      "custom_fields" : [ {
        "code" : "wingspan",
        "value" : "About 100cm"
      }, {
        "code" : "limiting factor",
        "value" : [ "weight", "neck length", "aerodynamics" ]
      } ],
      "steps" : [ {
        "_type" : "call-step",
        "delegate_parameter_values" : false,
        "called_test_case" : {
          "id" : 276
        }
      }, {
        "_type" : "call-step",
        "delegate_parameter_values" : false,
        "called_test_case" : {
          "id" : 276
        },
        "called_dataset" : {
          "id" : 33
        }
      }, {
        "_type" : "action-step",
        "action" : "<p>flap its wings</p>",
        "expected_result" : "<p>not much, it's lazy</p>",
        "custom_fields" : [ {
          "code" : "wingspan",
          "value" : "About 100cm"
        }, {
          "code" : "limiting factor",
          "value" : [ "weight", "neck length", "aerodynamics" ]
        } ]
      } ],
      "datasets" : [ {
        "name" : "Add some weight lifting"
      }, {
        "name" : "Add some cardio"
      } ],
      "verified_requirements" : [ {
        "id" : 1664
      }, {
        "id" : 4635
      } ]
    }

##### [Example response](#_create_a_standard_test_case_http_response)

    HTTP/1.1 201 Created
    Content-Type: application/json
    Content-Length: 4916

    {
      "_type" : "test-case",
      "id" : 240,
      "name" : "Christmas turkey test flight",
      "reference" : "",
      "project" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "path" : "/Christmas Eve/Christmas turkey test flight",
      "parent" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "created_by" : "admin",
      "created_on" : "2017-06-15T10:00:00.000+00:00",
      "last_modified_by" : "admin",
      "last_modified_on" : "2017-06-15T10:00:00.000+00:00",
      "importance" : "MEDIUM",
      "status" : "UNDER_REVIEW",
      "nature" : {
        "code" : "NAT_FUNCTIONAL_TESTING"
      },
      "type" : {
        "code" : "TYP_COMPLIANCE_TESTING"
      },
      "prerequisite" : "Weather should be cold",
      "description" : "Check the ability of the turkey to reach a distant house",
      "drafted_by_ai" : false,
      "automated_test" : null,
      "automated_test_technology" : null,
      "scm_repository_url" : null,
      "scm_repository_id" : null,
      "automated_test_reference" : null,
      "uuid" : "2b689378-bacf-4c0c-95d4-2d1f8b9a934e",
      "custom_fields" : [ {
        "code" : "wingspan",
        "label" : "Turkey Feature Cuf1",
        "value" : "About 100cm"
      }, {
        "code" : "limiting factor",
        "label" : "Turkey training cuf",
        "value" : [ "weight", "neck length", "aerodynamics" ]
      } ],
      "steps" : [ {
        "_type" : "call-step",
        "id" : 15,
        "delegate_parameter_values" : false,
        "called_test_case" : {
          "_type" : "test-case",
          "id" : 276,
          "name" : "Test the turkey",
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/test-cases/276"
            }
          }
        },
        "called_dataset" : null,
        "index" : 0,
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-steps/15"
          }
        }
      }, {
        "_type" : "call-step",
        "id" : 16,
        "delegate_parameter_values" : false,
        "called_test_case" : {
          "_type" : "test-case",
          "id" : 276,
          "name" : "Test the turkey",
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/test-cases/276"
            }
          }
        },
        "called_dataset" : {
          "_type" : "dataset",
          "id" : 33,
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/datasets/33"
            }
          }
        },
        "index" : 1,
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-steps/16"
          }
        }
      }, {
        "_type" : "action-step",
        "id" : 210,
        "action" : "<p>ask a turkey to fly</p>",
        "expected_result" : "<p>watch the turkey eat seeds</p>",
        "index" : 2,
        "custom_fields" : [ {
          "code" : "wingspan",
          "label" : "Turkey Feature Cuf1",
          "value" : "About 100cm"
        }, {
          "code" : "limiting factor",
          "label" : "Turkey training cuf",
          "value" : [ "weight", "neck length", "aerodynamics" ]
        } ],
        "verified_requirements" : [ ],
        "attachments" : [ ],
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-steps/210"
          }
        }
      } ],
      "parameters" : [ ],
      "datasets" : [ {
        "_type" : "dataset",
        "id" : 47,
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/datasets/47"
          }
        }
      }, {
        "_type" : "dataset",
        "id" : 102,
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/datasets/102"
          }
        }
      } ],
      "verified_requirements" : [ {
        "_type" : "requirement-version",
        "id" : 1664,
        "name" : "First requirement: fly",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/requirement-versions/1664"
          }
        }
      }, {
        "_type" : "requirement-version",
        "id" : 4635,
        "name" : "Second requirement: fly further",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/requirement-versions/4635"
          }
        }
      } ],
      "milestones" : [ ],
      "script_auto" : "",
      "attachments" : [ ],
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240"
        },
        "project" : {
          "href" : "http://localhost:8080/api/rest/latest/projects/15"
        },
        "steps" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/steps"
        },
        "parameters" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/parameters"
        },
        "datasets" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/datasets"
        },
        "attachments" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/attachments"
        }
      }
    }

##### [Request fields](#_create_a_standard_test_case_request_fields)

Path

Type

Description

`_type`

`String`

type of the entity (mandatory)

`name`

`String`

name of the test case

`parent`

`Object`

parent of the test case

`parent._type`

`String`

type of the parent (test-case-folder or project)

`parent.id`

`Number`

id of the parent

`importance`

`String`

code of the importance

`status`

`String`

code of the status

`nature.code`

`String`

code of the nature

`type.code`

`String`

code of the type of test case

`prerequisite`

`String`

prerequisites that should be met before the execution of the test script (HTML)

`description`

`String`

description of the test case (HTML)

`custom_fields`

`Array`

custom fields of that test step (optionnal)

`custom_fields[].code`

`String`

code of the custom field, must be associated with the parent

`custom_fields[].value`

`Varies`

value of the custom field. The value is either a string (for most custom fields), or an array of strings (for multivalued custom fields e.g. a tag list)

`steps`

`Array`

steps of the test case

`steps[]._type`

`String`

type of the step test you want to create (can be call-step or action-step for a standard test case)

`steps[].delegate_parameter_values`

`Boolean`

whether the parameters of the callee test case should be set by the caller rather than by a dataset of the called (only for call-step, false by default)

`steps[].called_test_case.id`

`Number`

steps of a test case you want to associate with the newly created step test (mandatory for a call-step)

`steps[].called_dataset.id`

`Number`

id of the dataset to use for the callee test case (only for a call step, optional)

`steps[].action`

`String`

action to be accomplished, format is HTML (mandatory for action step)

`steps[].expected_result`

`String`

state or behavior that should be observable when the action has been performed, format is HTML (mandatory for action-step)

`steps[].custom_fields[].code`

`String`

code of the custom field, must be associated with the parent (optional for action-step)

`steps[].custom_fields[].value`

`Varies`

value of the custom field. The value is either a string (for most custom fields) or an array of strings (for multivalued custom fields e.g. a tag list) (optional for action-step)

`datasets`

`Array`

dataset to use when the test case is executed (optional)

`datasets[].name`

`String`

name of the dataset you want to create

`verified_requirements`

`Array`

requirements verified by the test case

`verified_requirements[].id`

`Number`

ids of the verified requirements

#### [Create a scripted test case](#_create_a_scripted_test_case)

##### [HTTP request](#_create_a_scripted_test_case_http_request)

    POST /api/rest/latest/test-cases HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Content-Length: 177
    Host: localhost:8080

    {
      "_type" : "scripted-test-case",
      "name" : "Christmas turkey test flight",
      "parent" : {
        "_type" : "project",
        "id" : 15
      },
      "script" : "this is Gherkin script"
    }

##### [Example response](#_create_a_scripted_test_case_http_response)

    HTTP/1.1 201 Created
    Content-Type: application/json
    Content-Length: 2058

    {
      "_type" : "scripted-test-case",
      "id" : 240,
      "name" : "Christmas turkey test flight",
      "reference" : "",
      "project" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "path" : "/Christmas Eve/Christmas turkey test flight",
      "parent" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "created_by" : "admin",
      "created_on" : "2020-04-02T10:00:00.000+00:00",
      "last_modified_by" : "admin",
      "last_modified_on" : "2020-04-02T10:00:00.000+00:00",
      "importance" : "LOW",
      "status" : "WORK_IN_PROGRESS",
      "nature" : {
        "code" : "NAT_FUNCTIONAL_TESTING"
      },
      "type" : {
        "code" : "TYP_EVOLUTION_TESTING"
      },
      "prerequisite" : "",
      "description" : null,
      "automated_test" : null,
      "automated_test_technology" : null,
      "scm_repository_url" : null,
      "scm_repository_id" : null,
      "automated_test_reference" : null,
      "uuid" : "ba47cbd0-ea0b-4b0d-b086-b77dbd929b38",
      "custom_fields" : [ ],
      "steps" : [ ],
      "parameters" : [ ],
      "datasets" : [ ],
      "script" : "this is Gherkin script",
      "verified_requirements" : [ ],
      "milestones" : [ ],
      "drafted_by_ai" : false,
      "script_auto" : "",
      "attachments" : [ ],
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240"
        },
        "project" : {
          "href" : "http://localhost:8080/api/rest/latest/projects/15"
        },
        "steps" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/steps"
        },
        "parameters" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/parameters"
        },
        "datasets" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/datasets"
        },
        "attachments" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/attachments"
        }
      }
    }

#### [Create a keyword test case](#_create_a_keyword_test_case)

##### [HTTP request](#_create_a_keyword_test_case_http_request)

    POST /api/rest/latest/test-cases HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Content-Length: 154
    Host: localhost:8080

    {
      "_type" : "keyword-test-case",
      "name" : "Christmas turkey test flight",
      "parent" : {
        "_type" : "project",
        "id" : 15
      },
      "steps" : [ ]
    }

##### [Example response](#_create_a_keyword_test_case_http_response)

    HTTP/1.1 201 Created
    Content-Type: application/json
    Content-Length: 2018

    {
      "_type" : "keyword-test-case",
      "id" : 240,
      "name" : "Christmas turkey test flight",
      "reference" : "",
      "project" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "path" : "/Christmas Eve/Christmas turkey test flight",
      "parent" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "created_by" : "admin",
      "created_on" : "2020-04-03T10:00:00.000+00:00",
      "last_modified_by" : "admin",
      "last_modified_on" : "2020-04-03T10:00:00.000+00:00",
      "importance" : "LOW",
      "status" : "WORK_IN_PROGRESS",
      "nature" : {
        "code" : "NAT_FUNCTIONAL_TESTING"
      },
      "type" : {
        "code" : "TYP_EVOLUTION_TESTING"
      },
      "prerequisite" : "",
      "description" : null,
      "automated_test" : null,
      "automated_test_technology" : null,
      "scm_repository_url" : null,
      "scm_repository_id" : null,
      "automated_test_reference" : null,
      "uuid" : "fd08c711-c9f1-435f-9fcc-ac03c53378b5",
      "custom_fields" : [ ],
      "steps" : [ ],
      "parameters" : [ ],
      "datasets" : [ ],
      "verified_requirements" : [ ],
      "milestones" : [ ],
      "drafted_by_ai" : false,
      "script_auto" : "",
      "attachments" : [ ],
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240"
        },
        "project" : {
          "href" : "http://localhost:8080/api/rest/latest/projects/15"
        },
        "steps" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/steps"
        },
        "parameters" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/parameters"
        },
        "datasets" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/datasets"
        },
        "attachments" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/attachments"
        }
      }
    }

#### [Create an exploratory test case](#_create_an_exploratory_test_case)

##### [HTTP request](#_create_an_exploratory_test_case_http_request)

    POST /api/rest/latest/test-cases HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Content-Length: 226
    Host: localhost:8080

    {
      "_type" : "exploratory-test-case",
      "name" : "Christmas Turkey test flight",
      "parent" : {
        "_type" : "project",
        "id" : 15
      },
      "charter" : "this is an Exploratory Test Case Charter",
      "session_duration" : 30
    }

##### [Example response](#_create_an_exploratory_test_case_http_response)

    HTTP/1.1 201 Created
    Content-Type: application/json
    Content-Length: 2122

    {
      "_type" : "exploratory-test-case",
      "id" : 240,
      "name" : "Christmas Turkey test flight",
      "reference" : "",
      "project" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Halloween",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "path" : "/Christmas Eve/Christmas turkey test flight",
      "parent" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Halloween",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "created_by" : "admin",
      "created_on" : "2023-11-02T11:00:00.000+00:00",
      "last_modified_by" : "admin",
      "last_modified_on" : "2023-11-04T11:00:00.000+00:00",
      "importance" : "LOW",
      "status" : "WORK_IN_PROGRESS",
      "nature" : {
        "code" : "NAT_FUNCTIONAL_TESTING"
      },
      "type" : {
        "code" : "TYP_EVOLUTION_TESTING"
      },
      "description" : null,
      "uuid" : "ce71e4a1-d633-4973-8315-fc3f894cba19",
      "custom_fields" : [ ],
      "charter" : "this is an Exploratory Test Case Charter",
      "session_duration" : 30,
      "verified_requirements" : [ ],
      "prerequisite" : "",
      "steps" : [ ],
      "parameters" : [ ],
      "datasets" : [ ],
      "milestones" : [ ],
      "automatable" : "M",
      "scm_repository_url" : null,
      "automated_test_reference" : null,
      "automated_test_technology" : null,
      "automated_test" : null,
      "drafted_by_ai" : false,
      "script_auto" : "",
      "scm_repository_id" : null,
      "attachments" : [ ],
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240"
        },
        "project" : {
          "href" : "http://localhost:8080/api/rest/latest/projects/15"
        },
        "steps" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/steps"
        },
        "parameters" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/parameters"
        },
        "datasets" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/datasets"
        },
        "attachments" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/attachments"
        }
      }
    }

#### [Create a test case with automation attributes](#_create_a_test_case_with_automation_attributes)

##### [HTTP request](#_create_a_test_case_with_automation_attributes_http_request)

    POST /api/rest/latest/test-cases HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Content-Length: 250
    Host: localhost:8080

    {
      "_type" : "keyword-test-case",
      "name" : "Christmas turkey test flight",
      "parent" : {
        "_type" : "project",
        "id" : 15
      },
      "automated_test_technology" : "Robot Framework",
      "scm_repository_id" : 6,
      "automated_test_reference" : ""
    }

##### [Example response](#_create_a_test_case_with_automation_attributes_http_response)

    HTTP/1.1 201 Created
    Content-Type: application/json
    Content-Length: 2063

    {
      "_type" : "keyword-test-case",
      "id" : 240,
      "name" : "Christmas turkey test flight",
      "reference" : "",
      "project" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "path" : "/Christmas Eve/Christmas turkey test flight",
      "parent" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "created_by" : "admin",
      "created_on" : "2020-04-03T10:00:00.000+00:00",
      "last_modified_by" : "admin",
      "last_modified_on" : "2020-04-03T10:00:00.000+00:00",
      "importance" : "LOW",
      "status" : "WORK_IN_PROGRESS",
      "nature" : {
        "code" : "NAT_FUNCTIONAL_TESTING"
      },
      "type" : {
        "code" : "TYP_EVOLUTION_TESTING"
      },
      "prerequisite" : "",
      "description" : null,
      "automated_test" : null,
      "automated_test_technology" : "Robot Framework",
      "scm_repository_url" : "https://github.com/test/repo01 (master)",
      "scm_repository_id" : 6,
      "automated_test_reference" : "",
      "uuid" : "acd5500b-6ea3-4aa1-ac64-3a2cb1af4ff5",
      "custom_fields" : [ ],
      "steps" : [ ],
      "parameters" : [ ],
      "datasets" : [ ],
      "verified_requirements" : [ ],
      "milestones" : [ ],
      "drafted_by_ai" : false,
      "script_auto" : "",
      "attachments" : [ ],
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240"
        },
        "project" : {
          "href" : "http://localhost:8080/api/rest/latest/projects/15"
        },
        "steps" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/steps"
        },
        "parameters" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/parameters"
        },
        "datasets" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/datasets"
        },
        "attachments" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/attachments"
        }
      }
    }

### [![patch](images/patch.png) Modify test case](#_modify_test_case)

A `PATCH` to `/test-cases/{id}` modifies the test case with the given id.

#### [Modify a standard test case](#_modify_a_standard_test_case)

##### [HTTP request](#_modify_a_standard_test_case_http_request)

    PATCH /api/rest/latest/test-cases/240 HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Content-Length: 70
    Host: localhost:8080

    {
      "_type" : "test-case",
      "name" : "Christmas turkey test launch"
    }

##### [Example response](#_modify_a_standard_test_case_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 2010

    {
      "_type" : "test-case",
      "id" : 240,
      "name" : "Christmas turkey test launch",
      "reference" : "",
      "project" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "path" : "/Christmas Eve/Christmas turkey test launch",
      "parent" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "created_by" : "admin",
      "created_on" : "2017-06-15T10:00:00.000+00:00",
      "last_modified_by" : "admin",
      "last_modified_on" : "2017-06-15T10:00:00.000+00:00",
      "importance" : "LOW",
      "status" : "WORK_IN_PROGRESS",
      "nature" : {
        "code" : "NAT_FUNCTIONAL_TESTING"
      },
      "type" : {
        "code" : "TYP_EVOLUTION_TESTING"
      },
      "prerequisite" : "",
      "description" : null,
      "drafted_by_ai" : false,
      "automated_test" : null,
      "automated_test_technology" : null,
      "scm_repository_url" : null,
      "scm_repository_id" : null,
      "automated_test_reference" : null,
      "uuid" : "8f9b6f46-e865-40d3-8fd8-395b045369be",
      "custom_fields" : [ ],
      "steps" : [ ],
      "parameters" : [ ],
      "datasets" : [ ],
      "verified_requirements" : [ ],
      "milestones" : [ ],
      "script_auto" : "",
      "attachments" : [ ],
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240"
        },
        "project" : {
          "href" : "http://localhost:8080/api/rest/latest/projects/15"
        },
        "steps" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/steps"
        },
        "parameters" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/parameters"
        },
        "datasets" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/datasets"
        },
        "attachments" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/attachments"
        }
      }
    }

#### [Modify a scripted test case](#_modify_a_scripted_test_case)

##### [HTTP request](#_modify_a_scripted_test_case_http_request)

    PATCH /api/rest/latest/test-cases/240 HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Content-Length: 117
    Host: localhost:8080

    {
      "_type" : "scripted-test-case",
      "name" : "Christmas turkey test launch",
      "script" : "this is Christmas Eve"
    }

##### [Example response](#_modify_a_scripted_test_case_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 2057

    {
      "_type" : "scripted-test-case",
      "id" : 240,
      "name" : "Christmas turkey test launch",
      "reference" : "",
      "project" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "path" : "/Christmas Eve/Christmas turkey test launch",
      "parent" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "created_by" : "admin",
      "created_on" : "2020-04-02T10:00:00.000+00:00",
      "last_modified_by" : "admin",
      "last_modified_on" : "2020-04-02T10:00:00.000+00:00",
      "importance" : "LOW",
      "status" : "WORK_IN_PROGRESS",
      "nature" : {
        "code" : "NAT_FUNCTIONAL_TESTING"
      },
      "type" : {
        "code" : "TYP_EVOLUTION_TESTING"
      },
      "prerequisite" : "",
      "description" : null,
      "automated_test" : null,
      "automated_test_technology" : null,
      "scm_repository_url" : null,
      "scm_repository_id" : null,
      "automated_test_reference" : null,
      "uuid" : "d5248678-6351-484c-a71c-50c7a406ad8a",
      "custom_fields" : [ ],
      "steps" : [ ],
      "parameters" : [ ],
      "datasets" : [ ],
      "script" : "this is Christmas Eve",
      "verified_requirements" : [ ],
      "milestones" : [ ],
      "drafted_by_ai" : false,
      "script_auto" : "",
      "attachments" : [ ],
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240"
        },
        "project" : {
          "href" : "http://localhost:8080/api/rest/latest/projects/15"
        },
        "steps" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/steps"
        },
        "parameters" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/parameters"
        },
        "datasets" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/datasets"
        },
        "attachments" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/attachments"
        }
      }
    }

#### [Modify a keyword test case](#_modify_a_keyword_test_case)

##### [HTTP request](#_modify_a_keyword_test_case_http_request)

    PATCH /api/rest/latest/test-cases/240 HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Content-Length: 78
    Host: localhost:8080

    {
      "_type" : "keyword-test-case",
      "name" : "Christmas turkey test launch"
    }

##### [Example response](#_modify_a_keyword_test_case_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 2018

    {
      "_type" : "keyword-test-case",
      "id" : 240,
      "name" : "Christmas turkey test launch",
      "reference" : "",
      "project" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "path" : "/Christmas Eve/Christmas turkey test launch",
      "parent" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "created_by" : "admin",
      "created_on" : "2020-04-03T10:00:00.000+00:00",
      "last_modified_by" : "admin",
      "last_modified_on" : "2020-04-03T10:00:00.000+00:00",
      "importance" : "LOW",
      "status" : "WORK_IN_PROGRESS",
      "nature" : {
        "code" : "NAT_FUNCTIONAL_TESTING"
      },
      "type" : {
        "code" : "TYP_EVOLUTION_TESTING"
      },
      "prerequisite" : "",
      "description" : null,
      "automated_test" : null,
      "automated_test_technology" : null,
      "scm_repository_url" : null,
      "scm_repository_id" : null,
      "automated_test_reference" : null,
      "uuid" : "03898877-41ce-452a-bab7-c647ce6a27db",
      "custom_fields" : [ ],
      "steps" : [ ],
      "parameters" : [ ],
      "datasets" : [ ],
      "verified_requirements" : [ ],
      "milestones" : [ ],
      "drafted_by_ai" : false,
      "script_auto" : "",
      "attachments" : [ ],
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240"
        },
        "project" : {
          "href" : "http://localhost:8080/api/rest/latest/projects/15"
        },
        "steps" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/steps"
        },
        "parameters" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/parameters"
        },
        "datasets" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/datasets"
        },
        "attachments" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/attachments"
        }
      }
    }

#### [Modify an exploratory test case](#_modify_an_exploratory_test_case)

##### [HTTP request](#_modify_an_exploratory_test_case_http_request)

    PATCH /api/rest/latest/test-cases/240 HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Content-Length: 177
    Host: localhost:8080

    {
      "_type" : "exploratory-test-case",
      "name" : "Christmas turkey test launch",
      "charter" : "this is Christmas Eve, presents should be wrapped.",
      "session_duration" : 25
    }

##### [Example response](#_modify_an_exploratory_test_case_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 2149

    {
      "_type" : "exploratory-test-case",
      "id" : 240,
      "name" : "Christmas turkey test launch",
      "reference" : "",
      "project" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "path" : "/Christmas Eve/Christmas turkey test launch",
      "parent" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "created_by" : "admin",
      "created_on" : "2023-11-02T11:00:00.000+00:00",
      "last_modified_by" : "admin",
      "last_modified_on" : "2023-11-04T11:00:00.000+00:00",
      "importance" : "LOW",
      "status" : "WORK_IN_PROGRESS",
      "nature" : {
        "code" : "NAT_FUNCTIONAL_TESTING"
      },
      "type" : {
        "code" : "TYP_EVOLUTION_TESTING"
      },
      "description" : null,
      "uuid" : "2006aa5a-d895-4b11-bd1d-6025bf7001ca",
      "custom_fields" : [ ],
      "charter" : "On Christmas Eve, presents should be placed under the tree.",
      "session_duration" : 42,
      "verified_requirements" : [ ],
      "prerequisite" : "",
      "steps" : [ ],
      "parameters" : [ ],
      "datasets" : [ ],
      "milestones" : [ ],
      "automatable" : "M",
      "scm_repository_url" : null,
      "automated_test_reference" : null,
      "automated_test_technology" : null,
      "automated_test" : null,
      "drafted_by_ai" : false,
      "script_auto" : "",
      "scm_repository_id" : null,
      "attachments" : [ ],
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240"
        },
        "project" : {
          "href" : "http://localhost:8080/api/rest/latest/projects/15"
        },
        "steps" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/steps"
        },
        "parameters" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/parameters"
        },
        "datasets" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/datasets"
        },
        "attachments" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/attachments"
        }
      }
    }

#### [Modify a test case with automation attributes](#_modify_a_test_case_with_automation_attributes)

##### [HTTP request](#_modify_a_test_case_with_automation_attributes_http_request)

    PATCH /api/rest/latest/test-cases/240 HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Content-Length: 262
    Host: localhost:8080

    {
      "_type" : "scripted-test-case",
      "name" : "Christmas turkey test launch",
      "script" : "this is Christmas Eve",
      "automated_test_technology" : "Cucumber 4",
      "scm_repository_id" : 6,
      "automated_test_reference" : "",
      "automation_status" : "AUTOMATED"
    }

##### [Example response](#_modify_a_test_case_with_automation_attributes_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 2097

    {
      "_type" : "scripted-test-case",
      "id" : 240,
      "name" : "Christmas turkey test launch",
      "reference" : "",
      "project" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "path" : "/Christmas Eve/Christmas turkey test launch",
      "parent" : {
        "_type" : "project",
        "id" : 15,
        "name" : "Christmas Eve",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "created_by" : "admin",
      "created_on" : "2020-04-02T10:00:00.000+00:00",
      "last_modified_by" : "admin",
      "last_modified_on" : "2020-04-02T10:00:00.000+00:00",
      "importance" : "LOW",
      "status" : "WORK_IN_PROGRESS",
      "nature" : {
        "code" : "NAT_FUNCTIONAL_TESTING"
      },
      "type" : {
        "code" : "TYP_EVOLUTION_TESTING"
      },
      "prerequisite" : "",
      "description" : null,
      "automated_test" : null,
      "automated_test_technology" : "Cucumber 4",
      "scm_repository_url" : "https://github.com/test/repo01 (master)",
      "scm_repository_id" : 6,
      "automated_test_reference" : "",
      "uuid" : "3f51a869-84e0-434e-ad71-b7fd0c9f0b23",
      "custom_fields" : [ ],
      "steps" : [ ],
      "parameters" : [ ],
      "datasets" : [ ],
      "script" : "this is Christmas Eve",
      "verified_requirements" : [ ],
      "milestones" : [ ],
      "drafted_by_ai" : false,
      "script_auto" : "",
      "attachments" : [ ],
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240"
        },
        "project" : {
          "href" : "http://localhost:8080/api/rest/latest/projects/15"
        },
        "steps" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/steps"
        },
        "parameters" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/parameters"
        },
        "datasets" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/datasets"
        },
        "attachments" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/attachments"
        }
      }
    }

### [![get](images/get.png) Get datasets of test case](#_get_datasets_of_test_case)

A `GET` to `/test-cases/{id}/datasets` returns all the datasets of the test case with the given id.

#### [Path parameters](#_get_datasets_of_test_case_path_parameters)

Table 6. /api/rest/latest/test-cases/{id}/datasets

Parameter

Description

`id`

the id of the test case

#### [HTTP request](#_get_datasets_of_test_case_http_request)

    GET /api/rest/latest/test-cases/238/datasets HTTP/1.1
    Accept: application/json
    Host: localhost:8080

#### [Query parameters](#_get_datasets_of_test_case_query_parameters)

Parameter

Description

`page`

number of the page to retrieve (optional)

`size`

size of the page to retrieve (optional)

`fields`

which fields of the elements should be returned (optional)

#### [Example response](#_get_datasets_of_test_case_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 1804

    {
      "_embedded" : {
        "datasets" : [ {
          "_type" : "dataset",
          "id" : 1,
          "name" : "big_cake",
          "parameters" : [ {
            "_type" : "parameter",
            "id" : 1,
            "name" : "cocoa_purity"
          }, {
            "_type" : "parameter",
            "id" : 2,
            "name" : "number_of_layers"
          } ],
          "parameter_values" : [ {
            "parameter_test_case_id" : 238,
            "parameter_value" : "98%",
            "parameter_name" : "cocoa_purity",
            "parameter_id" : 1
          }, {
            "parameter_test_case_id" : 238,
            "parameter_value" : "4",
            "parameter_name" : "number_of_layers",
            "parameter_id" : 2
          } ],
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/datasets/1"
            }
          }
        }, {
          "_type" : "dataset",
          "id" : 2,
          "name" : "biscuit",
          "parameters" : [ {
            "_type" : "parameter",
            "id" : 1,
            "name" : "cocoa_purity"
          }, {
            "_type" : "parameter",
            "id" : 2,
            "name" : "number_of_layers"
          } ],
          "parameter_values" : [ {
            "parameter_test_case_id" : 238,
            "parameter_value" : "80%",
            "parameter_name" : "cocoa_purity",
            "parameter_id" : 1
          }, {
            "parameter_test_case_id" : 238,
            "parameter_value" : "1",
            "parameter_name" : "number_of_layers",
            "parameter_id" : 2
          } ],
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/datasets/2"
            }
          }
        } ]
      },
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/238/datasets?page=0&size=20"
        }
      },
      "page" : {
        "size" : 20,
        "totalElements" : 2,
        "totalPages" : 1,
        "number" : 0
      }
    }

#### [Response fields](#_get_datasets_of_test_case_response_fields)

Path

Type

Description

`_embedded.datasets`

`Array`

the datasets of this test case

`page.size`

`Number`

the page size for that query

`page.totalElements`

`Number`

total number of elements the user is allowed to read

`page.totalPages`

`Number`

how many pages can be browsed

`page.number`

`Number`

the page number

`_links`

`Object`

related links

#### [Links](#_get_datasets_of_test_case_links)

Relation

Description

`first`

link to the first page (optional)

`prev`

link to the previous page (optional)

`self`

link to this page

`next`

link to the next page (optional)

`last`

link to the last page (optional)

### [![get](images/get.png) Get parameters of test case](#_get_parameters_of_test_case)

A `GET` to `/test-cases/{id}/parameters` returns all the parameters of the test case with the given id.

#### [Path parameters](#_get_parameters_of_test_case_path_parameters)

Table 6. /api/rest/latest/test-cases/{id}/parameters

Parameter

Description

`id`

the id of the test case

#### [HTTP request](#_get_parameters_of_test_case_http_request)

    GET /api/rest/latest/test-cases/238/parameters HTTP/1.1
    Accept: application/json
    Host: localhost:8080

#### [Query parameters](#_get_parameters_of_test_case_query_parameters)

Parameter

Description

`page`

number of the page to retrieve (optional)

`size`

size of the page to retrieve (optional)

`fields`

which fields of the elements should be returned (optional)

#### [Example response](#_get_parameters_of_test_case_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 1396

    {
      "_embedded" : {
        "parameters" : [ {
          "_type" : "parameter",
          "id" : 1,
          "name" : "cocoa_purity",
          "description" : "<p>how refined the cocoa cream should be</p>",
          "test_case" : {
            "_type" : "keyword-test-case",
            "id" : 238,
            "name" : "Chocolate cake",
            "_links" : {
              "self" : {
                "href" : "http://localhost:8080/api/rest/latest/test-cases/238"
              }
            }
          },
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/parameters/1"
            }
          }
        }, {
          "_type" : "parameter",
          "id" : 2,
          "name" : "number_of_layers",
          "description" : "<p>how many times should the base pattern be repeated</p>",
          "test_case" : {
            "_type" : "keyword-test-case",
            "id" : 238,
            "name" : "Chocolate cake",
            "_links" : {
              "self" : {
                "href" : "http://localhost:8080/api/rest/latest/test-cases/238"
              }
            }
          },
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/parameters/2"
            }
          }
        } ]
      },
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/238/parameters?page=0&size=20"
        }
      },
      "page" : {
        "size" : 20,
        "totalElements" : 2,
        "totalPages" : 1,
        "number" : 0
      }
    }

#### [Response fields](#_get_parameters_of_test_case_response_fields)

Path

Type

Description

`_embedded.parameters`

`Array`

the parameters of this test case

`page.size`

`Number`

the page size for that query

`page.totalElements`

`Number`

total number of elements the user is allowed to read

`page.totalPages`

`Number`

how many pages can be browsed

`page.number`

`Number`

the page number

`_links`

`Object`

related links

#### [Links](#_get_parameters_of_test_case_links)

Relation

Description

`first`

link to the first page (optional)

`prev`

link to the previous page (optional)

`self`

link to this page

`next`

link to the next page (optional)

`last`

link to the last page (optional)

### [![get](images/get.png) Get steps of test case](#_get_steps_of_test_case)

A `GET` to `/test-cases/{id}/steps` returns all the steps of the test case with the given id.

#### [In case of a standard test case](#_in_case_of_a_standard_test_case)

##### [Path parameters](#_in_case_of_a_standard_test_case_path_parameters)

Table 6. /api/rest/latest/test-cases/{id}/steps

Parameter

Description

`id`

the id of the test case

##### [HTTP request](#_in_case_of_a_standard_test_case_http_request)

    GET /api/rest/latest/test-cases/239/steps HTTP/1.1
    Accept: application/json
    Host: localhost:8080

##### [Query parameters](#_in_case_of_a_standard_test_case_query_parameters)

Parameter

Description

`page`

number of the page to retrieve (optional)

`size`

size of the page to retrieve (optional)

`fields`

which fields of the elements should be returned (optional)

##### [Example response](#_in_case_of_a_standard_test_case_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 2510

    {
      "_embedded" : {
        "steps" : [ {
          "_type" : "action-step",
          "id" : 167,
          "action" : "<p>Quick step forward</p>\n",
          "expected_result" : "<p>So does your opponent</p>\n",
          "index" : 0,
          "custom_fields" : [ {
            "code" : "CHK_BODY_FEINT",
            "label" : "requires body feint",
            "value" : "false"
          } ],
          "verified_requirements" : [ ],
          "attachments" : [ ],
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/test-steps/167"
            }
          }
        }, {
          "_type" : "action-step",
          "id" : 168,
          "action" : "<p>Another quick step forward, albeit smaller</p>\n",
          "expected_result" : "<p>Opponent&nbsp;doubles his steps too then lunges forward for an attack</p>\n",
          "index" : 1,
          "custom_fields" : [ {
            "code" : "CHK_BODY_FEINT",
            "label" : "requires body feint",
            "value" : "true"
          } ],
          "verified_requirements" : [ ],
          "attachments" : [ ],
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/test-steps/168"
            }
          }
        }, {
          "_type" : "action-step",
          "id" : 169,
          "action" : "<p>Strong Quarte parry, possibly with a slight retreat.</p>\n",
          "expected_result" : "<p>Opponent&#39;s attack gets blocked by your blade.</p>\n",
          "index" : 2,
          "custom_fields" : [ {
            "code" : "CHK_BODY_FEINT",
            "label" : "requires body feint",
            "value" : "false"
          } ],
          "verified_requirements" : [ ],
          "attachments" : [ ],
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/test-steps/169"
            }
          }
        }, {
          "_type" : "call-step",
          "id" : 170,
          "delegate_parameter_values" : true,
          "called_test_case" : {
            "_type" : "test-case",
            "id" : 240,
            "name" : "Compound riposte",
            "_links" : {
              "self" : {
                "href" : "http://localhost:8080/api/rest/latest/test-cases/240"
              }
            }
          },
          "called_dataset" : null,
          "index" : 3,
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/test-steps/170"
            }
          }
        } ]
      },
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/239/steps?page=0&size=20"
        }
      },
      "page" : {
        "size" : 20,
        "totalElements" : 4,
        "totalPages" : 1,
        "number" : 0
      }
    }

##### [Response fields](#_in_case_of_a_standard_test_case_response_fields)

Path

Type

Description

`_embedded.steps`

`Array`

the steps of this test case

`page.size`

`Number`

the page size for that query

`page.totalElements`

`Number`

total number of elements the user is allowed to read

`page.totalPages`

`Number`

how many pages can be browsed

`page.number`

`Number`

the page number

`_links`

`Object`

related links

##### [Links](#_in_case_of_a_standard_test_case_links)

Relation

Description

`first`

link to the first page (optional)

`prev`

link to the previous page (optional)

`self`

link to this page

`next`

link to the next page (optional)

`last`

link to the last page (optional)

#### [In case of a keyword test case](#_in_case_of_a_keyword_test_case)

##### [Path parameters](#_in_case_of_a_keyword_test_case_path_parameters)

Table 6. /api/rest/latest/test-cases/{id}/steps

Parameter

Description

`id`

the id of the test case

##### [HTTP request](#_in_case_of_a_keyword_test_case_http_request)

    GET /api/rest/latest/test-cases/2/steps HTTP/1.1
    Accept: application/json
    Host: localhost:8080

##### [Query parameters](#_in_case_of_a_keyword_test_case_query_parameters)

Parameter

Description

`page`

number of the page to retrieve (optional)

`size`

size of the page to retrieve (optional)

`fields`

which fields of the elements should be returned (optional)

##### [Example response](#_in_case_of_a_keyword_test_case_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 1332

    {
      "_embedded" : {
        "steps" : [ {
          "_type" : "keyword-step",
          "id" : 180,
          "keyword" : "GIVEN",
          "action" : "first \"good\" action word",
          "datatable" : "",
          "docstring" : "",
          "comment" : "",
          "index" : 0,
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/test-steps/180"
            }
          }
        }, {
          "_type" : "keyword-step",
          "id" : 181,
          "keyword" : "WHEN",
          "action" : "second action with \"5\" words",
          "datatable" : "",
          "docstring" : "",
          "comment" : "",
          "index" : 1,
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/test-steps/181"
            }
          }
        }, {
          "_type" : "keyword-step",
          "id" : 182,
          "keyword" : "THEN",
          "action" : "third action <attribute> word",
          "datatable" : "",
          "docstring" : "",
          "comment" : "",
          "index" : 2,
          "_links" : {
            "self" : {
              "href" : "http://localhost:8080/api/rest/latest/test-steps/182"
            }
          }
        } ]
      },
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/2/steps?page=0&size=20"
        }
      },
      "page" : {
        "size" : 20,
        "totalElements" : 3,
        "totalPages" : 1,
        "number" : 0
      }
    }

##### [Response fields](#_in_case_of_a_keyword_test_case_response_fields)

Path

Type

Description

`_embedded.steps`

`Array`

the steps of this test case

`page.size`

`Number`

the page size for that query

`page.totalElements`

`Number`

total number of elements the user is allowed to read

`page.totalPages`

`Number`

how many pages can be browsed

`page.number`

`Number`

the page number

`_links`

`Object`

related links

##### [Links](#_in_case_of_a_keyword_test_case_links)

Relation

Description

`first`

link to the first page (optional)

`prev`

link to the previous page (optional)

`self`

link to this page

`next`

link to the next page (optional)

`last`

link to the last page (optional)

### [![get](images/get.png) Get issues of test case](#_get_issues_of_test_case)

A `GET` to `/test-cases/{id}/issues` returns all the issues of the test case with the given id.

#### [Path parameters](#_get_issues_of_test_case_path_parameters)

Table 6. /api/rest/latest/test-cases/{id}/issues

Parameter

Description

`id`

the id of the test case

#### [HTTP request](#_get_issues_of_test_case_http_request)

    GET /api/rest/latest/test-cases/238/issues?page=0&size=20 HTTP/1.1
    Accept: application/json
    Host: localhost:8080

#### [Query parameters](#_get_issues_of_test_case_query_parameters)

Parameter

Description

`page`

number of the page to retrieve (optional)

`size`

size of the page to retrieve (optional)

#### [Example response](#_get_issues_of_test_case_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 603

    {
      "_embedded" : {
        "issues" : [ {
          "remoteIssueId" : "165",
          "url" : "http://192.175.1.51/bugzilla/show_bug.cgi?id=165",
          "executions" : [ {
            "_type" : "execution",
            "id" : 2,
            "_links" : {
              "self" : {
                "href" : "http://localhost:8080/api/rest/latest/executions/2"
              }
            }
          } ]
        } ]
      },
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/238/issues?page=0&size=20"
        }
      },
      "page" : {
        "size" : 20,
        "totalElements" : 1,
        "totalPages" : 1,
        "number" : 0
      }
    }

#### [Response fields](#_get_issues_of_test_case_response_fields)

Path

Type

Description

`_embedded.issues`

`Array`

the issues of this test case

`_embedded.issues[].remoteIssueId`

`String`

the remote issue id of the issue linked to the entity.

`_embedded.issues[].url`

`String`

the URL of the issue linked to the entity.

`_embedded.issues[].executions`

`Array`

the executions linked to the entity.

`page.size`

`Number`

the page size for that query

`page.totalElements`

`Number`

total number of elements the user is allowed to read

`page.totalPages`

`Number`

how many pages can be browsed

`page.number`

`Number`

the page number

`_links`

`Object`

related links

#### [Links](#_get_issues_of_test_case_links)

Relation

Description

`first`

link to the first page (optional)

`prev`

link to the previous page (optional)

`self`

link to this page

`next`

link to the next page (optional)

`last`

link to the last page (optional)

### [![delete](images/delete.png) Delete test case](#_delete_test_case)

A `DELETE` to `/test-cases/{ids}` deletes one or several test cases/folders with the given id(s).

When many test cases need to be deleted, the system determines which ones are actually deletable according to the business rules. After this filtering, only the deletable items will be removed.

The service returns a list of messages indicating the result of the operation. If all deletions succeed, this list will be empty. In the event that certain elements could not be deleted due to business rules, the service will return one or more messages to indicate why. Note that these messages are the same as those displayed in the user interface.

Optionally, you can pass the parameter 'dry-run = true'. In this mode, only the diagnostics and messages are returned - no test case will be deleted.

#### [Path parameters](#_delete_test_case_path_parameters)

Table 6. /api/rest/latest/test-cases/{ids}

Parameter

Description

`ids`

the list of ids of the test case

#### [HTTP request](#_delete_test_case_http_request)

    DELETE /api/rest/latest/test-cases/2,3?dry-run=true HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Accept-Language: fr_FR_FR
    Host: localhost:8080

#### [Query parameters](#_delete_test_case_query_parameters)

Parameter

Description

`dry-run`

indicates if you really want to delete the test case or you just want to do a simulation: if dryRun = true : to do just a delete simulation, if dryRun = false or null: for delete test case

#### [Example response](#_delete_test_case_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 322

    [ "Les cas de test suivants ne seront pas supprimés : Test-Case3<br/>parce qu'ils sont appelés par les cas de test suivants :\",\n Test-Case 1, Test-Case 4, Test-Case2<br/>\",\nLe cas de test :Test-Case3<br/>est référencé dans au moins une itération. Après sa suppression, il ne pourra plus être exécuté.<br/>" ]

### [![post](images/post.png) Link requirements to a test case](#_link_requirements_to_a_test_case)

A `POST` to `test-cases/{id}/coverages/{requirementIds}` links the requirements to the test case with the given id.

#### [Path parameters](#_link_requirements_to_a_test_case_path_parameters)

Table 6. /api/rest/latest/test-cases/{id}/coverages/{requirementIds}

Parameter

Description

`id`

the id of the test case

`requirementIds`

the ids of the requirements to link

#### [HTTP request](#_link_requirements_to_a_test_case_http_request)

    POST /api/rest/latest/test-cases/240/coverages/12,13,14 HTTP/1.1
    Accept: application/json
    Host: localhost:8080
    Content-Type: application/x-www-form-urlencoded

#### [Example response](#_link_requirements_to_a_test_case_http_response)

    HTTP/1.1 200 OK
    Content-Type: application/json
    Content-Length: 2713

    {
      "_type" : "test-case",
      "id" : 240,
      "name" : "My test case",
      "reference" : "",
      "project" : {
        "_type" : "project",
        "id" : 15,
        "name" : "My project",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/projects/15"
          }
        }
      },
      "parent" : {
        "_type" : "test-case-folder",
        "id" : 305,
        "name" : "My folder",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/test-case-folders/305"
          }
        }
      },
      "created_by" : "admin",
      "created_on" : "2017-06-15T10:00:00.000+00:00",
      "last_modified_by" : "admin",
      "last_modified_on" : "2017-06-15T10:00:00.000+00:00",
      "importance" : "LOW",
      "status" : "WORK_IN_PROGRESS",
      "nature" : {
        "code" : "NAT_FUNCTIONAL_TESTING"
      },
      "type" : {
        "code" : "TYP_EVOLUTION_TESTING"
      },
      "prerequisite" : "",
      "description" : null,
      "drafted_by_ai" : false,
      "automated_test" : null,
      "automated_test_technology" : null,
      "scm_repository_url" : null,
      "scm_repository_id" : null,
      "automated_test_reference" : null,
      "uuid" : "2c4e433e-4400-4aba-a4c8-4c7e86084b69",
      "custom_fields" : [ {
        "code" : "AUTOMATED",
        "label" : "test_is_automated",
        "value" : "false"
      } ],
      "steps" : [ ],
      "parameters" : [ ],
      "datasets" : [ ],
      "verified_requirements" : [ {
        "_type" : "requirement-version",
        "id" : 12,
        "name" : "My first requirement",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/requirement-versions/12"
          }
        }
      }, {
        "_type" : "requirement-version",
        "id" : 13,
        "name" : "My second requirement",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/requirement-versions/13"
          }
        }
      }, {
        "_type" : "requirement-version",
        "id" : 14,
        "name" : "My third requirement",
        "_links" : {
          "self" : {
            "href" : "http://localhost:8080/api/rest/latest/requirement-versions/14"
          }
        }
      } ],
      "milestones" : [ ],
      "script_auto" : "",
      "attachments" : [ ],
      "_links" : {
        "self" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240"
        },
        "project" : {
          "href" : "http://localhost:8080/api/rest/latest/projects/15"
        },
        "steps" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/steps"
        },
        "parameters" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/parameters"
        },
        "datasets" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/datasets"
        },
        "attachments" : {
          "href" : "http://localhost:8080/api/rest/latest/test-cases/240/attachments"
        }
      }
    }

### [![delete](images/delete.png) Unlink requirements from a test case](#_unlink_requirements_from_a_test_case)

A `DELETE` to `test-cases/{id}/coverages/{requirementIds}` unlinks the requirements from the test case with the given id.

#### [Path parameters](#_unlink_requirements_from_a_test_case_path_parameters)

Table 6. /api/rest/latest/test-cases/{id}/coverages/{requirementIds}

Parameter

Description

`id`

the id of the test case

`requirementIds`

the ids of the requirements to unlink

#### [HTTP request](#_unlink_requirements_from_a_test_case_http_request)

    DELETE /api/rest/latest/test-cases/543/coverages/350,351 HTTP/1.1
    Content-Type: application/json
    Accept: application/json
    Host: localhost:8080
