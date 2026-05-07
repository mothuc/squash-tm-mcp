# Lessons Learned - Squash TM MCP Agent

## Creating BDD Test Cases in Squash TM - 2026-04-16

**Context:**
User wanted to add a Gherkin feature to Squash TM project, but the initial approach created a `scripted-test-case` (Gherkin script format) instead of `keyword-test-case` (BDD keyword steps format).

**Mistake:**
Used `create_bdd_test_case` MCP tool which creates `scripted-test-case` type with full Gherkin script in the `script` field. This shows as a text script in Squash TM UI, not individual keyword steps.

**Root Cause:**
- Confused two different test case types in Squash TM:
  1. **`scripted-test-case`**: Stores full Gherkin script as text (created by `create_bdd_test_case` tool)
  2. **`keyword-test-case`**: Stores individual Given/When/Then steps as separate entities (created by generic `createTestCase` + `create_test_step` tools)

**Correct Pattern:**

❌ **WRONG - Creates Gherkin script format:**
```typescript
mcp__squash-tm__create_bdd_test_case({
  name: "Test name",
  parentType: "project",
  parentId: 6,
  script: "Feature: ...\n  Scenario: ...\n    Given ..."
})
```

✅ **CORRECT - Creates BDD keyword steps format:**
```bash
# Step 1: Create keyword test case (empty)
node -e "
import('./dist/clients/index.js').then(async ({ SquashTMClient }) => {
  const client = new SquashTMClient();
  const testCase = await client.createTestCase({
    _type: 'keyword-test-case',
    name: 'Test name',
    parent: { _type: 'project', id: 6 },
    importance: 'VERY_HIGH',
    status: 'WORK_IN_PROGRESS',
    automated_test_technology: 'Playwright'
  });
  console.log('Created test case:', testCase.id);
}).catch(err => console.error('Error:', err.message));
"

# Step 2: Add individual keyword steps
mcp__squash-tm__create_test_step({
  testCaseId: <id>,
  keyword: "GIVEN",
  action: "Go to homepage"
})

mcp__squash-tm__create_test_step({
  testCaseId: <id>,
  keyword: "THEN",
  action: "Banner should be visible"
})

# Repeat for each step...
```

**Key Differences:**

| Feature | `scripted-test-case` | `keyword-test-case` |
|---------|---------------------|---------------------|
| Format | Full Gherkin script text | Individual keyword steps |
| Created via | `create_bdd_test_case` MCP tool | `createTestCase` + `create_test_step` |
| `_type` | `"scripted-test-case"` | `"keyword-test-case"` |
| Steps storage | Single `script` field | Array of `keyword-step` entities |
| UI display | Text editor with Gherkin | Individual step rows |
| Sync support | Supported by `sync_feature_to_squash` | Supported by `sync_feature_to_squash` |

**Rule for Future:**
1. **When user provides Gherkin feature and wants BDD keyword format:**
   - Use `createTestCase` with `_type: 'keyword-test-case'`
   - Add each step individually using `create_test_step`

2. **When user provides Gherkin feature and wants script format:**
   - Use `create_bdd_test_case` with full script

3. **Always ask user which format they prefer if unclear**

4. **To verify correct format:**
   - Check `_type` field: should be `"keyword-test-case"` for BDD steps
   - Check `steps` array: should contain individual `keyword-step` objects, not empty

**Reference Test Case:**
- Test case 3831 in project 6 (Milwaukee KR) is a good example of correct `keyword-test-case` format
- Test case 5060 in project 6 was created correctly following this pattern

**Working Code Pattern:**
See test case creation in this conversation where we:
1. Inspected test case 3831 to learn the correct structure
2. Created test case 5060 with `_type: 'keyword-test-case'`
3. Added 8 keyword steps successfully

---

## Batch Creating Test Cases from Feature Files - 2026-04-16

**Context:**
User had 12 feature files in a directory and wanted to create new test cases in Squash TM project 6, ignoring the ID prefixes in filenames (those were from another project).

**Task:**
Create brand new test cases in project 6 (Milwaukee KR) from feature files in `/home/thuc/Projects/mwkkr-squash-tests/features/temp/1__Storefront`

**Challenge:**
- Feature files had ID prefixes like `5012_`, `5009_`, etc. from old project
- Those test case IDs already existed in Squash TM
- User wanted **new** test cases, not to update existing ones

**Solution Approach:**

### 1. Split into Two Batches

**Batch 1: Simple test cases (no datasets)**
- Create test case shell with Node.js client
- Use sync script to add steps from feature file

**Batch 2: Test cases with Scenario Outline (with datasets)**
- Create test case shell with Node.js client
- Use sync script to add steps AND create datasets/parameters automatically

### 2. Execution Pattern

