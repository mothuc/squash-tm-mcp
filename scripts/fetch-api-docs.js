#!/usr/bin/env node
// Fetch SquashTM's REST API documentation page (a single huge HTML file) and
// strip it down to plain text, cached locally so endpoints can be looked up
// with `rg` instead of re-fetching/re-rendering the page every time.
//
// Usage:
//   node scripts/fetch-api-docs.js [url] [outputFile]
//
// Defaults to the DTN QA instance's docs page and .cache/api-documentation.txt.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_URL = "https://qa.dtn.com.vn/squash/api/rest/latest/docs/api-documentation.html";
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUTPUT = path.join(SCRIPT_DIR, "..", ".cache", "api-documentation.txt");

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

async function main() {
  const url = process.argv[2] || DEFAULT_URL;
  const outputFile = process.argv[3] || DEFAULT_OUTPUT;

  console.log(`Fetching ${url} ...`);
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed to fetch docs: HTTP ${res.status}`);
    process.exit(1);
  }
  const html = await res.text();
  const text = htmlToText(html);

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, text, "utf8");
  console.log(`Saved ${text.length} chars (${text.split("\n").length} lines) to ${outputFile}`);
  console.log(`Search it with: rg -n -A 15 "Get iteration" ${path.relative(process.cwd(), outputFile)}`);
}

main();
