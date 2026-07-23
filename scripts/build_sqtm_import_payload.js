#!/usr/bin/env node
// Convert a JUnit XML report into the JSON payload expected by SquashTM's
// POST /api/rest/latest/import/results/{iteration_id} endpoint.
//
// Usage:
//   node build_sqtm_import_payload.js <junit.xml> --reference REF [--dataset-name NAME]
//                                 [--html-report index.html] [--log-file execution.log]
//
// Two separate SquashTM views read attachments from two different places:
// - "Execution details" popup (per test/dataset) reads tests[].attachments —
//   needs the HTML report named exactly "index.html" to render there.
// - "Automated Suite" view (iteration/{id}/automated-suite) reads
//   automated_test_suite.attachments — this is where the run's console log and
//   aggregate report belong (mirrors the workflow_output.log / executionreport.html
//   pattern from jenkins-opentf-pipeline-library).
// Both are populated here.
import fs from "node:fs";
import path from "node:path";

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

// Minimal XML parser — just enough to walk JUnit reports (nested elements,
// attributes, self-closing tags, comments, CDATA). Returns a tree of
// { tag, attrs, children, text }.
function parseXML(str) {
  let i = 0;
  const len = str.length;

  function skipWhitespace() {
    while (i < len && /\s/.test(str[i])) i++;
  }

  function parseName() {
    const start = i;
    while (i < len && !/[\s/>=]/.test(str[i])) i++;
    return str.slice(start, i);
  }

  function parseAttrs() {
    const attrs = {};
    while (true) {
      skipWhitespace();
      if (str[i] === "/" || str[i] === ">" || i >= len) break;
      const name = parseName();
      if (!name) break;
      skipWhitespace();
      if (str[i] === "=") {
        i++;
        skipWhitespace();
        const quote = str[i];
        i++;
        const start = i;
        while (i < len && str[i] !== quote) i++;
        attrs[name] = decodeEntities(str.slice(start, i));
        i++; // closing quote
      } else {
        attrs[name] = true;
      }
    }
    return attrs;
  }

  function parseNode() {
    if (str.startsWith("<!--", i)) {
      const end = str.indexOf("-->", i);
      i = end === -1 ? len : end + 3;
      return null;
    }
    if (str.startsWith("<![CDATA[", i)) {
      const end = str.indexOf("]]>", i);
      const text = str.slice(i + 9, end === -1 ? len : end);
      i = end === -1 ? len : end + 3;
      return { text };
    }
    if (str.startsWith("<?", i)) {
      const end = str.indexOf("?>", i);
      i = end === -1 ? len : end + 2;
      return null;
    }
    if (str.startsWith("<!", i)) {
      const end = str.indexOf(">", i);
      i = end === -1 ? len : end + 1;
      return null;
    }

    i++; // skip '<'
    const tag = parseName();
    const attrs = parseAttrs();
    skipWhitespace();
    if (str[i] === "/") {
      i += 2; // skip '/>'
      return { tag, attrs, children: [], text: "" };
    }
    i++; // skip '>'

    const children = [];
    let text = "";
    while (i < len) {
      if (str.startsWith("</", i)) {
        i += 2;
        parseName();
        skipWhitespace();
        i++; // skip '>'
        break;
      }
      if (str[i] === "<") {
        const child = parseNode();
        if (child) {
          if (child.tag) children.push(child);
          else if (child.text !== undefined) text += child.text;
        }
      } else {
        const start = i;
        while (i < len && str[i] !== "<") i++;
        text += decodeEntities(str.slice(start, i));
      }
    }
    return { tag, attrs, children, text: text.trim() };
  }

  while (i < len) {
    skipWhitespace();
    if (str.startsWith("<?", i) || str.startsWith("<!--", i) || str.startsWith("<!", i)) {
      parseNode();
      continue;
    }
    break;
  }
  return parseNode();
}

function findAll(node, tag, results = []) {
  if (!node) return results;
  if (node.tag === tag) results.push(node);
  for (const child of node.children || []) findAll(child, tag, results);
  return results;
}

function directChildren(node, tag) {
  return (node.children || []).filter((c) => c.tag === tag);
}

