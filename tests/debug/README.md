# Debug and Test Scripts

This directory contains debugging and testing scripts used during development of the Squash TM MCP Agent.

## Quick Reference

### Data Retrieval Scripts
- **get-dataset.js** - Fetch dataset information from Squash TM
- **get-testcase.js** - Retrieve test case details from Squash TM

### Dataset Testing Scripts
- **debug-dataset.js** - Debug dataset operations and data structures
- **test-dataset-approach.js** - Test different approaches to dataset management
- **test-patch-dataset.js** - Test PATCH operations on datasets
- **test-patch-dataset2.js** - Alternative PATCH operation tests
- **test-empty-value.js** - Test handling of empty/null values in datasets

### Parser Testing Scripts
- **debug-parser.js** - Debug Gherkin feature file parsing logic

### API Testing Scripts
- **test-backend-endpoint.js** - Test direct Squash TM API endpoints
- **test-exact-payload.js** - Test exact API request payloads
- **test-limit.js** - Test API rate limits and pagination

### Integration Testing Scripts
- **test-mcp.js** - Test MCP server integration
- **test-batch-debug.js** - Debug batch operations

## Usage

These scripts typically require environment variables to be set:

```bash
export SQUASH_TM_BASE_URL="https://your-instance/api/rest/latest"
export SQUASH_TM_API_TOKEN="your-api-token"

# Run a script
node tests/debug/get-testcase.js
```

## Notes

- These scripts are for development and debugging purposes only
- They are not part of the production codebase
- Some scripts may require modification before running
- Check individual script files for specific usage instructions