```bash
# Step 1: Create test case shell (gets auto-generated ID)
node -e "
import('./dist/clients/index.js').then(async ({ SquashTMClient }) => {
  const client = new SquashTMClient();
  const testCase = await client.createTestCase({
    _type: 'keyword-test-case',
    name: 'Test name from feature file',
    parent: { _type: 'project', id: 6 },
    importance: 'VERY_HIGH',
    status: 'WORK_IN_PROGRESS',
    automated_test_technology: 'Playwright'
  });
  console.log('Created test case ID:', testCase.id); // e.g., 5068
}).catch(err => console.error('Error:', err.message));
"

# Step 2: Sync steps and datasets from feature file to new test case
npx tsx scripts/syncSquashTM.ts /path/to/feature/file.feature <new-test-case-id>
```

### 3. Results

Created 11 new test cases in project 6:
- **5061-5067**: Simple test cases (7 tests)
- **5068-5071**: Test cases with datasets (4 tests)

**Test cases with datasets:**
- 5068: Search - Quick search (1 dataset "query", 2 parameters)
- 5069: Search - Navigate to product page (1 dataset "query", 2 parameters)
- 5070: Search - Incomplete search (1 dataset "query", 1 parameter)
- 5071: Category - Product information (4 datasets, 1 parameter)

### Key Learnings

**1. Ignore filename ID prefixes when creating new tests**
- Filename `5012_Test.feature` doesn't mean you must use test case ID 5012
- Create new test case, get auto-generated ID, then sync

**2. Sync script handles everything**
- Creates steps in correct order
- Auto-creates missing parameters
- Creates datasets with proper parameter mappings
- Handles both simple scenarios and scenario outlines

**3. Best pattern for batch creation:**
```bash
# Create test case first (get new ID)
# Then sync feature file to that ID
# This avoids conflicts with existing test case IDs
```

**4. Verification command:**
```javascript
node -e "
import('./dist/clients/index.js').then(async ({ SquashTMClient }) => {
  const client = new SquashTMClient();
  const tc = await client.getTestCase(5068);
  console.log('Steps:', tc.steps?.length);
  console.log('Datasets:', tc.datasets?.length);
  console.log('Parameters:', tc.parameters?.length);
});
"
```

**Rule for Future:**
- **When creating tests from feature files with existing IDs elsewhere:**
  1. Create empty keyword-test-case shell first (gets new auto ID)
  2. Use sync script with feature file path + new test case ID
  3. Sync script handles steps, datasets, and parameters automatically

- **Don't try to match filename ID prefixes** - those are just descriptive
- **Let Squash TM auto-generate IDs** for new test cases

---

## Create vs Sync Workflow Pattern - 2026-04-17

**Context:**
There are two distinct workflows when working with Gherkin feature files and Squash TM test cases. Understanding the difference prevents confusion about when to extract test IDs from filenames.

### Workflow 1: Create New Test Case

**User Request Patterns:**
- "Create new test with feature file X"
- "Add test case from this feature file"
- "Create test in project 6 with feature..."

**Workflow:**
```bash
# 1. Read feature file content
Read /path/to/feature/file.feature

# 2. Create BDD test case in Squash TM (NO test ID needed)
mcp__squash-tm__create_bdd_test_case({
  name: "Test name from feature",
  parentType: "project",
  parentId: 6,
  script: "<full feature content>"
})

# 3. Result: New test case ID assigned by Squash TM (e.g., 5093)
```

**Key Points:**
- ✅ Just read feature content
- ✅ Create in Squash TM, get new auto-generated ID
- ❌ Don't extract ID from filename pattern
- ❌ Don't rename feature file during creation
- **Filename pattern irrelevant** - could be `3761_*.feature` but creates new ID `5093`

### Workflow 2: Sync Existing Test Case

**User Request Patterns:**
- "Sync test 3761"
- "Sync this test" (with feature file context)
- "Transmit test 3724"

**Workflow:**
```bash
# 1. Extract test ID from filename pattern {id}_*.feature
# Example: 3761_Popup_-_Geo_location.feature → ID: 3761

# 2. Sync local feature file to existing Squash TM test case
npx tsx /home/thuc/Projects/squash-tm-mcp-agent/scripts/syncSquashTM.ts \
  features/path/3761_*.feature \
  3761

# 3. Transmit test case (mark as ready)
cd /home/thuc/Projects/squash-tm-mcp-agent && npm run transmit 3761
```

**Key Points:**
- ✅ User provides test ID (explicitly or via filename)
- ✅ Extract ID from filename pattern `{id}_*.feature`
- ✅ Sync local → Squash TM (bidirectional sync)
- ✅ Feature file must match naming convention
- **Test case must already exist in Squash TM**

### Decision Tree

```
User request?
├─ "Create new test" / "Add test case"
│  └─ Workflow 1: Read feature → Create BDD test case → Get new ID
│
└─ "Sync test <ID>" / "Transmit test"
   └─ Workflow 2: Extract ID from filename → Sync to existing test
```

### Examples

**Example 1: Create New Test**
```
User: "Create new test for project 6 with feature in
       /mwkkr-squash-tests/features/.../3761_Popup.feature"

Action:
1. Read /mwkkr-squash-tests/features/.../3761_Popup.feature
2. Create BDD test case in project 6
3. Result: Test case ID 5093 created (ignore 3761 in filename)
```

