# Squash TM MCP Agent - Quick Start Guide

## What is this?

An MCP (Model Context Protocol) agent that allows AI assistants like Claude to interact with Squash TM test management system. You can chat with the AI to create, update, and sync test cases.

## Quick Setup (5 minutes)

### 1. Install dependencies
```bash
cd squash-tm-mcp-agent
npm install
```

### 2. Configure credentials
```bash
cp .env.example .env
```

Edit `.env` and add your Squash TM credentials:
```env
SQUASH_TM_BASE_URL=https://your-squash-tm.com/api/rest/latest
SQUASH_TM_API_TOKEN=your-token-here
```

### 3. Test it works (standalone mode)
```bash
# Sync a feature file to test case 2641
npm run sync features/Order/2641_Create_Order.feature 2641

# Transmit a test case
npm run transmit 2641
```

## Using with Claude Desktop (MCP Mode)

### 1. Add to Claude Desktop config

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or equivalent:

```json
{
  "mcpServers": {
    "squash-tm": {
      "command": "node",
      "args": ["/path/to/squash-tm-mcp-agent/dist/index.js"],
      "env": {
        "SQUASH_TM_BASE_URL": "https://your-squash-tm.com/api/rest/latest",
        "SQUASH_TM_API_TOKEN": "your-token-here"
      }
    }
  }
}
```

### 2. Build the agent
```bash
npm run build
```

### 3. Restart Claude Desktop

### 4. Chat with Claude
Now you can ask Claude to:
- "Sync the feature file at features/Order/2641.feature to test case 2641"
- "Get details of test case 2641"
- "Create a new Given step in test case 2641"
- "Update step 123 in Squash TM"

## Example Conversations

### Sync a feature file
```
You: Sync features/Checkout/1234_Payment.feature to test case 1234

Claude: I'll sync that feature file to Squash TM test case 1234.
[Uses sync_feature_to_squash tool]
Done! Synced 8 steps (created 2, updated 3, deleted 1).
```

### Create new test steps
```
You: Add a new step to test case 2641: "Given user is on homepage"

Claude: I'll add that step to test case 2641.
[Uses create_test_step tool]
Step created successfully with ID 12345.
```

### Get test case info
```
You: What are the steps in test case 2641?

Claude: Let me fetch that information.
[Uses get_test_case tool]
Test case 2641 "Create Pickup Order" has 12 steps:
1. GIVEN Admin login with credentials
2. WHEN Admin create pickup order...
...
```

## File Structure

```
squash-tm-mcp-agent/
├── src/
│   ├── index.ts           # MCP server (use with Claude Desktop)
│   ├── squashClient.ts    # Squash TM API client
│   └── types.ts           # TypeScript types
├── syncSquashTM.ts        # Standalone sync script
├── transmitTestCase.ts    # Standalone transmit script
├── AGENTS.md              # Original agent documentation
└── README.md              # Full documentation
```

## Available MCP Tools

When using with Claude, these tools are automatically available:

1. **sync_feature_to_squash** - Sync .feature file to test case
2. **get_test_case** - Get test case details
3. **create_test_step** - Add new step
4. **update_test_step** - Modify existing step
5. **delete_test_steps** - Remove steps
6. **transmit_test_case** - Mark as transmitted (needs web session)

## Troubleshooting

### "Authentication failed"
- Check `SQUASH_TM_API_TOKEN` in `.env`
- Verify `SQUASH_TM_BASE_URL` ends with `/api/rest/latest`

### "Test case not found"
- Verify test case ID exists in Squash TM
- Check you have permissions to access it

### Claude doesn't see the tools
- Make sure you ran `npm run build`
- Check Claude Desktop config path is correct
- Restart Claude Desktop after config changes

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [AGENTS.md](AGENTS.md) for coding patterns
- See example feature files in the original project
- Explore the Squash TM API at your instance's `/api/rest/latest` endpoint

## Support

For issues or questions:
1. Check the README.md
2. Review AGENTS.md for implementation details
3. Test with standalone scripts first (npm run sync/transmit)
4. Verify credentials and network access to Squash TM
