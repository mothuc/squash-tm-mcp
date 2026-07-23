#!/usr/bin/env python3
"""Convert a JUnit XML report into the JSON payload expected by SquashTM's
POST /api/rest/latest/import/results/{iteration_id} endpoint.

Usage:
  junit_to_sqtm_import.py <junit.xml> --reference REF [--dataset-name NAME]
                           [--html-report index.html] [--log-file execution.log]

Two separate SquashTM views read attachments from two different places:
- "Execution details" popup (per test/dataset) reads tests[].attachments —
  needs the HTML report named exactly "index.html" to render there.
- "Automated Suite" view (iteration/{id}/automated-suite) reads
  automated_test_suite.attachments — this is where the run's console log and
  aggregate report belong (mirrors the workflow_output.log / executionreport.html
  pattern from jenkins-opentf-pipeline-library).
Both are populated here.
"""
import argparse
import base64
import json
import os
import sys
import xml.etree.ElementTree as ET


def status_for(testcase):
    if testcase.find("failure") is not None or testcase.find("error") is not None:
        return "FAILURE"
    if testcase.find("skipped") is not None:
        return "SKIPPED"
    return "SUCCESS"


def failure_details_for(testcase):
    details = []
    for tag in ("failure", "error"):
        for node in testcase.findall(tag):
            msg = node.get("message") or (node.text or "").strip()
            if msg:
                details.append(msg)
    return details


def encode_attachment(path, name=None):
    with open(path, "rb") as f:
        content = base64.b64encode(f.read()).decode("ascii")
    return {"name": name or os.path.basename(path), "content": content}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("junit_xml")
    parser.add_argument("--reference", required=True, help="Automated Test Reference of the target Test Case")
    parser.add_argument("--dataset-name", default=None)
    parser.add_argument("--html-report", default=None, help="HTML report to attach (kept as index.html — SquashTM's report viewer looks for this exact name)")
    parser.add_argument("--log-file", default=None, help="Console/run log, attached at the automated_test_suite level")
    args = parser.parse_args()

    tree = ET.parse(args.junit_xml)
    root = tree.getroot()
    testcases = root.findall(".//testcase")
    if not testcases:
        print("No <testcase> elements found in " + args.junit_xml, file=sys.stderr)
        sys.exit(1)

    # SquashTM's "Execution report" viewer only renders a report when the HTML
    # attachment is literally named index.html — the caller is expected to pass
    # the real, self-contained report content as --html-report (not a stub that
    # iframes to an external URL), and it gets attached under that fixed name.
    # The JUnit XML keeps its own basename (pw_junit_report.xml), matching what
    # real executions show.
    attachments = []
    if args.html_report and os.path.isfile(args.html_report):
        attachments.append(encode_attachment(args.html_report, name="index.html"))
    if os.path.isfile(args.junit_xml):
        attachments.append(encode_attachment(args.junit_xml))

    # The "Automated Suite" view (iteration/{id}/automated-suite) reads
    # automated_test_suite.attachments, not tests[].attachments — attach the
    # console log there under its own filename, plus the same HTML report.
    suite_attachments = []
    if args.log_file and os.path.isfile(args.log_file):
        suite_attachments.append(encode_attachment(args.log_file))
    if args.html_report and os.path.isfile(args.html_report):
        suite_attachments.append(encode_attachment(args.html_report, name="index.html"))

    tests = []
    for tc in testcases:
        duration_s = float(tc.get("time", "0") or "0")
        test = {
            "reference": args.reference,
            "status": status_for(tc),
            "duration": int(round(duration_s * 1000)),
        }
        if args.dataset_name:
            test["dataset_name"] = args.dataset_name
        details = failure_details_for(tc)
        if details:
            test["failure_details"] = details
        if attachments:
            test["attachments"] = attachments
        tests.append(test)

    payload = {"tests": tests}
    if suite_attachments:
        payload["automated_test_suite"] = {"attachments": suite_attachments}

    json.dump(payload, sys.stdout)


if __name__ == "__main__":
    main()
