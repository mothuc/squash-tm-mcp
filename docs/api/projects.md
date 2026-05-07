# Squash TM Projects API Reference

This document describes the Squash TM REST API endpoints for project operations.

## Overview

Projects in Squash TM are containers for test cases, requirements, and campaigns. Projects can be standard projects or project templates. Templates can be used to create new projects with predefined configurations.

## Endpoints

### GET /projects

Get all projects (both standard and template) that the user is allowed to read.

**Query Parameters:**
- `page` (optional): Page number to retrieve (default: 0)
- `size` (optional): Page size (default: 20)
- `type` (optional): Filter by project type (`STANDARD` or `TEMPLATE`)
- `milestoneId` (optional): Filter by milestone ID
- `milestoneLabel` (optional): Filter by milestone label (case-sensitive)
- `fields` (optional): Which fields of the elements should be returned

**Example Request (all projects):**
```http
GET /api/rest/latest/projects?page=0&size=4 HTTP/1.1
Accept: application/json
Host: localhost:8080
```

**Example Response:**
```json
{
  "_embedded": {
    "projects": [
      {
        "_type": "project",
        "id": 367,
        "name": "sample project 1",
        "_links": {
          "self": {
            "href": "http://localhost:8080/api/rest/latest/projects/367"
          }
        }
      },
      {
        "_type": "project",
        "id": 456,
        "name": "sample project 2",
        "_links": {
          "self": {
            "href": "http://localhost:8080/api/rest/latest/projects/456"
          }
        }
      }
    ],
    "project-templates": [
      {
        "_type": "project-template",
        "id": 971,
        "name": "project template 4",
        "_links": {
          "self": {
            "href": "http://localhost:8080/api/rest/latest/projects/971"
          }
        }
      }
    ]
  },
  "_links": {
    "self": {
      "href": "http://localhost:8080/api/rest/latest/projects?page=0&size=4"
    }
  },
  "page": {
    "size": 4,
    "totalElements": 4,
    "totalPages": 1,
    "number": 0
  }
}
```

**Example Request (standard projects only):**
```http
GET /api/rest/latest/projects?type=STANDARD HTTP/1.1
Accept: application/json
Host: localhost:8080
```

**Example Request (templates only):**
```http
GET /api/rest/latest/projects?type=TEMPLATE HTTP/1.1
Accept: application/json
Host: localhost:8080
```

### GET /projects/{id}

Get a specific project by ID. This endpoint retrieves a project's administration data and is restricted to users with administrator privileges.

**Path Parameters:**
- `id` (number): The ID of the project

**Query Parameters:**
- `fields` (optional): Which fields of the elements should be returned

**Example Request:**
```http
GET /api/rest/latest/projects/367 HTTP/1.1
Accept: application/json
Host: localhost:8080
```

**Example Response:**
```json
{
  "_type": "project",
  "id": 367,
  "description": "<p>This project is the main sample project</p>",
  "label": "Main Sample Project",
  "name": "sample project",
  "attachments": [],
  "_links": {
    "self": {
      "href": "http://localhost:8080/api/rest/latest/projects/367"
    },
    "requirements": {
      "href": "http://localhost:8080/api/rest/latest/projects/367/requirements-library/content"
    },
    "test-cases": {
      "href": "http://localhost:8080/api/rest/latest/projects/367/test-cases-library/content"
    },
    "campaigns": {
      "href": "http://localhost:8080/api/rest/latest/projects/367/campaigns-library/content"
    },
    "clearances": {
      "href": "http://localhost:8080/api/rest/latest/projects/367/clearances"
    },
    "attachments": {
      "href": "http://localhost:8080/api/rest/latest/projects/367/attachments"
    }
  }
}
```

### GET /projects?projectName={name}

Get a project by name. This retrieves a project's administration data and is restricted to users with administrator privileges. **Note:** Both the parameter name `projectName` and its value are case-sensitive.

**Query Parameters:**
- `projectName` (required): The name of the project (case-sensitive)
- `fields` (optional): Which fields of the elements should be returned

**Example Request:**
```http
GET /api/rest/latest/projects?projectName=sample+project HTTP/1.1
Accept: application/json
Host: localhost:8080
```

Response format is the same as GET /projects/{id}.

### GET /projects?milestoneId={id}

Get all projects associated with a specific milestone. You can use either `milestoneId` or `milestoneLabel` to filter by milestone. These parameters are mutually exclusive.

