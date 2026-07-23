#!/usr/bin/env bash
# Run a Playwright/BDD test inside the pw-ssh-office-01 container using a
# local checkout of the test repo, mirroring the env vars the real
# Orchestrator sets when it invokes a test (see build/playwright-ssh/npx).
# For a container-free run directly on this machine, see run-local-test.sh.
set -euo pipefail

CONTAINER="pw-ssh-office-01"
REPO_PATH="$HOME/Projects/mwktw-squash-tests"
BRANCH="main"
ENV_NAME="staging"
DEVICE="Desktop Chrome"
DSNAME=""
ITERATION_ID=""
REFERENCE=""
DEBUG="false"
COPY_REPO="true"
FEATURE=""

usage() {
  cat <<'EOF'
Usage: scripts/run-office-test.sh <feature-path>[#Scenario name] [options]

<feature-path> is relative to the repo root, e.g.:
  features/1__Storefront/04__Product_Page/6495_PDP_-_Check_layout_-_all_products_in_hand-tools.feature
Append #Scenario Name to target a single scenario, same as Squash TM's INPUT_TEST format.

Options:
  --repo PATH           Local checkout of the test repo (default: ~/Projects/mwktw-squash-tests)
  --container NAME      Target container (default: pw-ssh-office-01)
  --branch NAME         BRANCH env var (default: main)
  --env NAME            ENV env var (default: staging)
  --device NAME         DEVICE env var (default: "Desktop Chrome")
  --dsname NAME         DSNAME env var, for data-driven tests (e.g. product_001);
                        also used as the dataset_name when --iteration-id is set
  --iteration-id ID     Import the result into this SquashTM iteration via
                        POST /api/rest/latest/import/results/{ID} — this creates
                        the automated test suite + execution for you
  --reference REF       Automated Test Reference of the target Test Case in SquashTM.
                        Defaults to the computed INPUT_TEST (repo/feature-path#scenario),
                        which is what SquashTM's "Automated Test Reference" field is
                        set to for Playwright/BDD test cases — usually no need to pass this.
  --debug               Verbose wrapper output (DEBUG=true)
  --no-copy             Skip "docker cp" of the repo (use when it's already
                        bind-mounted into the container via compose.yml)
  -h, --help            Show this help
EOF
}

if [[ $# -eq 0 ]]; then
  usage
  exit 1
fi

FEATURE="$1"
shift

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) REPO_PATH="$2"; shift 2 ;;
    --container) CONTAINER="$2"; shift 2 ;;
    --branch) BRANCH="$2"; shift 2 ;;
    --env) ENV_NAME="$2"; shift 2 ;;
    --device) DEVICE="$2"; shift 2 ;;
    --dsname) DSNAME="$2"; shift 2 ;;
    --iteration-id) ITERATION_ID="$2"; shift 2 ;;
    --reference) REFERENCE="$2"; shift 2 ;;
    --debug) DEBUG="true"; shift ;;
    --no-copy) COPY_REPO="false"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "❌ Container '$CONTAINER' is not running. Start it first:" >&2
  echo "   docker compose up -d $CONTAINER" >&2
  exit 1
fi

REPO_NAME="$(basename "$REPO_PATH")"
WORKSPACE="/home/pwuser/workspace"

if [[ "$COPY_REPO" == "true" ]]; then
  if [[ ! -d "$REPO_PATH" ]]; then
    echo "❌ Repo not found at $REPO_PATH (use --repo to point elsewhere, or --no-copy if already mounted)" >&2
    exit 1
  fi
  echo "📦 Copying $REPO_PATH -> $CONTAINER:$WORKSPACE/$REPO_NAME"
  docker exec "$CONTAINER" mkdir -p "$WORKSPACE/$REPO_NAME"
  docker cp "$REPO_PATH/." "$CONTAINER:$WORKSPACE/$REPO_NAME/"
  docker exec -u root "$CONTAINER" chown -R pwuser:pwuser "$WORKSPACE"
fi

INPUT_TEST="$REPO_NAME/$FEATURE"
# SquashTM's "Automated Test Reference" field for Playwright/BDD test cases is set
# to exactly this repo/feature-path#scenario string — reuse it unless overridden.
[[ -z "$REFERENCE" ]] && REFERENCE="$INPUT_TEST"

ENV_ARGS=(
  -e "CI=true"
  -e "DEBUG=$DEBUG"
  -e "REPO=$WORKSPACE/$REPO_NAME"
  -e "BRANCH=$BRANCH"
  -e "ENV=$ENV_NAME"
  -e "DEVICE=$DEVICE"
  -e "INPUT_TEST=$INPUT_TEST"
)
[[ -n "$DSNAME" ]] && ENV_ARGS+=(-e "DSNAME=$DSNAME" -e "DS_$DSNAME=$DSNAME")

OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/test-results/office-01/last-run"
mkdir -p "$OUT_DIR"
LOG_FILE="$OUT_DIR/execution.log"

echo "🚀 Running INPUT_TEST=$INPUT_TEST in $CONTAINER"
set +e
docker exec -u pwuser -w "$WORKSPACE" "${ENV_ARGS[@]}" "$CONTAINER" bash -lc 'npx playwright test' 2>&1 | tee "$LOG_FILE"
RESULT=${PIPESTATUS[0]}
set -e

echo "📥 Copying HTML report back to $OUT_DIR"
docker cp "$CONTAINER:$WORKSPACE/playwright-report" "$OUT_DIR/" 2>/dev/null || true
# /home/pwuser/test-results is already bind-mounted to ./test-results/office-01 on the
# host (see compose.yml), so any files the wrapper writes under ~/test-results are
# already visible there directly — no copy needed.
echo "ℹ️  Raw test-results data (if any) is directly at test-results/office-01/$REPO_NAME/"

# Import the result into SquashTM via the official CI/CD endpoint — this CREATES
# the automated test suite + execution in the iteration from scratch (no need to
# already have an execution id), matching "ran locally, now push the result up".
# See: POST /api/rest/latest/import/results/{iteration_id}
if [[ -n "$ITERATION_ID" ]]; then
  JUNIT_FILE="$OUT_DIR/playwright-report/pw_junit_report.xml"
  # playwright-report/index.html in this project is just an iframe pointing at
  # "https://qa.dtn.com.vn/test-results/<repo>/<job>/<uuid>.html" — a URL only the
  # real orchestrator host serves. The actual self-contained report is that <uuid>.html
  # file, already sitting in the bind-mounted test-results dir (DEST_DIR in npx).
  # Extract its name from the iframe src and attach that instead of the empty shell.
  HTML_FILE="$OUT_DIR/playwright-report/index.html"
  IFRAME_SRC="$(grep -oE 'src="[^"]*"' "$HTML_FILE" 2>/dev/null | head -1 | sed -E 's/src="([^"]*)"/\1/')"
  if [[ -n "$IFRAME_SRC" ]]; then
    REAL_REPORT_NAME="$(basename "$IFRAME_SRC")"
    REAL_REPORT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/test-results/office-01/$REPO_NAME/workspace/$REAL_REPORT_NAME"
    if [[ -f "$REAL_REPORT_PATH" ]]; then
      HTML_FILE="$REAL_REPORT_PATH"
    else
      echo "⚠️  Expected real report at $REAL_REPORT_PATH not found — attaching the empty iframe shell instead" >&2
    fi
  fi
  if [[ ! -f "$JUNIT_FILE" ]]; then
    echo "⚠️  No JUnit report at $JUNIT_FILE — skipping SquashTM import" >&2
  else
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    CONVERT_ARGS=("$JUNIT_FILE" --reference "$REFERENCE")
    [[ -n "$DSNAME" ]] && CONVERT_ARGS+=(--dataset-name "$DSNAME")
    [[ -f "$HTML_FILE" ]] && CONVERT_ARGS+=(--html-report "$HTML_FILE")
    [[ -f "$LOG_FILE" ]] && CONVERT_ARGS+=(--log-file "$LOG_FILE")
    PAYLOAD_FILE="$(mktemp)"
    node "$SCRIPT_DIR/build_sqtm_import_payload.js" "${CONVERT_ARGS[@]}" > "$PAYLOAD_FILE"

    # Read SQTM_API_URL/TOKEN from the container's own env (never printed).
    SQTM_API_URL_VAL="$(docker exec "$CONTAINER" printenv SQTM_API_URL)"
    SQTM_API_TOKEN_VAL="$(docker exec "$CONTAINER" printenv SQTM_API_TOKEN)"

    RESPONSE_FILE="$(mktemp)"
    echo "📤 Importing results into SquashTM iteration $ITERATION_ID (reference=$REFERENCE)..."
    IMPORT_RESPONSE=$(curl -sS --max-time 30 -o "$RESPONSE_FILE" -w "%{http_code}" -X POST \
      "$SQTM_API_URL_VAL/api/rest/latest/import/results/$ITERATION_ID" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json" \
      -H "Authorization: Bearer $SQTM_API_TOKEN_VAL" \
      --data "@$PAYLOAD_FILE")
    rm -f "$PAYLOAD_FILE"

    if [[ "$IMPORT_RESPONSE" == "204" ]]; then
      echo "✅ Imported into SquashTM iteration $ITERATION_ID (HTTP 204)"
    else
      echo "⚠️  SquashTM import failed (HTTP $IMPORT_RESPONSE):"
      cat "$RESPONSE_FILE"
    fi
    rm -f "$RESPONSE_FILE"
  fi
else
  echo "ℹ️  --iteration-id not given — skipping SquashTM import"
fi

exit $RESULT