function statusFor(testcase) {
  if (directChildren(testcase, "failure").length || directChildren(testcase, "error").length) {
    return "FAILURE";
  }
  if (directChildren(testcase, "skipped").length) {
    return "SKIPPED";
  }
  return "SUCCESS";
}

function failureDetailsFor(testcase) {
  const details = [];
  for (const tag of ["failure", "error"]) {
    for (const node of directChildren(testcase, tag)) {
      const msg = node.attrs.message || (node.text || "").trim();
      if (msg) details.push(msg);
    }
  }
  return details;
}

function encodeAttachment(filePath, name) {
  const content = fs.readFileSync(filePath).toString("base64");
  return { name: name || path.basename(filePath), content };
}

function parseArgs(argv) {
  const args = { junitXml: null, reference: null, datasetName: null, htmlReport: null, logFile: null, attachments: [] };
  const rest = [...argv];
  while (rest.length) {
    const arg = rest.shift();
    switch (arg) {
      case "--reference":
        args.reference = rest.shift();
        break;
      case "--dataset-name":
        args.datasetName = rest.shift();
        break;
      case "--html-report":
        args.htmlReport = rest.shift();
        break;
      case "--log-file":
        args.logFile = rest.shift();
        break;
      case "--attachment":
        args.attachments.push(rest.shift());
        break;
      default:
        if (args.junitXml === null) args.junitXml = arg;
        break;
    }
  }
  if (!args.junitXml || !args.reference) {
    console.error("Usage: build_sqtm_import_payload.js <junit.xml> --reference REF [--dataset-name NAME] [--html-report FILE] [--log-file FILE] [--attachment FILE]...");
    process.exit(1);
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const xml = fs.readFileSync(args.junitXml, "utf8");
  const root = parseXML(xml);
  const testcases = findAll(root, "testcase");
  if (!testcases.length) {
    console.error("No <testcase> elements found in " + args.junitXml);
    process.exit(1);
  }

  // SquashTM's "Execution report" viewer only renders a report when the HTML
  // attachment is literally named index.html — the caller is expected to pass
  // the real, self-contained report content as --html-report (not a stub that
  // iframes to an external URL), and it gets attached under that fixed name.
  // The JUnit XML keeps its own basename (pw_junit_report.xml), matching what
  // real executions show.
  const attachments = [];
  if (args.htmlReport && fs.existsSync(args.htmlReport) && fs.statSync(args.htmlReport).isFile()) {
    attachments.push(encodeAttachment(args.htmlReport, "index.html"));
  }
  if (fs.existsSync(args.junitXml) && fs.statSync(args.junitXml).isFile()) {
    attachments.push(encodeAttachment(args.junitXml));
  }
  // Self-contained local reports (dtn-playwright-report with CI unset) link to
  // screenshots/videos/traces via relative "attachments/<file>" hrefs inside
  // index.html — preserve that same relative name so the link has a chance to
  // resolve wherever SquashTM serves sibling attachments from.
  for (const file of args.attachments) {
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      attachments.push(encodeAttachment(file, "attachments/" + path.basename(file)));
    }
  }
  // The "Automated Suite" view (iteration/{id}/automated-suite) reads
  // automated_test_suite.attachments, not tests[].attachments — attach the
  // console log there under its own filename, plus the same HTML report.
  const suiteAttachments = [];
  if (args.logFile && fs.existsSync(args.logFile) && fs.statSync(args.logFile).isFile()) {
    suiteAttachments.push(encodeAttachment(args.logFile));
  }
  if (args.htmlReport && fs.existsSync(args.htmlReport) && fs.statSync(args.htmlReport).isFile()) {
    suiteAttachments.push(encodeAttachment(args.htmlReport, "index.html"));
  }

  const tests = testcases.map((tc) => {
    const durationS = parseFloat(tc.attrs.time || "0") || 0;
    const test = {
      reference: args.reference,
      status: statusFor(tc),
      duration: Math.round(durationS * 1000),
    };
    if (args.datasetName) test.dataset_name = args.datasetName;
    const details = failureDetailsFor(tc);
    if (details.length) test.failure_details = details;
    if (attachments.length) test.attachments = attachments;
    return test;
  });

  const payload = { tests };
  if (suiteAttachments.length) {
    payload.automated_test_suite = { attachments: suiteAttachments };
  }

  process.stdout.write(JSON.stringify(payload));
}

main();