**Query Parameters:**
- `milestoneId` (optional): The ID of the milestone
- `milestoneLabel` (optional): The label of the milestone (case-sensitive)
- `fields` (optional): Which fields of the elements should be returned

**Example Request:**
```http
GET /api/rest/latest/projects?milestoneId=1 HTTP/1.1
Accept: application/json
Host: localhost:8080
```

Response format is the same as GET /projects (paged response).

### POST /projects

Create a new project or project template.

#### Create Standard Project

**Request Body:**
```json
{
  "_type": "project",
  "name": "sample project",
  "label": "no price tag",
  "description": "<p>do something meaningful</p>"
}
```

**Fields:**
- `_type` (required): Must be `"project"`
- `name` (required): The name of the project
- `label` (optional): The label of the project
- `description` (optional): The description of the project (HTML format)

**Example Request:**
```http
POST /api/rest/latest/projects HTTP/1.1
Content-Type: application/json
Accept: application/json
Host: localhost:8080

{
  "_type": "project",
  "name": "sample project",
  "label": "no price tag",
  "description": "<p>do something meaningful</p>"
}
```

**Example Response:**
```json
{
  "_type": "project",
  "id": 333,
  "description": "<p>do something meaningful</p>",
  "label": "no price tag",
  "name": "sample project",
  "attachments": [],
  "_links": {
    "self": {
      "href": "http://localhost:8080/api/rest/latest/projects/333"
    },
    "requirements": {
      "href": "http://localhost:8080/api/rest/latest/projects/333/requirements-library/content"
    },
    "test-cases": {
      "href": "http://localhost:8080/api/rest/latest/projects/333/test-cases-library/content"
    },
    "campaigns": {
      "href": "http://localhost:8080/api/rest/latest/projects/333/campaigns-library/content"
    }
  }
}
```

#### Create Project from Template

**Request Body:**
```json
{
  "_type": "project",
  "name": "sample project",
  "label": "no price tag",
  "description": "<p>do something meaningful</p>",
  "template_id": 23,
  "params": {
    "copy_permissions": true,
    "copy_cuf": true,
    "copy_bugtracker_binding": true,
    "copy_ai_server_binding": true,
    "copy_automated_projects": true,
    "copy_infolists": true,
    "copy_milestone": true,
    "copy_allow_tc_modif_from_exec": true,
    "copy_optional_exec_statuses": true,
    "copy_plugins_activation": true,
    "keep_template_binding": true,
    "copy_plugins_configuration": true,
    "keep_plugins_binding": true
  }
}
```

**Fields:**
- `_type` (required): Must be `"project"`
- `name` (required): The name of the project
- `label` (optional): The label of the project
- `description` (optional): The description of the project
- `template_id` (required): The ID of the project template to use
- `params` (optional): Configuration options for copying template attributes:
  - `copy_permissions`: Copy template's permissions
  - `copy_cuf`: Copy template's custom fields
  - `copy_bugtracker_binding`: Copy template's bugtracker configuration
  - `copy_ai_server_binding`: Link to template's AI server
  - `copy_automated_projects`: Copy template's test automation management
  - `copy_infolists`: Copy template's information lists
  - `copy_milestone`: Copy template's milestones
  - `copy_allow_tc_modif_from_exec`: Copy template's execution option
  - `copy_optional_exec_statuses`: Copy template's optional execution statuses
  - `copy_plugins_activation`: Copy template's plugins activation
  - `keep_template_binding`: Keep template binding (default: true)
  - `copy_plugins_configuration`: Copy template's plugins configuration
  - `keep_plugins_binding`: Tie to template's plugin configuration

#### Create Project Template

**Request Body:**
```json
{
  "_type": "project-template",
  "name": "sample project template",
  "label": "no price tag",
  "description": "<p>do something meaningful</p>"
}
```

**Fields:**
- `_type` (required): Must be `"project-template"`
- `name` (required): The name of the project template
- `label` (optional): The label of the project template
- `description` (optional): The description of the project template

