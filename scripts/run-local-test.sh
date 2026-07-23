#!/usr/bin/env bash
# Run a Playwright/BDD test directly on the local machine, inside a local
# checkout of the test repo — no Docker involved. Counterpart to
# run-office-test.sh, which runs the same kind of test inside the
# pw-ssh-office-01 container. See that script if you need the container flow.
#
# Key difference from the container flow: we deliberately do NOT set CI=true.
# The dtn-playwright-report reporter branches on that env var — with CI unset
# it writes a fully self-contained playwright-report/index.html directly (no
# iframe shell to unwrap), which is exactly what a plain local run produces.
set -euo pipefail

REPO_PATH="$(pwd)"
ENV_NAME="staging"
DEVICE="Desktop Chrome"
DSNAME=""
ITERATION_ID=""
REFERENCE=""
DEBUG="false"
INCLUDE_HEAVY="false"
FEATURE=""

usage() {
  cat <<'EOF'
Usage: scripts/run-local-test.sh <feature-path>[#Scenario name] [options]

<feature-path> is relative to the repo root, e.g.:
  features/1__Storefront/04__Product_Page/6495_PDP_-_Check_layout_-_all_products_in_hand-tools.feature
Append #Scenario Name to match Squash TM's INPUT_TEST format (used only for
the Automated Test Reference value, not for local filtering).

Options:
  --repo PATH           Local checkout of the test repo to run in (default: current directory)
  --env NAME            ENV env var (default: staging)
  --device NAME         DEVICE env var (default: "Desktop Chrome")
  --dsname NAME         Filter to tests tagged @NAME (data-driven), e.g. product_001;
                        also used as the dataset_name when --iteration-id is set
  --iteration-id ID     Import the result into this SquashTM iteration via
                        POST /api/rest/latest/import/results/{ID}
                        Credentials: SQUASH_TM_BASE_URL/SQUASH_TM_API_TOKEN
                        (same names as the rest of this repo) — uses them if
                        already exported, else falls back to this repo's .env
  --reference REF       Automated Test Reference of the target Test Case in SquashTM.
                        Defaults to the computed INPUT_TEST (repo/feature-path#scenario),
                        which is what SquashTM's "Automated Test Reference" field is
                        set to for Playwright/BDD test cases — usually no need to pass this.
  --include-heavy-assets  Also attach trace.zip/video.webm from playwright-report/attachments
                        (skipped by default — they can be tens of MB and blow up the
                        import payload; screenshots and other small files are always attached)
  --debug               Verbose output (DEBUG=true)
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
    --env) ENV_NAME="$2"; shift 2 ;;
    --device) DEVICE="$2"; shift 2 ;;
    --dsname) DSNAME="$2"; shift 2 ;;
    --iteration-id) ITERATION_ID="$2"; shift 2 ;;
    --reference) REFERENCE="$2"; shift 2 ;;
    --include-heavy-assets) INCLUDE_HEAVY="true"; shift ;;
    --debug) DEBUG="true"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ ! -d "$REPO_PATH" || ! -f "$REPO_PATH/package.json" ]]; then
  echo "❌ '$REPO_PATH' doesn't look like a repo checkout (no package.json found) — use --repo to point at it" >&2
  exit 1
fi
REPO_PATH="$(cd "$REPO_PATH" && pwd)"

FEATURE_PATH="${FEATURE%%#*}"
if [[ ! -f "$REPO_PATH/$FEATURE_PATH" ]]; then
  echo "❌ Feature file not found: $REPO_PATH/$FEATURE_PATH" >&2
  exit 1
fi

REPO_NAME="$(basename "$REPO_PATH")"
INPUT_TEST="$REPO_NAME/$FEATURE"
[[ -z "$REFERENCE" ]] && REFERENCE="$INPUT_TEST"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/test-results/local/$REPO_NAME/last-run"
mkdir -p "$OUT_DIR"
LOG_FILE="$OUT_DIR/execution.log"

# Same resolution the real Orchestrator's npx wrapper uses: strip #Scenario,
# strip everything up to the last "features/", mirror that path under
# .features-gen/ with a ".spec.js" suffix.
RELATIVE_PATH="${FEATURE_PATH##*features/}"
SPEC_FILE=".features-gen/${RELATIVE_PATH%.feature}.feature.spec.js"

GREP_ARGS=()
[[ -n "$DSNAME" ]] && GREP_ARGS+=(--grep "(?<![\\w-])@${DSNAME}(?![\\w-])")

echo "🚀 Running $FEATURE_PATH locally in $REPO_PATH"
(
  cd "$REPO_PATH"
  echo "🧬 Generating features (bddgen)..."
  npx bddgen
  set +e
  ENV="$ENV_NAME" DEVICE="$DEVICE" DEBUG="$DEBUG" npx playwright test "$SPEC_FILE" "${GREP_ARGS[@]}" 2>&1 | tee "$LOG_FILE"
  echo "${PIPESTATUS[0]}" > "$OUT_DIR/.exit-code"
)
RESULT="$(cat "$OUT_DIR/.exit-code")"
rm -f "$OUT_DIR/.exit-code"

echo "ℹ️  Reports are directly in $REPO_PATH/playwright-report and $REPO_PATH/cucumber-report"

