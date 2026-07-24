# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Read Lessons First

**BEFORE starting any task, ALWAYS read [tasks/lessons.md](tasks/lessons.md) for important patterns and mistakes to avoid.**

This file contains:
- Common mistakes and their solutions
- Correct patterns for creating test cases
- API usage examples
- Root cause analysis of past errors

## Project Overview

This is an MCP (Model Context Protocol) agent that integrates with Squash TM test management system. It allows AI assistants to sync Gherkin feature files to Squash TM test cases, managing BDD-style test steps, datatables, datasets, and parameters through the Squash TM REST API.

## Development Commands

### Essential Commands
```bash
# Install dependencies and setup
npm install

# Build TypeScript to JavaScript
npm run build

# Run MCP server in development mode (for Claude Desktop integration)
npm run dev

# Run production MCP server (after build)
npm start
```

### Standalone Script Commands
```bash
# Sync a feature file to Squash TM test case (by test ID only)
npm run sync <testCaseId>

# Example: Syncs feature file matching pattern 2641_*.feature to test case 2641
npm run sync 2641

# Mark test case as transmitted (requires web session)
npm run transmit <testCaseId>
```

**Feature File Naming Convention**:
- Feature files must follow the pattern: `<testId>_<testcasename>_....feature`
- The test ID (prefix before first underscore) is used to match the Squash TM test case ID
- The sync script uses `find . -type f -name '<testId>_*.feature'` to locate the file
- Example: `2641_Create_Pickup_order.feature` → Test ID: 2641

## Architecture

### Core Components

**MCP Server Layer** ([src/index.ts](src/index.ts))
- Implements MCP protocol server using `@modelcontextprotocol/sdk`
- Exposes 6 tools: `sync_feature_to_squash`, `get_test_case`, `create_test_step`, `update_test_step`, `delete_test_steps`, `transmit_test_case`
- Handles tool invocation routing and error handling
- Main sync logic in `syncFeatureToSquashTM()` function

**Squash TM Client Library** ([src/clients/](src/clients/))
- Modular client architecture organized by API categories
- See [src/clients/README.md](src/clients/README.md) for detailed documentation
- **Client Modules**:
  - `BaseClient` - Authentication and common HTTP methods
  - `TestCaseClient` - Test case operations (get, create, modify, delete)
  - `TestStepClient` - Test step operations (get, create, modify, delete)
  - `DatasetClient` - Dataset and parameter operations
  - `AutomationClient` - Automation and transmit operations
  - `ParserClient` - Gherkin feature file parsing
  - `SquashTMClient` - Unified client combining all modules (use this one)
- Supports both Bearer token (`SQUASH_TM_API_TOKEN`) and Basic Auth (`SQUASH_TM_USERNAME`/`SQUASH_TM_PASSWORD`)
- Uses native `fetch()` for HTTP requests

**Type Definitions** ([src/types.ts](src/types.ts))
- `GherkinStep`: Local feature file representation
- `SquashStep`: Remote Squash TM step representation
- `TestCase`, `Dataset`: Squash TM API response types
- `SyncResult`: Sync operation result with stats

### Sync Algorithm

The sync process in `syncFeatureToSquashTM()` uses a 4-phase approach:

1. **Parse & Compare**: Parse Gherkin steps and fetch remote Squash steps, compare by index position
2. **Delete Extra**: If remote has more steps than local, delete extra steps
3. **Update/Create**: For each local step, either update existing step (if changed) or create new step (if index beyond remote length)
4. **Dataset Sync**: Sync Examples sections to Squash TM datasets
   - **Auto-create missing parameters**: If feature file contains new parameter names not in Squash TM, they are automatically created
   - **Update existing datasets**: If dataset name exists, update parameter values (supports batching for >7 parameters)
   - **Create new datasets**: If dataset name doesn't exist, create new dataset with all parameters

**Key Behaviors**:
- Steps are matched by array index, not by content. Changing step order will update all subsequent steps.
- **Parameters are auto-created**: Feature file is the source of truth. New parameters in Examples sections are automatically created in Squash TM.
- Dataset sync always succeeds, even with completely new parameter sets.

### Authentication Flow

