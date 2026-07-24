#!/usr/bin/env node
// Rewrites a dtn-playwright-report "local mode" index.html so that screenshots
// and (optionally) videos are embedded as base64 data: URIs instead of
// relative "attachments/<uuid>.ext" links.
//
// Why: in local mode (CI unset), the reporter writes a single-file
// index.html, but <img>/<video> tags inside it still point at sibling files
// under playwright-report/attachments/ (see node_modules/dtn-playwright-report
// /dist/html/blocks/attachments.js and playwright-html-reporter.js). SquashTM
// stores each imported attachment as an independent blob with no shared
// folder — so those relative links 404 once index.html is served standalone.
// In CI mode this isn't an issue because attachments are hosted on a real
// webserver (SQUASHHTM_TEST_RESULTS_URL) preserving the relative structure;
// this script only matters for the local-run path.
//
// Usage:
//   node inline-report-attachments.js <index.html> [--attachments-dir DIR] [--include-heavy-assets]
//
// Trace .zip links are left untouched — trace.playwright.dev needs to fetch
// the trace from a real URL, so a data: URI wouldn't work there regardless.
import fs from "node:fs";
import path from "node:path";

const MIME_BY_EXT = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
};

// Extensions gated behind --include-heavy-assets, matching run-local-test.sh's
// own definition of "heavy" (videos can be tens of MB; images stay small).
const HEAVY_EXTS = new Set([".webm", ".mp4"]);

function parseArgs(argv) {
  const args = { indexHtml: null, attachmentsDir: null, includeHeavy: false };
  const rest = [...argv];
  while (rest.length) {
    const arg = rest.shift();
    switch (arg) {
      case "--attachments-dir":
        args.attachmentsDir = rest.shift();
        break;
      case "--include-heavy-assets":
        args.includeHeavy = true;
        break;
      default:
        if (args.indexHtml === null) args.indexHtml = arg;
        break;
    }
  }
  if (!args.indexHtml) {
    console.error("Usage: inline-report-attachments.js <index.html> [--attachments-dir DIR] [--include-heavy-assets]");
    process.exit(1);
  }
  if (!args.attachmentsDir) {
    args.attachmentsDir = path.join(path.dirname(path.resolve(args.indexHtml)), "attachments");
  }
  return args;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(args.indexHtml)) {
    console.error(`❌ ${args.indexHtml} not found`);
    process.exit(1);
  }

  let html = fs.readFileSync(args.indexHtml, "utf8");

  // Matches src="attachments/x.png", src='attachments/x.png',
  // href="attachments/x.pdf", onclick="showModal('attachments/x.png')" — any
  // quoted "attachments/<file>" reference, single or double quoted.
  const refPattern = /(["'])attachments\/([^"'>]+)\1/g;
  const relPaths = new Set();
  let match;
  while ((match = refPattern.exec(html))) {
    relPaths.add(match[2]);
  }

  if (relPaths.size === 0) {
    console.log("ℹ️  No attachments/<file> references found — nothing to inline.");
    return;
  }

  let inlinedCount = 0;
  let skippedHeavy = 0;
  let skippedUnsupported = 0;
  let skippedMissing = 0;
  let bytesBefore = 0;
  let bytesAfter = 0;

  for (const relFile of relPaths) {
    const ext = path.extname(relFile).toLowerCase();
    const mime = MIME_BY_EXT[ext];

    if (!mime) {
      // e.g. .zip traces — trace.playwright.dev needs a fetchable URL, can't inline.
      skippedUnsupported++;
      continue;
    }
    if (HEAVY_EXTS.has(ext) && !args.includeHeavy) {
      skippedHeavy++;
      continue;
    }

    const absPath = path.join(args.attachmentsDir, relFile);
    if (!fs.existsSync(absPath)) {
      skippedMissing++;
      continue;
    }

    const fileBuffer = fs.readFileSync(absPath);
    bytesBefore += fileBuffer.length;
    const dataUri = `data:${mime};base64,${fileBuffer.toString("base64")}`;
    bytesAfter += dataUri.length;

    const literal = `attachments/${relFile}`;
    const quotedPattern = new RegExp(`(["'])${escapeRegExp(literal)}\\1`, "g");
    html = html.replace(quotedPattern, (_, quote) => `${quote}${dataUri}${quote}`);
    inlinedCount++;
  }

  fs.writeFileSync(args.indexHtml, html, "utf8");

  console.log(
    `✅ Inlined ${inlinedCount} attachment(s) into ${path.basename(args.indexHtml)}` +
      (bytesBefore ? ` (${(bytesBefore / 1024).toFixed(0)}KB binary -> ${(bytesAfter / 1024).toFixed(0)}KB base64)` : "")
  );
  if (skippedHeavy > 0) {
    console.log(`↷ Skipped ${skippedHeavy} heavy asset(s) (video) — use --include-heavy-assets to inline them too`);
  }
  if (skippedUnsupported > 0) {
    console.log(`↷ Left ${skippedUnsupported} unsupported reference(s) as-is (e.g. trace .zip — can't be inlined, needs a real URL)`);
  }
  if (skippedMissing > 0) {
    console.log(`⚠️  ${skippedMissing} referenced file(s) not found under ${args.attachmentsDir} — left as broken relative links`);
  }
}

main();
