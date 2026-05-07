# Squash TM MCP Agent

A Model Context Protocol (MCP) agent for interacting with Squash TM test management system. This agent allows AI assistants to create, update, and sync test cases with Squash TM.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Squash TM credentials

# 3. Build MCP server
npm run build

# 4. Add MCP server to Claude Code (easiest method)
claude mcp add squash-tm \
  --command "node" \
  --args "$(pwd)/dist/index.js" \
  --cwd "$(pwd)" \
  --env SQUASH_TM_BASE_URL=https://your-squash-instance.com/squash/api/rest/latest \
  --env SQUASH_TM_API_TOKEN=your-api-token-here

# 5. Restart Claude Code

# 6. Use MCP tools in Claude Code
# Example: "sync and transmit test 2314"
```

## Features

- **Sync Feature Files to Squash TM**: Automatically sync Gherkin feature files to Squash TM test cases
- **BDD Test Case Management**: Create, update, and delete BDD test cases with full Gherkin script support
- **Step Manipulation**: Add and update individual Gherkin steps in BDD test cases
- **Create/Update Test Steps**: Manage keyword steps (Given/When/Then) with datatables and comments
- **Dataset Management**: Sync Examples sections as datasets with parameters
- **Project Management**: List, create, and manage Squash TM projects and templates
- **Transmit Test Cases**: Mark test cases as transmitted in Squash TM
- **Multi-step Operations**: Handle complex test case updates with multiple steps

## Installation

```bash
npm install
```

## Configuration

### 1. Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your Squash TM credentials:
```env
SQUASH_TM_BASE_URL=https://your-squash-tm-instance/api/rest/latest
SQUASH_TM_API_TOKEN=your-api-token-here
```

### 2. MCP Server Setup for Claude Code

**Build the MCP Server:**
```bash
npm run build
```

**Option A: Using Claude CLI (Recommended - Easiest)**

```bash
# Add the MCP server using Claude CLI
claude mcp add squash-tm \
  --command "node" \
  --args "/absolute/path/to/squash-tm-mcp/dist/index.js" \
  --cwd "/absolute/path/to/squash-tm-mcp" \
  --env SQUASH_TM_BASE_URL=https://your-squash-instance.com/squash/api/rest/latest \
  --env SQUASH_TM_API_TOKEN=your-api-token-here

