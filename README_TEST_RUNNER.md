# Squash TM Iteration Test Runner

Team-friendly way to run Squash TM iteration tests locally.

## Setup in Your Test Project

Add these scripts to your test project's `package.json`:

```json
{
  "scripts": {
    "test:iteration": "node -e \"require('child_process').execSync('npx tsx ' + (process.env.SQUASH_MCP_PATH || '~/Projects/squash-tm-mcp-agent') + '/scripts/runIteration.ts ' + process.argv.slice(1).join(' '), {stdio: 'inherit'})\"",
    "test:smoke": "npm run test:iteration 167"
  }
}
```

Or simply add this one-liner to your `package.json` scripts:

```json
"test:iteration": "curl -s https://raw.githubusercontent.com/your-org/squash-tm-mcp-agent/main/scripts/runIteration.ts | npx tsx -- $@ || npx tsx ~/Projects/squash-tm-mcp-agent/scripts/runIteration.ts $@"
```

## Better Approach: Add as Project Dependency

### Option 1: Copy script to test project

```bash
# In your test project
mkdir -p scripts
cp ~/Projects/squash-tm-mcp-agent/scripts/runIteration.ts scripts/

# Add to package.json
"scripts": {
  "test:iteration": "npx tsx scripts/runIteration.ts",
  "test:smoke": "npm run test:iteration 167"
}
```

### Option 2: Git submodule (recommended for teams)

```bash
# In your test project
git submodule add <squash-mcp-repo-url> .squash-mcp

# Add to package.json
"scripts": {
  "test:iteration": "npx tsx .squash-mcp/scripts/runIteration.ts",
  "test:smoke": "npm run test:iteration 167"
}
```

## Usage

```bash
# Run iteration 167 (smoke tests)
npm run test:smoke

# Run any iteration
npm run test:iteration 167
npm run test:iteration 167 ui
npm run test:iteration 167 headed

# Custom iteration
npm run test:iteration 200 ui
```

## Environment Variables

Ensure these are set in your `.env`:

```env
SQUASH_TM_BASE_URL=https://qa.dtn.com.vn/squash/api/rest/latest
SQUASH_TM_API_TOKEN=your-token
```