1. Constructor checks for `SQUASH_TM_API_TOKEN` (preferred)
2. Falls back to `SQUASH_TM_USERNAME` + `SQUASH_TM_PASSWORD` for Basic Auth
3. Throws error if neither is configured
4. Auth header is set once and reused for all requests

## Configuration

Required environment variables in `.env`:
```env
SQUASH_TM_BASE_URL=https://your-instance/api/rest/latest
SQUASH_TM_API_TOKEN=your-api-token

# OR use Basic Auth instead:
# SQUASH_TM_USERNAME=username
# SQUASH_TM_PASSWORD=password
```

## Gherkin Parsing Details

**Step Detection**:
- Recognizes keywords: `Given`, `When`, `Then`, `And`, `But` (case-insensitive)
- Only parses steps within `Scenario:` or `Scenario Outline:` blocks
- Stops at `Examples:` or `@` tags

**Datatable Parsing**:
- Lines starting with `|` immediately after a step
- Joined with newlines: `|col1|col2|\n|val1|val2|`

**Comment Parsing**:
- Lines starting with `#` after step, before datatable
- Multiple comment lines are joined with newlines

**Dataset Parsing**:
- Triggered by `@tag` immediately before `Examples:` block
- Tag becomes dataset name
- First row with `|` is headers (parameter names)
- Subsequent rows are dataset values
- Values wrapped in quotes are unwrapped

## MCP Integration

### Claude Desktop Setup

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "squash-tm": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"],
      "env": {
        "SQUASH_TM_BASE_URL": "https://...",
        "SQUASH_TM_API_TOKEN": "..."
      }
    }
  }
}
```

Remember to `npm run build` before first use and after code changes.

## Squash TM API Documentation

### Accessing API Documentation

The Squash TM REST API documentation is available at:
```
https://your-squash-instance/squash/api/rest/latest/docs/api-documentation.html
```

**For DTN QA instance**:
```
https://qa.dtn.com.vn/squash/api/rest/latest/docs/api-documentation.html
```

### Finding API Endpoints

**Preferred: local text cache + `rg`**

The doc is a single ~1.7MB HTML page (~600KB / ~25k lines once stripped to plain
text) — too large to read in full each time, but perfect for `rg` once cached
locally as text.

```bash
# Fetch + cache as plain text (run once, or re-run to refresh):
node scripts/fetch-api-docs.js
# -> .cache/api-documentation.txt (gitignored)