# Restart Claude Code
```

**Option B: Manual Configuration**

Create or edit `~/.config/Code/User/mcp.json` (Linux/Mac) or `%APPDATA%\Code\User\mcp.json` (Windows):
```json
{
  "servers": {
    "squash-tm": {
      "command": "node",
      "args": ["/absolute/path/to/squash-tm-mcp/dist/index.js"],
      "cwd": "/absolute/path/to/squash-tm-mcp",
      "env": {
        "SQUASH_TM_BASE_URL": "https://your-squash-instance.com/squash/api/rest/latest",
        "SQUASH_TM_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

**Note:** Replace `/absolute/path/to/squash-tm-mcp` with the actual absolute path where you cloned this repository.

**Activate MCP Tools:**
1. Build the server: `npm run build`
2. Restart Claude Code (VSCode)
3. MCP tools become available with prefix `mcp__squash-tm__*`

**Available MCP Tools:**
- `mcp__squash-tm__sync_feature_to_squash` - Sync feature file to test case
- `mcp__squash-tm__transmit_test_case` - Mark test case as transmitted
- `mcp__squash-tm__get_test_case` - Get test case details
- `mcp__squash-tm__create_test_step` - Create new step
- `mcp__squash-tm__update_test_step` - Update existing step
- `mcp__squash-tm__delete_test_steps` - Delete steps
- And more (see MCP Tools section below)

## MCP Tools Available

### 1. `sync_feature_to_squash`
Syncs a Gherkin feature file to a Squash TM test case.

**Parameters:**
- `featureFilePath` (string): Path to the .feature file
- `testCaseId` (number): Squash TM test case ID

**Example:**
```json
{
  "featureFilePath": "features/Order/2641_Create_Order.feature",
  "testCaseId": 2641
}
```

### 2. `transmit_test_case`
Marks a test case as transmitted in Squash TM.

**Parameters:**
- `testCaseId` (string): Squash TM test case ID

**Example:**
```json
{
  "testCaseId": "2641"
}
```

### 3. `get_test_case`
Retrieves test case details from Squash TM.

**Parameters:**
- `testCaseId` (number): Squash TM test case ID

**Example:**
```json
{
  "testCaseId": 2641
}
```

### 4. `create_test_step`
Creates a new keyword step in a Squash TM test case.

**Parameters:**
- `testCaseId` (number): Squash TM test case ID
- `keyword` (string): Step keyword (GIVEN, WHEN, THEN, AND, BUT)
- `action` (string): Step action/text
- `datatable` (string, optional): Datatable in pipe format
- `comment` (string, optional): Comment

### 5. `update_test_step`
Updates an existing keyword step in Squash TM.

**Parameters:**
- `stepId` (number): Squash TM step ID
- `keyword` (string): Step keyword
- `action` (string): Step action/text
- `datatable` (string, optional): Datatable in pipe format
- `comment` (string, optional): Comment

### 6. `delete_test_steps`
Deletes one or more test steps from Squash TM.

**Parameters:**
- `stepIds` (array of numbers): Array of step IDs to delete

---

## BDD Test Case Management Tools

### 7. `create_bdd_test_case`
Creates a new BDD (Behavior-Driven Development) test case with Gherkin script in Squash TM.

**Parameters:**
- `name` (string): Test case name
- `parentType` (string): Parent type ('project' or 'test-case-folder')
- `parentId` (number): Parent ID (project or folder ID)
- `script` (string): Gherkin script content
- `description` (string, optional): HTML description
- `prerequisite` (string, optional): HTML prerequisite
- `importance` (string, optional): Importance level ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH')
- `status` (string, optional): Status ('WORK_IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'OBSOLETE')

**Example:**
```json
{
  "name": "User Login Test",
  "parentType": "project",
  "parentId": 15,
  "script": "Feature: User Login\n  Scenario: Successful login\n    Given I am on the login page\n    When I enter valid credentials\n    Then I should be logged in",
  "importance": "HIGH",
  "status": "APPROVED"
}
```

### 8. `update_bdd_test_case`
Updates an existing BDD test case (script, name, description, etc.).

**Parameters:**
- `testCaseId` (number): Squash TM test case ID
- `script` (string, optional): Updated Gherkin script
- `name` (string, optional): Updated name
- `description` (string, optional): Updated description
- `prerequisite` (string, optional): Updated prerequisite
- `importance` (string, optional): Updated importance
- `status` (string, optional): Updated status

**Example:**
```json
{
  "testCaseId": 240,
  "script": "Feature: Updated login\n  Scenario: Login with 2FA\n    Given I am on the login page\n    When I enter credentials\n    And I enter 2FA code\n    Then I should be logged in",
  "status": "UNDER_REVIEW"
}
```

### 9. `delete_test_case`
Deletes a test case from Squash TM by ID.

**Parameters:**
- `testCaseId` (number): Squash TM test case ID to delete

**Example:**
```json
{
  "testCaseId": 240
}
```

### 10. `add_step_to_bdd_test_case`
Adds a Gherkin step (Given/When/Then/And/But) to an existing BDD test case. The step is appended to the scenario before any Examples sections.

**Parameters:**
- `testCaseId` (number): Squash TM test case ID
- `keyword` (string): Step keyword ('Given', 'When', 'Then', 'And', 'But')
- `text` (string): Step text
- `position` (string|number, optional): Position to insert step ('end' or line number, defaults to 'end')

**Example:**
```json
{
  "testCaseId": 240,
  "keyword": "And",
  "text": "I verify the dashboard is displayed"
}
```

### 11. `update_step_in_bdd_test_case`
Updates a specific step in a BDD test case by step index (0-based).

**Parameters:**
- `testCaseId` (number): Squash TM test case ID
- `stepIndex` (number): Step index (0-based) to update
- `keyword` (string, optional): Updated keyword
- `text` (string, optional): Updated step text

**Example:**
```json
{
  "testCaseId": 240,
  "stepIndex": 2,
  "keyword": "Then",
  "text": "I should see a success message"
}
```

**Note:** For BDD test cases, steps are managed through the Gherkin script. The step index refers to the position of Given/When/Then/And/But lines in the script.

---

### 12. `get_all_projects`
Get all projects (standard and/or templates) with optional filtering.

**Parameters:**
- `page` (number, optional): Page number (default: 0)
- `size` (number, optional): Page size (default: 20)
- `type` (string, optional): Filter by type ('STANDARD' or 'TEMPLATE')
- `milestoneId` (number, optional): Filter by milestone ID
- `milestoneLabel` (string, optional): Filter by milestone label

**Example:**
```json
{
  "type": "STANDARD",
  "page": 0,
  "size": 20
}
```

### 8. `get_project`
Get a specific project by ID (requires administrator privileges).

**Parameters:**
- `projectId` (number): Squash TM project ID

### 9. `get_project_by_name`
Get a project by name (requires administrator privileges, case-sensitive).

**Parameters:**
- `projectName` (string): Name of the project

### 10. `create_project`
Create a new standard project in Squash TM.

**Parameters:**
- `name` (string): Project name
- `label` (string, optional): Project label
- `description` (string, optional): Project description (HTML format)

**Example:**
```json
{
  "name": "My New Project",
  "label": "QA Testing",
  "description": "<p>Project for QA testing</p>"
}
```

### 11. `create_project_from_template`
Create a new project from a project template.

**Parameters:**
- `name` (string): Project name
- `template_id` (number): ID of the project template
- `label` (string, optional): Project label
- `description` (string, optional): Project description
- `params` (object, optional): Copy options (e.g., copy_permissions, copy_cuf, etc.)

**Example:**
```json
{
  "name": "New Project from Template",
  "template_id": 23,
  "params": {
    "copy_permissions": true,
    "copy_cuf": true,
    "copy_milestone": true
  }
}
```

### 12. `get_project_clearances`
Get clearances (permissions) grouped by profiles for a project.

**Parameters:**
- `projectId` (number): Squash TM project ID

## Usage

### Typical Workflow

**1. Using MCP Tools (Recommended - Integrated with Claude Code):**

```typescript
// After MCP server is configured and Claude Code is restarted:

// Sync feature file to Squash TM
mcp__squash-tm__sync_feature_to_squash({
  featureFilePath: "features/Homepage/2314_Cookies_product_page.feature",
  testCaseId: 2314
})

// Transmit test case to mark as ready
mcp__squash-tm__transmit_test_case({
  testCaseId: "2314"
})
```

**2. Using Standalone Scripts (Alternative):**

```bash
# From your test project directory:
# Sync feature file (using global MCP agent)
npx tsx /path/to/squash-tm-mcp/scripts/syncSquashTM.ts \
  features/Homepage/2314_Cookies_product_page.feature \
  2314

# Transmit test case
cd /path/to/squash-tm-mcp && npm run transmit 2314
```

**3. Test Case ID Pattern:**

Feature files should follow naming convention: `{test-case-id}_{description}.feature`

Example: `2314_Cookies_product_page.feature` → Test Case ID: **2314**

### Quick Commands

**Sync Feature File:**
```bash
npm run sync features/Order/2641_Create_Order.feature 2641
```

**Transmit Test Case:**
```bash
npm run transmit 2641
```

## MCP Server Usage

Start the MCP server:
```bash
npm run dev
```

The server will expose tools that AI assistants can use to interact with Squash TM.

## Architecture

```
squash-tm-mcp-agent/
├── src/
│   ├── clients/           # Modular API client library
│   │   ├── BaseClient.ts          # Base class with auth
│   │   ├── TestCaseClient.ts      # Test case operations
│   │   ├── TestStepClient.ts      # Test step operations
│   │   ├── DatasetClient.ts       # Dataset operations
│   │   ├── AutomationClient.ts    # Transmit operations
│   │   ├── ParserClient.ts        # Gherkin parsing
│   │   ├── SquashTMClient.ts      # Unified client
│   │   ├── index.ts               # Public exports
│   │   └── README.md              # Client documentation
│   ├── index.ts           # MCP server implementation
│   └── types.ts           # TypeScript interfaces
├── syncSquashTM.ts        # Standalone sync script
├── transmitTestCase.ts    # Standalone transmit script
├── CLAUDE.md              # Development guide
├── package.json
└── README.md
```

## How It Works

1. **Gherkin Parsing**: Reads .feature files and extracts steps, datatables, and Examples
2. **API Integration**: Uses Squash TM REST API with Bearer token or Basic Auth
3. **Smart Sync**:
   - Compares local steps with remote steps
   - Deletes extra steps
   - Updates changed steps
   - Creates new steps
4. **Dataset Sync**: Maps Examples sections to Squash TM datasets

## Example Feature File Format

```gherkin
Feature: Create Order

  Scenario Outline: Create pickup order
    Given Admin login with credentials
    When Admin create pickup order with product "<sku>"
    Then Order should be created successfully

    @dataset1
    Examples:
      | sku        |
      | 48-22-6106 |
      | M18-FUEL   |
```

## Error Handling

- Authentication errors: Check `SQUASH_TM_API_TOKEN` or credentials
- 404 errors: Verify test case ID exists in Squash TM
- 412 errors: Dataset name conflicts (use unique names or update logic)

## Troubleshooting

### MCP Tools Not Available in Claude Code

**Problem:** MCP tools with prefix `mcp__squash-tm__*` are not showing up in Claude Code.

**Solution:**
1. Try using the Claude CLI to add the server (easiest):
   ```bash
   claude mcp add squash-tm --command "node" --args "$(pwd)/dist/index.js" --cwd "$(pwd)"
   ```
2. Verify MCP config exists: `cat ~/.config/Code/User/mcp.json`
3. Check the server path is absolute: `/absolute/path/to/squash-tm-mcp/dist/index.js`
4. Ensure the server is built: `cd /path/to/squash-tm-mcp && npm run build`
5. Restart Claude Code completely (close all windows and reopen)
6. Check VSCode Developer Tools (Help → Toggle Developer Tools) for MCP errors

### Transmit Operation Fails with "fetch failed"

**Problem:** `mcp__squash-tm__transmit_test_case` returns MCP error -32603: fetch failed

**Solution:**
1. Verify the test case exists in Squash TM
2. Check your API token has proper permissions
3. Try the standalone script: `cd /path/to/squash-tm-mcp && npm run transmit <test-case-id>`
4. If standalone works but MCP fails, restart Claude Code
5. Check network connectivity to Squash TM instance

### Sync Operation Updates Wrong Steps

**Problem:** Sync creates duplicate steps or updates wrong test case.

**Solution:**
1. Verify test case ID matches the filename: `2314_*.feature` → ID 2314
2. Check the feature file is valid Gherkin (proper indentation and syntax)
3. Manually verify test case in Squash TM before syncing
4. Use `get_test_case` MCP tool to inspect current state first

### Authentication Issues

**Problem:** API returns 401 Unauthorized or 403 Forbidden.

**Solution:**
1. Regenerate API token in Squash TM (User Settings → Access Tokens)
2. Update token in both:
   - `.env` file: `SQUASH_TM_API_TOKEN=...`
   - MCP config: `~/.config/Code/User/mcp.json`
3. Rebuild and restart: `npm run build` then restart Claude Code
4. Test with curl:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        https://your-squash-instance.com/squash/api/rest/latest/test-cases/2314
   ```

## Contributing

When adding new features:
1. Update TypeScript interfaces in `src/types.ts`
2. Add new tools to MCP server in `src/index.ts`
3. Document the new tools in this README
4. Update `AGENTS.md` with usage examples

## License

MIT
