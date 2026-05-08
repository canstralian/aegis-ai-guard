#!/usr/bin/env node
/**
 * Runs `supabase db lint` and fails if counts of monitored lint codes
 * exceed the accepted baseline in supabase/lint-baseline.json.
 *
 * Specifically guards against regressions in:
 *   - 0027 pg_graphql_authenticated_table_exposed
 *   - 0029 authenticated_security_definer_function_executable
 *
 * Requires: supabase CLI on PATH and SUPABASE_DB_URL env var (or linked project).
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const baselinePath = resolve(__dirname, "../supabase/lint-baseline.json");
const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));

const MONITORED = Object.keys(baseline.codes);

function runLint() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  const args = ["db", "lint", "--level", "warning", "--output", "json"];
  if (dbUrl) args.push("--db-url", dbUrl);
  const cmd = `supabase ${args.join(" ")}`;
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (err) {
    // CLI exits non-zero when warnings exist; stdout still has JSON.
    if (err.stdout) return err.stdout.toString();
    console.error("Failed to run supabase db lint:", err.message);
    process.exit(2);
  }
}

const raw = runLint();
let report;
try {
  report = JSON.parse(raw);
} catch {
  console.error("Could not parse supabase db lint output as JSON:\n", raw);
  process.exit(2);
}

// Output shape: array of { name, level, facing, categories, description, detail, ... }
// `name` looks like "pg_graphql_authenticated_table_exposed" — match by suffix.
const issues = Array.isArray(report) ? report : report.issues ?? [];

const counts = {};
for (const code of MONITORED) {
  const suffix = code.replace(/^\d+_/, "");
  counts[code] = issues.filter((i) => i.name === suffix).length;
}

let failed = false;
console.log("Supabase DB linter — monitored codes:");
for (const code of MONITORED) {
  const actual = counts[code];
  const allowed = baseline.codes[code];
  const status = actual > allowed ? "FAIL" : "ok";
  if (actual > allowed) failed = true;
  console.log(`  [${status}] ${code}: ${actual} (baseline ${allowed})`);
}

if (failed) {
  console.error(
    "\n❌ New GraphQL exposure or SECURITY DEFINER execute warnings detected.\n" +
      "Either remediate the new finding or, if intentionally accepted, update " +
      "supabase/lint-baseline.json with justification in the PR description."
  );
  process.exit(1);
}
console.log("\n✅ No new monitored warnings.");