# Then search by endpoint/section name, with context lines:
rg -n -i -A 20 "delete clearances for user" .cache/api-documentation.txt
rg -n -i -A 20 "get iteration" .cache/api-documentation.txt
```

This avoids re-fetching/re-rendering the page per lookup and doesn't depend on
a browser session.

**Fallback: Puppeteer MCP** — only needed if the docs page requires a live
browser session (e.g. auth-gated instance) that plain `curl`/`fetch` can't
reach:

```javascript
await mcp__puppeteer__puppeteer_navigate({
  url: "https://qa.dtn.com.vn/squash/api/rest/latest/docs/api-documentation.html"
});
await mcp__puppeteer__puppeteer_evaluate({
  script: `document.body.innerText`
});
```

### Known API Endpoints

**Campaigns**:
- `GET /api/rest/latest/campaigns/{id}` - Get campaign by ID
- `GET /api/rest/latest/campaigns/{id}/iterations` - Get all iterations of a campaign
- `POST /api/rest/latest/campaigns` - Create campaign

**Iterations**:
- `GET /api/rest/latest/iterations/{id}` - Get iteration by ID
- `POST /api/rest/latest/campaigns/{campaignId}/iterations` - Create new iteration

**Test Cases**:
- `GET /api/rest/latest/test-cases/{id}` - Get test case by ID
- `GET /api/rest/latest/test-cases/{id}/steps` - Get test steps
- `POST /api/rest/latest/test-cases` - Create test case
- `POST /api/rest/latest/test-cases/{id}/steps` - Create test step

**Datasets & Parameters**:
- `GET /api/rest/latest/test-cases/{id}/datasets` - Get datasets for test case
- `POST /api/rest/latest/test-cases/{id}/datasets` - Create dataset
- `POST /api/rest/latest/test-cases/{id}/parameters` - Create parameter

**Projects**:
- `GET /api/rest/latest/projects` - Get all projects
- `GET /api/rest/latest/projects/{id}` - Get project by ID
- `POST /api/rest/latest/projects` - Create project

See the live API documentation for complete endpoint list and examples.

## Common Gotchas

1. **Step Order Matters**: Sync compares by position, not content. Reordering steps will trigger updates on all affected indices
2. **Transmit Tool Limitation**: `transmit_test_case` requires web session cookies, use standalone script instead
3. **Module System**: Project uses ES modules (`"type": "module"`), all imports must include `.js` extension even for `.ts` files
4. **API Version**: Ensure `SQUASH_TM_BASE_URL` ends with `/api/rest/latest` or specific version like `/api/rest/v1.0`
5. **Parameter Auto-creation**: New parameters in feature files are automatically created in Squash TM during sync - no manual setup needed
6. **Dataset Deletion**: Script ALWAYS deletes datasets in Squash TM that don't exist in local feature file, even if local has zero datasets. This ensures Squash TM stays in sync with local test files.

## Important Fixes & Lessons

### Dataset Deletion Bug (Fixed 2026-04-15)

**Problem**:
- Original code only checked/deleted datasets when `datasets.length > 0`
- If local feature file had NO datasets (Scenario instead of Scenario Outline), script would NOT delete old datasets in Squash TM
- This caused Squash TM to have stale datasets that were no longer in local tests

**Root Cause**:
```typescript
// ❌ WRONG - Only runs when local has datasets
if (datasets.length > 0) {
  // Delete datasets not in local
  // Create/update datasets
}
```

**Fix Applied**:
```typescript
// ✅ CORRECT - ALWAYS check and delete first
// ALWAYS check and delete extra datasets in Squash TM (even if local has no datasets)
let testCase = await getTestCase(testCaseId);
const datasetsToDelete = testCase.datasets?.filter(...) || [];
if (datasetsToDelete.length > 0) {
  // Delete datasets
}

// THEN sync new datasets if local has any
if (datasets.length > 0) {
  // Create/update datasets
}
```

**Pattern to Remember**:
- **Source of truth**: Local feature files (after passing tests)
- **Sync direction**: Local → Squash TM (not bidirectional)
- **Deletion rule**: ALWAYS delete extra items in Squash TM first, THEN create/update new ones
- **Zero datasets is valid**: If local test doesn't need datasets, Squash TM shouldn't have them either

**Location**: [scripts/syncSquashTM.ts:526-607](scripts/syncSquashTM.ts)

## Extending the Agent

### Adding New MCP Tools

1. Add tool definition in `server.setRequestHandler(ListToolsRequestSchema, ...)` in [src/index.ts](src/index.ts)
2. Add case handler in `server.setRequestHandler(CallToolRequestSchema, ...)` switch statement
3. Implement method in appropriate client module (see next section)
4. Add TypeScript interfaces to [src/types.ts](src/types.ts) if new data structures needed
5. Update [README.md](README.md) with tool documentation

### Adding New API Methods

**For existing API categories** (test cases, steps, datasets, automation):

1. Add method to the appropriate specialized client in [src/clients/](src/clients/)
   - Test cases → [TestCaseClient.ts](src/clients/TestCaseClient.ts)
   - Test steps → [TestStepClient.ts](src/clients/TestStepClient.ts)
   - Datasets → [DatasetClient.ts](src/clients/DatasetClient.ts)
   - Automation → [AutomationClient.ts](src/clients/AutomationClient.ts)
2. Use `this.makeRequest()` helper for consistent auth and headers
3. Add error handling for non-OK responses
4. Expose the method in [SquashTMClient.ts](src/clients/SquashTMClient.ts) for unified access
5. Define return type interfaces in [src/types.ts](src/types.ts)

**For new API categories** (e.g., Requirements, Projects, Milestones):

1. Create new client class extending `BaseClient` in [src/clients/](src/clients/)
2. Implement methods using `this.makeRequest()` and `this.baseURL`
3. Add client to [SquashTMClient.ts](src/clients/SquashTMClient.ts) constructor and expose methods
4. Export from [src/clients/index.ts](src/clients/index.ts)
5. See [src/clients/README.md](src/clients/README.md) for detailed examples