**Example Response:**
```json
{
  "_type": "project-template",
  "id": 333,
  "description": "<p>do something meaningful</p>",
  "label": "no price tag",
  "name": "sample project template",
  "attachments": [],
  "_links": {
    "self": {
      "href": "http://localhost:8080/api/rest/latest/projects/333"
    },
    "requirements": {
      "href": "http://localhost:8080/api/rest/latest/projects/333/requirements-library/content"
    },
    "test-cases": {
      "href": "http://localhost:8080/api/rest/latest/projects/333/test-cases-library/content"
    },
    "campaigns": {
      "href": "http://localhost:8080/api/rest/latest/projects/333/campaigns-library/content"
    }
  }
}
```

#### Create Template from Existing Project

**Request Body:**
```json
{
  "_type": "project-template",
  "name": "sample project template",
  "label": "no price tag",
  "description": "<p>do something meaningful</p>",
  "project_id": 55,
  "params": {
    "copy_permissions": true,
    "copy_cuf": true,
    "copy_bugtracker_binding": true,
    "copy_automated_projects": true,
    "copy_ai_server_binding": true,
    "copy_optional_exec_statuses": true,
    "copy_plugins_activation": true,
    "copy_infolists": true,
    "copy_milestone": true,
    "copy_allow_tc_modif_from_exec": true,
    "copy_plugins_configuration": true
  }
}
```

**Fields:**
- `_type` (required): Must be `"project-template"`
- `name` (required): The name of the template
- `label` (optional): The label of the template
- `description` (optional): The description of the template
- `project_id` (required): The ID of the source project
- `params` (optional): Configuration options (similar to create project from template, but without `keep_template_binding` and `keep_plugins_binding`)

### GET /projects/{id}/clearances

Get clearances (permissions) grouped by profiles for a project.

**Path Parameters:**
- `id` (number): The ID of the project

**Query Parameters:**
- `fields` (optional): Which fields of the elements should be returned

**Example Request:**
```http
GET /api/rest/latest/projects/367/clearances HTTP/1.1
Accept: application/json
Host: localhost:8080
```

**Example Response:**
```json
{
  "content": {
    "test_runner": {
      "_type": "profile",
      "id": 6,
      "name": "TestRunner",
      "type": "system",
      "users": [
        {
          "_type": "team",
          "id": 567,
          "name": "Team A",
          "_links": {
            "self": {
              "href": "http://localhost:8080/api/rest/latest/teams/567"
            }
          }
        }
      ]
    },
    "test_designer": {
      "_type": "profile",
      "id": 7,
      "name": "TestDesigner",
      "type": "system",
      "users": [
        {
          "_type": "user",
          "id": 486,
          "login": "User-1",
          "_links": {
            "self": {
              "href": "http://localhost:8080/api/rest/latest/users/486"
            }
          }
        }
      ]
    },
    "custom_tester": {
      "_type": "profile",
      "id": 11,
      "name": "Custom Tester",
      "type": "custom",
      "users": [
        {
          "_type": "team",
          "id": 853,
          "name": "Team C",
          "_links": {
            "self": {
              "href": "http://localhost:8080/api/rest/latest/teams/853"
            }
          }
        }
      ]
    }
  },
  "_links": {
    "self": {
      "href": "http://localhost:8080/api/rest/latest/projects/367/clearances"
    }
  }
}
```

**Response Fields:**
- `content`: Object containing clearances grouped by profile keys
  - Each profile contains:
    - `_type`: Either `"profile"`
    - `id`: Profile ID
    - `name`: Profile name
    - `type`: Either `"system"` or `"custom"`
    - `users`: Array of users or teams with this profile

## Usage Examples

### List all standard projects

```typescript
const projects = await client.getAllProjects({ type: 'STANDARD' });
```

### Get project by name

```typescript
const project = await client.getProjectByName('My Project');
```

### Create a new project

```typescript
const newProject = await client.createProject({
  name: 'New Test Project',
  label: 'QA Project',
  description: '<p>Project for QA testing</p>'
});
```

### Create project from template

```typescript
const newProject = await client.createProjectFromTemplate({
  name: 'New Project from Template',
  template_id: 23,
  params: {
    copy_permissions: true,
    copy_cuf: true,
    copy_milestone: true
  }
});
```

### Get project permissions

```typescript
const clearances = await client.getProjectClearances(367);
```

## Notes

- Most project operations require administrator privileges
- Project and milestone names/labels are case-sensitive when used as query parameters
- The `milestoneId` and `milestoneLabel` parameters are mutually exclusive
- When creating projects from templates, the `keep_template_binding` defaults to `true`
- All `params` options default to `false` if not specified
