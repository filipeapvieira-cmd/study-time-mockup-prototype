import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, "artifacts", "a11y", "raw");
const AXE_DIR = path.join(RAW_DIR, "axe");
const REPORT_DIR = path.join(ROOT, "artifacts", "a11y");
const REPORT_PATH = path.join(REPORT_DIR, "summary.md");
const JSON_SUMMARY_PATH = path.join(REPORT_DIR, "summary.json");

const IMPACT_ORDER = ["critical", "serious", "moderate", "minor", "unknown"];

async function readJsonIfExists(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function listJsonFiles(directoryPath) {
  try {
    const entries = await readdir(directoryPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => path.join(directoryPath, entry.name));
  } catch {
    return [];
  }
}

function sortImpact(a, b) {
  return IMPACT_ORDER.indexOf(a) - IMPACT_ORDER.indexOf(b);
}

async function main() {
  await mkdir(REPORT_DIR, { recursive: true });

  const axeFiles = await listJsonFiles(AXE_DIR);
  const axeEntries = (await Promise.all(axeFiles.map((file) => readJsonIfExists(file, null))))
    .filter(Boolean);

  const eslintRaw = await readJsonIfExists(path.join(RAW_DIR, "eslint-a11y.json"), []);
  const lighthouseSummary = await readJsonIfExists(
    path.join(RAW_DIR, "lighthouse", "index.json"),
    null
  );

  const violations = axeEntries.flatMap((entry) =>
    (entry.violations ?? []).map((violation) => ({
      routeId: entry.routeId,
      routePath: entry.routePath,
      theme: entry.theme,
      project: entry.project,
      id: violation.id,
      impact: violation.impact ?? "unknown",
      nodeCount: Array.isArray(violation.nodes) ? violation.nodes.length : 0,
      help: violation.help,
      helpUrl: violation.helpUrl,
    }))
  );

  const impactCounts = violations.reduce((acc, item) => {
    acc[item.impact] = (acc[item.impact] ?? 0) + 1;
    return acc;
  }, {});

  const topRules = Object.values(
    violations.reduce((acc, item) => {
      const key = item.id;
      if (!acc[key]) {
        acc[key] = {
          id: item.id,
          impact: item.impact,
          count: 0,
          nodes: 0,
          help: item.help,
          helpUrl: item.helpUrl,
        };
      }
      acc[key].count += 1;
      acc[key].nodes += item.nodeCount;
      return acc;
    }, {})
  )
    .sort((a, b) => {
      const impactDelta = sortImpact(a.impact, b.impact);
      if (impactDelta !== 0) return impactDelta;
      return b.count - a.count;
    })
    .slice(0, 10);

  const routeThemeHotspots = Object.values(
    violations.reduce((acc, item) => {
      const key = `${item.routePath}::${item.theme}::${item.project}`;
      if (!acc[key]) {
        acc[key] = {
          routePath: item.routePath,
          theme: item.theme,
          project: item.project,
          count: 0,
        };
      }
      acc[key].count += 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const jsxA11yIssues = Array.isArray(eslintRaw)
    ? eslintRaw.reduce((count, fileResult) => {
        const messages = Array.isArray(fileResult?.messages) ? fileResult.messages : [];
        return (
          count +
          messages.filter(
            (message) =>
              typeof message?.ruleId === "string" && message.ruleId.startsWith("jsx-a11y/")
          ).length
        );
      }, 0)
    : 0;

  const lighthouseScores = Array.isArray(lighthouseSummary?.results)
    ? lighthouseSummary.results
        .filter((result) => typeof result?.accessibilityScore === "number")
        .map((result) => ({
          routePath: result.routePath,
          score: result.accessibilityScore,
        }))
    : [];

  const lighthouseAverage =
    lighthouseScores.length > 0
      ? Math.round(
          lighthouseScores.reduce((sum, item) => sum + item.score, 0) /
            lighthouseScores.length
        )
      : null;

  const summaryJson = {
    generatedAt: new Date().toISOString(),
    scanCount: axeEntries.length,
    violationCount: violations.length,
    impactCounts,
    topRules,
    routeThemeHotspots,
    eslint: {
      jsxA11yIssues,
    },
    lighthouse: {
      successCount: lighthouseSummary?.successCount ?? 0,
      totalCount: lighthouseSummary?.totalCount ?? 0,
      averageAccessibilityScore: lighthouseAverage,
      scores: lighthouseScores,
    },
  };

  const lines = [
    "# Accessibility Audit Summary",
    "",
    `Generated: ${summaryJson.generatedAt}`,
    "",
    "## Coverage",
    `- Axe scans: ${summaryJson.scanCount}`,
    `- Total violations: ${summaryJson.violationCount}`,
    `- JSX a11y lint findings: ${jsxA11yIssues}`,
    `- Lighthouse runs: ${summaryJson.lighthouse.successCount}/${summaryJson.lighthouse.totalCount}`,
    `- Lighthouse average accessibility score: ${
      lighthouseAverage === null ? "n/a" : `${lighthouseAverage}/100`
    }`,
    "",
    "## Priority Buckets",
    `- P0 (critical + serious): ${(impactCounts.critical ?? 0) + (impactCounts.serious ?? 0)}`,
    `- P1 (moderate): ${impactCounts.moderate ?? 0}`,
    `- P2 (minor + unknown): ${(impactCounts.minor ?? 0) + (impactCounts.unknown ?? 0)}`,
    "",
    "## Top Rules",
    ...topRules.map(
      (item) =>
        `- \`${item.id}\` (${item.impact}) - ${item.count} occurrences across ${item.nodes} failing node(s)`
    ),
    "",
    "## Route/Theme Hotspots",
    ...routeThemeHotspots.map(
      (item) =>
        `- ${item.routePath} [${item.theme}] (${item.project}) - ${item.count} violation(s)`
    ),
    "",
    "## Artifacts",
    "- Raw axe results: `artifacts/a11y/raw/axe/*.json`",
    "- Raw eslint output: `artifacts/a11y/raw/eslint-a11y.json`",
    "- Raw lighthouse output: `artifacts/a11y/raw/lighthouse/`",
    "- Machine summary: `artifacts/a11y/summary.json`",
  ];

  await writeFile(REPORT_PATH, lines.join("\n"), "utf8");
  await writeFile(JSON_SUMMARY_PATH, JSON.stringify(summaryJson, null, 2), "utf8");
}

main();
