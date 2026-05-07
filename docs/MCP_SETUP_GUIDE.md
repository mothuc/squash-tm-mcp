# Squash TM MCP Agent - Claude Desktop Setup Guide

This guide will help you integrate the Squash TM MCP Agent with Claude Desktop so you can use MCP tools directly in your conversations.

## Prerequisites

- Claude Desktop installed
- Node.js installed (v20 or higher)
- Squash TM API credentials configured

## Setup Steps

### 1. Build the MCP Server

```bash
cd /home/thuc/Projects/squash-tm-mcp-agent
npm install
npm run build
```

### 2. Configure Claude Desktop

Edit your Claude Desktop MCP configuration file:

**Linux:** `~/.config/Claude/claude_desktop_config.json`

Add the following configuration:

```json
{
  "mcpServers": {
    "squash-tm": {
      "command": "node",
      "args": ["/home/thuc/Projects/squash-tm-mcp-agent/dist/index.js"],
      "env": {
        "SQUASH_TM_BASE_URL": "https://qa.dtn.com.vn/squash/api/rest/latest",
        "SQUASH_TM_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

**Note:** Replace `your-api-token-here` with your actual Squash TM API token from the `.env` file.

### 3. Restart Claude Desktop

After saving the configuration, completely quit and restart Claude Desktop for the changes to take effect.

### 4. Verify MCP Server is Running

In a new conversation in Claude Desktop, you should see the Squash TM MCP server in the list of available tools. You can ask Claude to:

- "Get all projects from Squash TM"
- "Show me project ID 7"
- "Sync this feature file to test case 2641"

## Available MCP Tools

The Squash TM MCP Agent provides these tools:

1. **get_all_projects** - Get all projects with optional filters
2. **get_project** - Get a specific project by ID
3. **get_project_by_name** - Get a project by name
4. **get_test_case** - Get test case details
5. **create_test_step** - Create a new test step
6. **update_test_step** - Update an existing test step
7. **delete_test_steps** - Delete test steps
8. **sync_feature_to_squash** - Sync Gherkin feature file to test case
9. **transmit_test_case** - Mark test case as transmitted
10. **create_project** - Create a new project
11. **create_project_from_template** - Create project from template
12. **get_project_clearances** - Get project permissions

## Example Usage

Once configured, you can use commands like:

```
Get all projects from Squash TM using the MCP agent
```

```
Sync the feature file at features/2641_Create_Pickup_order.feature to test case 2641
```

```
Get details for Milwaukee MY project
```

## Troubleshooting

### MCP Server Not Showing Up

1. Check that the path in `claude_desktop_config.json` is correct and absolute
2. Verify the build was successful: `ls /home/thuc/Projects/squash-tm-mcp-agent/dist/index.js`
3. Check Claude Desktop logs (usually in `~/.config/Claude/logs/`)
4. Ensure Node.js is accessible from the command line: `which node`

### Authentication Errors

1. Verify your API token is valid
2. Check the `SQUASH_TM_BASE_URL` is correct
3. Test credentials using the standalone script: `npm run get-all-projects`

### Permission Errors

Some tools require administrator privileges in Squash TM:
- `get_project` (by ID)
- `get_project_by_name`
- `create_project`
- `create_project_from_template`

Use `get_all_projects` instead, which works with regular user permissions.

## Notes

- Always rebuild (`npm run build`) after making code changes
- The MCP server runs in a separate process managed by Claude Desktop
- Changes to `.env` file require Claude Desktop restart to take effect