if [[ -n "$ITERATION_ID" ]]; then
  JUNIT_FILE="$REPO_PATH/cucumber-report/pw_junit_report.xml"
  HTML_FILE="$REPO_PATH/playwright-report/index.html"
  ATTACH_DIR="$REPO_PATH/playwright-report/attachments"

  if [[ ! -f "$JUNIT_FILE" ]]; then
    echo "⚠️  No JUnit report at $JUNIT_FILE — skipping SquashTM import" >&2
  else
    ATTACH_ARGS=()
    if [[ -d "$ATTACH_DIR" ]]; then
      while IFS= read -r -d '' f; do
        ext="${f##*.}"
        if [[ "$INCLUDE_HEAVY" != "true" && ( "$ext" == "zip" || "$ext" == "webm" ) ]]; then
          echo "↷ Skipping heavy asset (use --include-heavy-assets to attach): $(basename "$f")" >&2
          continue
        fi
        ATTACH_ARGS+=(--attachment "$f")
      done < <(find "$ATTACH_DIR" -maxdepth 1 -type f -print0)
    fi

    CONVERT_ARGS=("$JUNIT_FILE" --reference "$REFERENCE")
    [[ -n "$DSNAME" ]] && CONVERT_ARGS+=(--dataset-name "$DSNAME")
    [[ -f "$HTML_FILE" ]] && CONVERT_ARGS+=(--html-report "$HTML_FILE")
    [[ -f "$LOG_FILE" ]] && CONVERT_ARGS+=(--log-file "$LOG_FILE")
    CONVERT_ARGS+=("${ATTACH_ARGS[@]}")

    PAYLOAD_FILE="$(mktemp)"
    node "$SCRIPT_DIR/build_sqtm_import_payload.js" "${CONVERT_ARGS[@]}" > "$PAYLOAD_FILE"

    # Resolve SquashTM API base URL + token — same two names used everywhere
    # else in this repo (BaseClient.ts, syncSquashTM.ts, etc.): SQUASH_TM_BASE_URL
    # (already includes /api/rest/latest) / SQUASH_TM_API_TOKEN. Prefer
    # already-exported shell env, otherwise fall back to this repo's own .env.
    # (run-office-test.sh intentionally keeps its own SQTM_API_URL/SQTM_API_TOKEN
    # names — those come from the pw-ssh-office-01 container's real env via
    # `docker exec printenv`, a different source with no naming freedom.)
    # Values never get echoed anywhere.
    API_BASE=""
    API_TOKEN=""
    if [[ -n "${SQUASH_TM_BASE_URL:-}" && -n "${SQUASH_TM_API_TOKEN:-}" ]]; then
      API_BASE="${SQUASH_TM_BASE_URL%/}"
      API_TOKEN="$SQUASH_TM_API_TOKEN"
    elif [[ -f "$SCRIPT_DIR/../.env" ]]; then
      # Values in this repo's .env are wrapped in double quotes (with a
      # trailing comma on some lines) — strip both before use.
      SANITIZE='s/,[[:space:]]*$//; s/^"//; s/"$//'
      ENV_BASE="$(grep -E '^SQUASH_TM_BASE_URL=' "$SCRIPT_DIR/../.env" | tail -1 | cut -d= -f2- | sed -e "$SANITIZE")"
      ENV_TOKEN="$(grep -E '^SQUASH_TM_API_TOKEN=' "$SCRIPT_DIR/../.env" | tail -1 | cut -d= -f2- | sed -e "$SANITIZE")"
      if [[ -n "$ENV_BASE" && -n "$ENV_TOKEN" ]]; then
        API_BASE="${ENV_BASE%/}"
        API_TOKEN="$ENV_TOKEN"
      fi
    fi

    if [[ -z "$API_BASE" || -z "$API_TOKEN" ]]; then
      echo "❌ No SquashTM credentials found — export SQUASH_TM_BASE_URL/SQUASH_TM_API_TOKEN, or set them in $SCRIPT_DIR/../.env" >&2
      rm -f "$PAYLOAD_FILE"
      exit 1
    fi

    RESPONSE_FILE="$(mktemp)"
    echo "📤 Importing results into SquashTM iteration $ITERATION_ID (reference=$REFERENCE)..."
    set +e
    IMPORT_RESPONSE=$(curl -sS --max-time 60 -o "$RESPONSE_FILE" -w "%{http_code}" -X POST \
      "$API_BASE/import/results/$ITERATION_ID" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json" \
      -H "Authorization: Bearer $API_TOKEN" \
      --data "@$PAYLOAD_FILE")
    CURL_EXIT=$?
    set -e
    rm -f "$PAYLOAD_FILE"

    # A network-level curl failure (no HTTP response at all) must not abort the
    # script under set -e — a failed import should only warn, never take down
    # the exit code of an otherwise-passing test run.
    if [[ $CURL_EXIT -ne 0 ]]; then
      echo "⚠️  SquashTM import request failed (curl exit $CURL_EXIT — network/connection error, no HTTP response)" >&2
    elif [[ "$IMPORT_RESPONSE" == "204" ]]; then
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

exit "$RESULT"
