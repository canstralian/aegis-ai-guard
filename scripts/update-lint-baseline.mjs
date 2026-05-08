#!/usr/bin/env node
/**
 * Interactive helper to update supabase/lint-baseline.json.
 *
 * Runs `supabase db lint`, diffs current counts against the baseline for
 * monitored codes, prompts you for a justification on any change, then
 * writes the new baseline and appends an entry to supabase/lint-baseline.log.md.
 *
 * Usage:
 *   node scripts/update-lint-baseline.mjs
 *   node scripts/update-lint-baseline.mjs --yes   # accept all increases without prompting
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const baselinePath = resolve(__dirname, "../supabase/lint-baseline.json");
const logPath = resolve(__dirname, "../supabase/lint-baseline.log.md");

const autoYes = process.argv.includes("--yes");
const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
const MONITORED = Object.keys(baseline.codes);

function runLint() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  const args = ["db", "lint", "--level", "warning", "--output", "json"];
  if (dbUrl) args.push("--db-url", dbUrl);
  try {
    return execSync(`supabase ${args.join(" ")}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    if (err.stdout) return err.stdout.toString();
    console.error("Failed to run supabase db lint:", err.message);
    process.exit(2);
  }
}

const report = JSON.parse(runLint());
const issues = Array.isArray(report) ? report : report.issues ?? [];

const counts = {};
const details = {};
for (const code of MONITORED) {
  const suffix = code.replace(/^\d+_/, "");
  const matching = issues.filter((i) => i.name === suffix);
  counts[code] = matching.length;
  details[code] = matching.map((i) => i.detail || i.description || "(no detail)");
}

console.log("\nMonitored lint code counts:\n");
console.log("  Code".padEnd(60), "current".padStart(8), " baseline");
console.log("  " + "-".repeat(80));
const changes = [];
for (const code of MONITORED) {
  const current = counts[code];
  const previous = baseline.codes[code];
  const arrow = current === previous ? " " : current > previous ? "▲" : "▼";
  console.log("  " + code.padEnd(58), String(current).padStart(8), " " + previous + " " + arrow);
  if (current !== previous) changes.push({ code, current, previous });
}

if (changes.length === 0) {
  console.log("\nNo changes — baseline is up to date.");
  process.exit(0);
}

const rl = createInterface({ input, output });

async function ask(q) {
  if (autoYes) return "auto-accepted via --yes";
  const a = await rl.question(q);
  return a.trim();
}

console.log("\nChanges detected. You'll be prompted for justification per code.\n");
const newBaseline = { ...baseline, codes: { ...baseline.codes } };
const logEntries = [];

for (const { code, current, previous } of changes) {
  console.log(`\n— ${code}: ${previous} → ${current}`);
  if (details[code].length) {
    console.log("  Findings:");
    for (const d of details[code].slice(0, 10)) console.log("   • " + d);
    if (details[code].length > 10) console.log(`   …and ${details[code].length - 10} more`);
  }
  const accept = autoYes
    ? "y"
    : (await ask("  Accept new count? [y/N] ")).toLowerCase();
  if (accept !== "y" && accept !== "yes") {
    console.log("  Skipped — baseline left unchanged for this code.");
    continue;
  }
  const reason = await ask("  Justification (one line): ");
  newBaseline.codes[code] = current;
  logEntries.push({ code, previous, current, reason: reason || "(none provided)" });
}

await rl.close();

if (logEntries.length === 0) {
  console.log("\nNo baseline updates applied.");
  process.exit(0);
}

writeFileSync(baselinePath, JSON.stringify(newBaseline, null, 2) + "\n");

const stamp = new Date().toISOString();
const author = process.env.USER || process.env.USERNAME || "unknown";
let logBlock = `\n## ${stamp} — ${author}\n`;
for (const e of logEntries) {
  logBlock += `- \`${e.code}\`: ${e.previous} → ${e.current}\n  - ${e.reason}\n`;
}
if (!existsSync(logPath)) {
  writeFileSync(logPath, "# Lint Baseline Change Log\n");
}
appendFileSync(logPath, logBlock);

console.log(`\n✅ Updated ${baselinePath}`);
console.log(`✅ Appended justification to ${logPath}`);
console.log("Commit both files together in your PR.");