**Example 2: Sync Existing Test**
```
User: "Sync test 3724"

Action:
1. Find feature file: find . -name "3724_*.feature"
2. Run sync: npx tsx scripts/syncSquashTM.ts features/.../3724_*.feature 3724
3. Run transmit: npm run transmit 3724
```

**Rule for Future:**
1. **CREATE task** → Read feature content, create test, ignore filename ID
2. **SYNC task** → Extract ID from filename/user input, sync to existing test
3. **Never confuse the two workflows** - they have different purposes and inputs

---

## CRITICAL: Always Create keyword-test-case Format - 2026-04-17

**MANDATORY RULE: User only wants keyword-test-case format, NEVER scripted-test-case**

### When Creating New Test Cases from Feature Files

**❌ WRONG - Never use this:**
```typescript
// This creates scripted-test-case (Gherkin script as text)
mcp__squash-tm__create_bdd_test_case({
  name: "Test name",
  parentType: "project",
  parentId: 6,
  script: "Feature: ...\n  Scenario: ..."
})
// Result: _type: "scripted-test-case" - Shows as script editor in UI
```

**✅ CORRECT - Always use this pattern:**
```bash
# Step 1: Create keyword-test-case shell using MCP tool
mcp__squash-tm__create_keyword_test_case({
  name: "Test name from feature",
  parentType: "project",
  parentId: 6
  # Optional: importance, status, automatedTestTechnology, description, prerequisite
})
# Returns: { id: 5097, _type: "keyword-test-case", ... }

# Step 2: Add individual keyword steps from feature file
# For each Given/When/Then step in feature:
mcp__squash-tm__create_test_step({
  testCaseId: 5097,
  keyword: "GIVEN" | "WHEN" | "THEN" | "AND" | "BUT",
  action: "Step description",
  comment: "Optional comment"  // For step comments from feature file
})
```

### Complete Workflow for Creating Test from Feature File

```bash
# 1. Read feature file
Read /path/to/feature.feature

# 2. Create keyword-test-case using MCP tool
mcp__squash-tm__create_keyword_test_case({
  name: "Test name",
  parentType: "project",
  parentId: 6
})
# Returns: { id: 5096, _type: "keyword-test-case", ... }

# 3. Add each step individually
mcp__squash-tm__create_test_step({ testCaseId: 5096, keyword: "GIVEN", action: "..." })
mcp__squash-tm__create_test_step({ testCaseId: 5096, keyword: "THEN", action: "..." })
mcp__squash-tm__create_test_step({ testCaseId: 5096, keyword: "THEN", action: "..." })

# 4. Verify: Check _type is keyword-test-case
mcp__squash-tm__get_test_case({ testCaseId: 5096 })
# Must show: "_type": "keyword-test-case" and steps array with keyword-step objects
```

### Why This Matters

**scripted-test-case** (WRONG):
- Shows as Gherkin script in text editor
- Single `script` field with full feature content
- Cannot edit individual steps
- User does NOT want this

**keyword-test-case** (CORRECT):
- Shows as individual step rows in UI
- Each step is separate `keyword-step` entity
- Can edit/reorder steps individually
- User ALWAYS wants this

### Verification Checklist

Before marking task complete, verify:
1. ✅ Test case `_type` is `"keyword-test-case"` (NOT `"scripted-test-case"`)
2. ✅ `steps` array contains `keyword-step` objects (NOT empty)
3. ✅ Each step has `keyword`, `action`, `index` fields
4. ✅ UI shows individual step rows (NOT script editor)

### Example - Test Case 5096 (Correct Format)

```json
{
  "_type": "keyword-test-case",  // ✅ Correct
  "id": 5096,
  "name": "Popup - Geo location popup",
  "steps": [  // ✅ Has individual steps
    {
      "_type": "keyword-step",
      "keyword": "GIVEN",
      "action": "Go to homepage and not close popups",
      "index": 0
    },
    {
      "_type": "keyword-step",
      "keyword": "THEN",
      "action": "The Geolocation redirect popup should be visible",
      "index": 1
    }
  ]
}
```

### ABSOLUTE RULE

**NEVER use `mcp__squash-tm__create_bdd_test_case` for creating tests from feature files**

**ALWAYS use:**
1. `mcp__squash-tm__create_keyword_test_case` to create test case shell
2. `mcp__squash-tm__create_test_step` for each step

**No exceptions. No alternatives. This is the only correct way.**

### MCP Tool Available (After Restart)

**Note:** After building the MCP agent (`npm run build`), you must restart Claude Code for the new `create_keyword_test_case` tool to become available.

**Tool signature:**
```typescript
mcp__squash-tm__create_keyword_test_case({
  name: string,              // Required: Test case name
  parentType: "project" | "test-case-folder",  // Required
  parentId: number,          // Required: Project or folder ID
  description?: string,      // Optional: HTML description
  prerequisite?: string,     // Optional: HTML prerequisite
  importance?: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",  // Optional, default: VERY_HIGH
  status?: "WORK_IN_PROGRESS" | "UNDER_REVIEW" | "APPROVED" | "OBSOLETE",  // Optional, default: WORK_IN_PROGRESS
  automatedTestTechnology?: string  // Optional, default: Playwright
})
```
